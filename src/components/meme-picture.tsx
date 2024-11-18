import { Box, Text } from "@chakra-ui/react";
import { useMemo, useRef, memo, useState } from "react";
import { useSize } from "@chakra-ui/react-use-size";
import { MemePictureProps } from "../types";
import { calculateDimensions } from "../lib/utils";
import { REF_HEIGHT } from "../lib/constants";
import Loader from "./loader";

// Memoized component to prevent unnecessary re-renders
const MemeText = memo(
  ({
    text,
    fontSize,
    dataTestId,
    index,
  }: {
    text: { content: string; x: number; y: number };
    fontSize: number;
    dataTestId: string;
    index: number;
  }) => {
    console.log("Content -> ", text.content);

    return (
      <Text
        position="absolute"
        left={`${text.x}px`}
        top={`${text.y}px`}
        fontSize={`${fontSize}px`}
        color="white"
        fontFamily="Impact"
        fontWeight="bold"
        userSelect="none"
        textTransform="uppercase"
        textAlign="center"
        style={{
          WebkitTextStroke: "2px black",
          textShadow: `-2px -2px 0 #000, 
                 2px -2px 0 #000,
                 -2px 2px 0 #000,
                 2px 2px 0 #000`,
        }}
        data-testid={`${dataTestId}-text-${index}`}
      >
        {text.content}
      </Text>
    );
  }
);

MemeText.displayName = "MemeText";

export const MemePicture: React.FC<MemePictureProps> = ({
  pictureUrl,
  texts: rawTexts,
  dataTestId = "",
}) => {
  // Reference to the container element
  const containerRef = useRef<HTMLDivElement>(null);

  // Get the dimensions of the container using the useSize hook
  const dimensions = useSize(containerRef);
  const boxWidth = dimensions?.width ?? 0;

  // State to handle image loading errors
  const [imageError, setImageError] = useState(false);

  // Memoized calculation of dimensions to prevent unnecessary re-renders
  const { height, fontSize, texts } = useMemo(
    () => calculateDimensions(boxWidth, rawTexts),
    [boxWidth, rawTexts]
  );

  return (
    <Box
      width="full"
      height={height || REF_HEIGHT}
      ref={containerRef}
      backgroundImage={imageError ? undefined : `url(${pictureUrl})`}
      backgroundColor="gray.100"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      backgroundSize="contain"
      overflow="hidden"
      position="relative"
      borderRadius="8px"
      data-testid={dataTestId}
      role="img"
      aria-label="Meme image with text"
      onError={() => setImageError(true)}
    >
      {/* Display error message if image fails to load */}
      {imageError && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
        >
          <Text color="red.500">Failed to load image</Text>
        </Box>
      )}
      {/* Display loader while dimensions are being calculated */}
      {!boxWidth && !imageError && <Loader />}
      {/* Render the text overlays on the meme picture */}
      {texts.map((text, index) => {
        return (
          <MemeText
            key={`${text.content}-${index}`}
            text={text}
            fontSize={fontSize}
            dataTestId={dataTestId}
            index={index}
          />
        );
      })}
    </Box>
  );
};

export default memo(MemePicture);
