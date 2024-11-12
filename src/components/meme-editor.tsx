import { useDropzone } from "react-dropzone";
import { MemePicture } from "./meme-picture";
import { AspectRatio, Box, Button, Flex, Icon, Text } from "@chakra-ui/react";
import { Image, Pencil } from "@phosphor-icons/react";
import { MemeEditorProps, MemePictureProps } from "../types";
import { memo, useCallback } from "react";

// Component to render when no picture is selected
const RenderNoPicture = memo(() => (
  <Flex
    flexDir="column"
    width="full"
    height="full"
    alignItems="center"
    justifyContent="center"
  >
    <Icon as={Image} color="black" boxSize={16} />
    <Text>Select a picture</Text>
    <Text color="gray.400" fontSize="sm">
      or drop it in this area
    </Text>
  </Flex>
));

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
        border={!memePicture ? "1px dashed" : undefined}
        borderColor="gray.300"
        borderRadius={9}
        px={1}
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