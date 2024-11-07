# Summary of Solutions for `create.tsx`

## Overview
The `CreateMemePage` component allows users to upload an image, add a description, and add captions over the image. Users can create as many captions as they like and position them anywhere on the image. Once submitted, the user is redirected to the homepage to view their newly created meme.

## Key Solutions Implemented

### 1. State Management
- **Picture State**: Managed using `useState` to store the uploaded picture.
- **Texts State**: Managed using `useState` to store the captions.
- **Description State**: Managed using `useState` to store the meme description.

### 2. Image Upload
- **Handle Drop**: Implemented `handleDrop` function to handle image uploads using the `MemeEditor` component.

### 3. Caption Management
- **Add Caption**: Implemented `handleAddCaptionButtonClick` function to add new captions.
- **Delete Caption**: Implemented `handleDeleteCaptionButtonClick` function to delete captions.
- **Change Caption**: Implemented `handleCaptionChange` function to update caption content.

### 4. Form Submission
- **Handle Submit**: Implemented `handleSubmit` function to handle form submission, sending data to the `/api/memes` endpoint.
- **Token Retrieval**: Retrieved the authentication token from local storage to include in the API request.

### 5. API Integration
- **Create Meme API**: Integrated the `createMeme` function from the `api.ts` file to send a `POST` request with the required `multipart/form-data` body.

### 6. Redirection
- **Redirect to Homepage**: Redirected the user to the homepage after successful meme creation using `window.location.href = "/"`.

## Detailed Code Changes

### State Management

```tsx
const [picture, setPicture] = useState<Picture | null>(null);
const [texts, setTexts] = useState<MemePictureProps["texts"]>([]);
const [description, setDescription] = useState<string>("");

### Image Upload
const handleDrop = (file: File) => {
  setPicture({
    url: URL.createObjectURL(file),
    file,
  });
};

### Caption Management

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

const handleDeleteCaptionButtonClick = (index: number) => {
  setTexts(texts.filter((_, i) => i !== index));
};

const handleCaptionChange = (index: number, content: string) => {
  const newTexts = [...texts];
  newTexts[index].content = content;
  setTexts(newTexts);
};

### Form Submission

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!picture) return;

  const token = localStorage.getItem("auth-token"); // Retrieve the token from local storage

  if (!token) {
    console.error("No auth token found");
    return;
  }

  try {
    await createMeme(
      token,
      picture.file,
      description,
      texts
    );
    // Redirect to homepage
    window.location.href = "/";
  } catch (error) {
    console.error("Error creating meme:", error);
  }
};

### API Integration
import { createMeme } from "../../api"; // Import the createMeme function

### Redirection
window.location.href = "/"; // Redirect to homepage

The CreateMemePage component is now complete and functional, allowing users to create memes with captions and descriptions. The component handles image uploads, caption management, form submission, and redirection to the homepage after successful meme creation.

### createMemePage.tsx

export type CreateMemeResponse = {
  id: string;
  pictureUrl: string;
  description: string;
  texts: {
    content: string;
    x: number;
    y: number;
  }[];
  createdAt: string;
}

/**
 * Create a meme
 * @param token
 * @param picture
 * @param description
 * @param texts
 * @returns
 */
export async function createMeme(
  token: string,
  picture: File,
  description: string,
  texts: { content: string; x: number; y: number }[]
): Promise<CreateMemeResponse> {
  const formData = new FormData();
  formData.append("Picture", picture);
  formData.append("Description", description);
  texts.forEach((text, index) => {
    formData.append(`Texts[${index}][Content]`, text.content);
    formData.append(`Texts[${index}][X]`, text.x.toString());
    formData.append(`Texts[${index}][Y]`, text.y.toString());
  });

  return await fetch(`${BASE_URL}/memes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  }).then(res => checkStatus(res).json());
}
