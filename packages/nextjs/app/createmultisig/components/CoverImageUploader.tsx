// src/components/CoverImageUploader.tsx
import { Dispatch, FC, SetStateAction, useEffect } from "react";
import { useImageSetter } from "../hooks/useImageSetter";
import { useImageUploader } from "../hooks/useImageUploader";
import { FaCheck, FaRedo } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { UploadedImageData } from "~~/hooks/useProfileMetadata";

interface Props {
  setUploadedImage: Dispatch<SetStateAction<UploadedImageData[]>>;
  existingImage?: string;
}

export const CoverImageUploader: FC<Props> = ({ setUploadedImage, existingImage }) => {
  const { file, previewUrl, inputFileRef, handleDrop, handleInputChange, handleImageClear } = useImageSetter(
    setUploadedImage,
    existingImage,
  );

  const { upload: uploadImage, isUploading, error } = useImageUploader({ enabled: false });

  const handleUpload = async () => {
    try {
      if (!file) {
        return;
      }

      const imageData = {
        name: file.name,
        type: file.type,
        uri: URL.createObjectURL(file),
        file: file,
      };
      const url = await uploadImage(imageData);

      if (url) {
        setUploadedImage([
          {
            width: 1500,
            height: 500,
            verification: {
              method: "keccak256(bytes)",
              data: "0x",
            },
            url: `ipfs://${url.ipfsHash}`,
          },
        ]);

        // setFieldValue("Image", url);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  useEffect(() => {
    if (file) {
      handleUpload();
    }
  }, [file]);

  return (
    <div className="relative w-full">
      <img
        className={`w-full h-[120px] object-cover rounded-lg mb-2 ${previewUrl ? "" : "hidden"}`}
        alt="Cover Preview"
        src={previewUrl}
      />
      {previewUrl && (
        <button
          className="absolute top-2 right-2 p-1 bg-gray bg-opacity-50 rounded-full hover:bg-opacity-70"
          onClick={handleImageClear}
        >
          <MdCancel className="text-white" size={32} />
        </button>
      )}

      {previewUrl && (
        <div className="absolute right-2 bottom-4">
          {isUploading ? (
            <div className="bg-white text-black flex items-center justify-center text-xs font-medium w-6 rounded-full py-1">
              <span className="w-4 loading loading-spinner"></span>
            </div>
          ) : error ? (
            <button
              className="bg-white text-red-500 flex items-center justify-center text-xs font-medium w-6 rounded-full py-1 hover:bg-gray-200 transition-all"
              onClick={() => file && handleUpload()}
            >
              <FaRedo size={16} />
            </button>
          ) : (
            <div className="bg-white text-green-500 flex items-center justify-center text-xs font-medium w-6 rounded-full py-1">
              <FaCheck size={16} />
            </div>
          )}
        </div>
      )}

      {!previewUrl && (
        <>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="coverUpload"
            ref={inputFileRef}
            onChange={handleInputChange}
          />
          <label
            htmlFor="coverUpload"
            className="flex flex-col h-[120px] w-full border-dashed border-2 border-gray rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            onDragOver={e => {
              e.preventDefault();
            }}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center py-3">
              <div className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to set cover image</span> or drag and drop
              </div>
              <div className="text-xs text-gray-500">PNG, JPG, GIF up to 4MB</div>
            </div>
          </label>
        </>
      )}
    </div>
  );
};
