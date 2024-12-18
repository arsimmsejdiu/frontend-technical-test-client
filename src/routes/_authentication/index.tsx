import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Avatar,
  VStack,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import { format } from "timeago.js";
import {
  createMemeComment,
  getMemeComments,
  getMemes,
  getUserById,
} from "../../api";
import Loader from "../../components/loader";
import { MemePicture } from "../../components/meme-picture";
import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router"; // Import createFileRoute
import { useAuthToken } from "../../contexts/authHooks";
import useAuthCheck from "../../hook/useAuthCheck";

const MemeFeedPage: React.FC = () => {
  useAuthCheck();
  const token = useAuthToken();
  const queryClient = useQueryClient();
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [commentContent, setCommentContent] = useState<{
    [key: string]: string;
  }>({});
  const [expandedComments, setExpandedComments] = useState<{
    [key: string]: boolean;
  }>({});

  const {
    data: memes,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["memes", page],
    queryFn: async () => {
      const memes = await getMemes(token, page);
      const memesWithDetails = await Promise.all(
        memes.results.map(async (meme) => {
          const author = await getUserById(token, meme.authorId);
          const comments = await getMemeComments(token, meme.id, 1);
          const commentsWithAuthor = await Promise.all(
            comments.results.map(async (comment) => {
              const author = await getUserById(token, comment.authorId);
              return { ...comment, author };
            })
          );
          return { ...meme, author, comments: commentsWithAuthor };
        })
      );
      return memesWithDetails;
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({
      memeId,
      content,
    }: {
      memeId: string;
      content: string;
    }) => {
      await createMemeComment(token, memeId, content);
    },
    onSuccess: (_, { memeId }) => {
      queryClient.invalidateQueries({ queryKey: ["memes"] });
      // Clear the comment input field after successful submission
      setCommentContent((prev) => ({ ...prev, [memeId]: "" }));
    },
  });

  const handleAddComment = useCallback(
    (memeId: string, content: string) => {
      addCommentMutation.mutate({ memeId, content });
    },
    [addCommentMutation]
  );

  const handleCommentChange = useCallback((memeId: string, value: string) => {
    setCommentContent((prev) => ({ ...prev, [memeId]: value }));
  }, []);

  const handleToggleComments = useCallback((memeId: string) => {
    setExpandedComments((prev) => ({ ...prev, [memeId]: !prev[memeId] }));
  }, []);

  // const memoizedMemes = useMemo(() => memes, [memes]);
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredMemes = useMemo(() => {
    if (!memes) return [];
    return memes.filter((meme) =>
      meme.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [memes, searchQuery]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <VStack spacing={4} p={4} align="stretch" width="full">
      <FormControl>
        <FormLabel>Search by description</FormLabel>
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </FormControl>
      <SimpleGrid columns={[1, 2, 3]} spacing={4}>
        {filteredMemes?.map((meme) => (
          <Box key={meme.id} p={4} borderWidth={1} borderRadius="md">
            <MemePicture pictureUrl={meme.pictureUrl} texts={meme.texts} />
            <Text mt={2}>{meme.description}</Text>
            <Text mt={2} fontSize="sm" color="gray.500">
              Posted by {meme.author.username} {format(meme.createdAt)}
            </Text>
            <VStack mt={4} spacing={2} align="stretch">
              {meme.comments
                .slice(0, expandedComments[meme.id] ? meme.comments.length : 3)
                .map((comment) => (
                  <Flex key={comment.id}>
                    <Avatar
                      borderWidth="1px"
                      borderColor="gray.300"
                      size="sm"
                      name={comment.author.username}
                      src={comment.author.pictureUrl}
                      mr={2}
                    />
                    <Box p={2} borderRadius={8} bg="gray.50" flexGrow={1}>
                      <Flex justifyContent="space-between" alignItems="center">
                        <Text
                          data-testid={`meme-comment-author-${meme.id}-${comment.id}`}
                        >
                          {comment.author.username}
                        </Text>
                        <Text
                          fontStyle="italic"
                          color="gray.500"
                          fontSize="small"
                        >
                          {format(comment.createdAt)}
                        </Text>
                      </Flex>
                      <Text
                        color="gray.500"
                        whiteSpace="pre-line"
                        data-testid={`meme-comment-content-${meme.id}-${comment.id}`}
                      >
                        {comment.content}
                      </Text>
                    </Box>
                  </Flex>
                ))}
              {meme.comments.length > 3 && (
                <Button size="sm" onClick={() => handleToggleComments(meme.id)}>
                  {expandedComments[meme.id] ? "Show less" : "Show more"}
                </Button>
              )}
            </VStack>
            <FormControl mt={4}>
              <FormLabel>Add a comment</FormLabel>
              <Input
                placeholder="Type your comment here..."
                onChange={(event) =>
                  handleCommentChange(meme.id, event.target.value)
                }
                value={commentContent[meme.id] || ""}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const content = e.currentTarget.value;
                    if (content.trim()) {
                      handleAddComment(meme.id, content);
                    }
                  }
                }}
              />
            </FormControl>
          </Box>
        ))}
      </SimpleGrid>
      <Flex p={5} justifyContent="flex-start" mt={4} gap={4}>
        <Button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          isDisabled={page === 1}
          size="md"
          width={"full"}
        >
          Previous
        </Button>
        <Button
          onClick={() => setPage((prev) => prev + 1)}
          isDisabled={isFetching}
          size="md"
          width={"full"}
        >
          Next
        </Button>
      </Flex>
    </VStack>
  );
};

export const Route = createFileRoute("/_authentication/")({
  component: MemeFeedPage,
});

export default MemeFeedPage;
