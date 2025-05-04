// src/hooks/useImageUploader.ts
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { UploadedImageData } from "~~/hooks/useProfileMetadata";

export function useImageSetter(
  setUploadedImage: Dispatch<SetStateAction<UploadedImageData[]>>,
  existingImage?: string,
) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(existingImage || "");
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [, setError] = useState<string | null>(null);

  const handleImageClear = () => {
    setFile(null);
    setPreviewUrl("");
    setUploadedImage([]);
    setIsPreviewVisible(false);
    setUploadProgress(0);
  };

  const handleFileChange = (file: File) => {
    setFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setIsPreviewVisible(true);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) {
      handleFileChange(file);
    } else {
      setError("Please select a valid image file.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected?.type.startsWith("image/")) {
      handleFileChange(selected);
    } else {
      setError("Please select a valid image file.");
    }
  };

  return {
    file,
    previewUrl,
    isPreviewVisible,
    inputFileRef,
    handleInputChange,
    handleDrop,
    handleImageClear,
    isLoading,
    uploadProgress,
    setIsLoading,
  };
}
