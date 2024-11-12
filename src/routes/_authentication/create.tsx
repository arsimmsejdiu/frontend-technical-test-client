import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import MemeEditor from "../../components/meme-editor";
import { useMemo, useState } from "react";
import { Plus, Trash } from "@phosphor-icons/react";
import { MemePictureProps, Picture } from "../../types";
import { createMeme } from "../../api";

// Define the route for the CreateMemePage component
export const Route = createFileRoute("/_authentication/create")({
  component: CreateMemePage,
});

function CreateMemePage() {
  // State to store the uploaded picture
  const [picture, setPicture] = useState<Picture | null>(null);
  // State to store the captions
  const [texts, setTexts] = useState<MemePictureProps["texts"]>([]);
  // State to store the description
  const [description, setDescription] = useState<string>("");

  console.log(texts)

  // Handle the drop event to upload a picture
  const handleDrop = (file: File) => {
    setPicture({
      url: URL.createObjectURL(file),
      file,
    });
  };

  // Handle the event to add a new caption
  const handleAddCaptionButtonClick = () => {
    setTexts([
      ...texts,
      {
        content: `New caption ${texts.length + 1}`,
        x: Math.random() * 400,
        y: Math.random() * 225,
      },
    ]);
  };

  // Handle the event to delete a caption
  const handleDeleteCaptionButtonClick = (index: number) => {
    setTexts(texts.filter((_, i) => i !== index));
  };

  // Handle the event to change the content of a caption
  const handleCaptionChange = (index: number, content: string) => {
    const newTexts = [...texts];
    newTexts[index].content = content;
    setTexts(newTexts);
  };

  // Memoize the meme picture object to avoid unnecessary re-renders
  const memePicture = useMemo(() => {
    if (!picture) {
      return undefined;
    }

    console.log('Current picture:', picture);
    console.log('Current texts:', texts);

    return {
      pictureUrl: picture.url,
      texts: texts.map(text => ({
        ...text,
        x: Number(text.x),
        y: Number(text.y)
      }))
    };
  }, [picture, texts]);

  // Handle the form submission to create a meme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!picture) return;

    const token = localStorage.getItem("auth-token"); // Retrieve the token from local storage

    if (!token) {
      console.error("No auth token found");
      return;
    }

    try {
      await createMeme(token, picture.file, description, texts);
      setPicture(null);
      setTexts([]);
      setDescription("");
      window.location.href = "/";
    } catch (error) {
      console.error("Error creating meme:", error);
    }
  };

  return (
    <Flex width="full" height="full" as="form" onSubmit={handleSubmit}>
      <Box flexGrow={1} height="full" p={4} overflowY="auto">
        <VStack spacing={5} align="stretch">
          <Box>
            <Heading as="h2" size="md" mb={2}>
              Upload your picture
            </Heading>
            <MemeEditor onDrop={handleDrop} memePicture={memePicture} />
          </Box>
          <Box>
            <Heading as="h2" size="md" mb={2}>
              Describe your meme
            </Heading>
            <Textarea
              placeholder="Type your description here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Box>
        </VStack>
      </Box>
      <Flex
        flexDir="column"
        width="30%"
        minW="250"
        height="full"
        boxShadow="lg"
      >
        <Heading as="h2" size="md" mb={2} p={4}>
          Add your captions
        </Heading>
        <Box p={4} flexGrow={1} height={0} overflowY="auto">
          <VStack>
            {texts.map((text, index) => (
              <Flex width="full" key={index}>
                <Input
                  onChange={(e) => handleCaptionChange(index, e.target.value)}
                  placeholder={`Caption ${index + 1}`}
                  value={text.content}
                  mr={1}
                />
                <IconButton
                  onClick={() => handleDeleteCaptionButtonClick(index)}
                  aria-label="Delete caption"
                  icon={<Icon as={Trash} />}
                />
              </Flex>
            ))}
            <Button
              colorScheme="cyan"
              leftIcon={<Icon as={Plus} />}
              variant="ghost"
              size="sm"
              width="full"
              onClick={handleAddCaptionButtonClick}
              isDisabled={memePicture === undefined}
            >
              Add a caption
            </Button>
          </VStack>
        </Box>
        <HStack p={4}>
          <Button
            as={Link}
            to="/"
            colorScheme="cyan"
            variant="outline"
            size="sm"
            width="full"
          >
            Cancel
          </Button>
          <Button
            colorScheme="cyan"
            size="sm"
            width="full"
            color="white"
            type="submit"
            isDisabled={memePicture === undefined}
          >
            Submit
          </Button>
        </HStack>
      </Flex>
    </Flex>
  );
}

export default CreateMemePage;