export type MemePictureProps = {
  pictureUrl: string;
  texts: {
    content: string;
    x: number;
    y: number;
  }[];
  dataTestId?: string;
};

export type MemeEditorProps = {
  onDrop: (file: File) => void;
  memePicture?: MemePictureProps;
};
