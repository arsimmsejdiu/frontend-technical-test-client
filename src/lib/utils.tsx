import { REF_FONT_SIZE, REF_HEIGHT, REF_WIDTH } from "./constants";
import { FormErrorMessage } from "@chakra-ui/react";
import { UnauthorizedError } from "../api"; // Adjust the import path as needed

interface MemeText {
  content: string;
  x: number;
  y: number;
}

export const calculateDimensions = (boxWidth: number, rawTexts: MemeText[]) => {
  const scale = boxWidth / REF_WIDTH || 1;

  const result = {
    height: scale * REF_HEIGHT,
    fontSize: scale * REF_FONT_SIZE,
    texts: rawTexts.map((text) => ({
      ...text,
      x: scale * text.x,
      y: scale * text.y,
    })),
  };
  
  return result;
};

export function renderError(error: Error) {
  if (error instanceof UnauthorizedError) {
    return <FormErrorMessage>Wrong credentials</FormErrorMessage>;
  }
  return (
    <FormErrorMessage>
      An unknown error occurred, please try again later
    </FormErrorMessage>
  );
}