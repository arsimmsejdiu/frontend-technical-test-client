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
} from "@chakra-ui/react";
import { format } from "timeago.js";
import {
  createMemeComment,
  getMemeComments,
  getMemes,
  getUserById,
} from "../../api";
import { useAuthToken } from "../../contexts/authentication";
import Loader from "../../components/loader";
import { MemePicture } from "../../components/meme-picture";
import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router"; // Import createFileRoute

const MemeFeedPage: React.FC = () => {
  const token = useAuthToken();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [commentContent, setCommentContent] = useState<{
    [key: string]: string;
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

  const memoizedMemes = useMemo(() => memes, [memes]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <VStack spacing={4} align="stretch">
      {memoizedMemes?.map((meme) => (
        <Box key={meme.id} p={4} borderWidth={1} borderRadius="md">
          <MemePicture pictureUrl={meme.pictureUrl} texts={meme.texts} />
          <Text mt={2}>{meme.description}</Text>
          <Text mt={2} fontSize="sm" color="gray.500">
            Posted by {meme.author.username} {format(meme.createdAt)}
          </Text>
          <VStack mt={4} spacing={2} align="stretch">
            {meme.comments.map((comment) => (
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
                    <Text fontStyle="italic" color="gray.500" fontSize="small">
                      {format(new Date(comment.createdAt), "PPpp")}{" "}
                      {/* Format the date */}
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
      <Flex justifyContent="space-between" mt={4}>
        <Button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <Button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={isFetching}
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
