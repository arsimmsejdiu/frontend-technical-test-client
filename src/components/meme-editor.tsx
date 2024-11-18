import { useDropzone } from "react-dropzone";
import { MemePicture } from "./meme-picture";
import { AspectRatio, Box, Button, Icon, Text } from "@chakra-ui/react";
import { Image, Pencil } from "@phosphor-icons/react";
import { MemeEditorProps, MemePictureProps } from "../types";
import { memo, useCallback } from "react";

// Component to render when no picture is selected
// Placeholder component for when no picture is selected
const RenderNoPicture = () => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="center"
    height="full"
    color="gray.500"
    textAlign="center"
    p={4}
  >
    <Box>
      <Icon as={Image} boxSize={12} mb={2} />
      <Text fontSize="lg">Drag & drop an image here, or click to select one</Text>
      <Text fontSize="sm" color="gray.400">
        (Only *.png and *.jpg images will be accepted)
      </Text>
    </Box>
  </Box>
);

// Component to render the selected meme picture with an option to change it
const RenderMemePicture = memo(
  ({
    memePicture,
    open,
  }: {
    memePicture: MemePictureProps;
    open: () => void;
  }) => (
    <Box
      width="full"
      height="full"
      position="relative"
      __css={{
        "&:hover .change-picture-button": {
          display: "inline-block",
        },
        "& .change-picture-button": {
          display: "none",
        },
      }}
    >
      <MemePicture {...memePicture} />
      <Button
        className="change-picture-button"
        leftIcon={<Icon as={Pencil} boxSize={4} />}
        colorScheme="cyan"
        color="white"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        position="absolute"
        onClick={open}
      >
        Change picture
      </Button>
    </Box>
  )
);

// Main MemeEditor component
const MemeEditor: React.FC<MemeEditorProps> = ({ onDrop, memePicture }) => {
  // Callback function to handle file drop
  const onDropCallback = useCallback(
    (files: File[]) => {
      if (files.length === 0) {
        console.error("No files were dropped.");
        return;
      }
      onDrop(files[0]);
    },
    [onDrop]
  );

  // Setting up the dropzone
  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop: onDropCallback,
    noClick: !!memePicture, // Disable click if a picture is already selected
    accept: { "image/png": [".png"], "image/jpg": [".jpg"] }, // Accept only PNG and JPG files
  });

  return (
    <AspectRatio ratio={16 / 9}>
      <Box
        {...getRootProps()}
        width="full"
        position="relative"
        border={!memePicture ? "2px dashed" : undefined}
        borderColor="gray.300"
        borderRadius="md"
        cursor="pointer"
        px={1}
        _hover={{
          borderColor: "gray.500",
        }}
        transition="border-color 0.2s"
      >
        <input {...getInputProps()} />
        {/* Conditional rendering based on whether a meme picture is available
            If memePicture is available, render the meme picture with an option to change it
            Otherwise, render a placeholder indicating no picture is selected 
        */}
        {memePicture ? (
          <RenderMemePicture memePicture={memePicture} open={open} />
        ) : (
          <RenderNoPicture />
        )}
      </Box>
    </AspectRatio>
  );
};

// Exporting the MemeEditor component wrapped in React.memo to prevent unnecessary re-renders
export default memo(MemeEditor);