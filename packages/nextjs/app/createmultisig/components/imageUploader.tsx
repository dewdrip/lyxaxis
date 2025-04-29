// src/components/ProfileEditor.tsx
import { Dispatch, FC, SetStateAction } from "react";
import { CoverImageUploader } from "./CoverImageUploader";
import { ProfileImageUploader } from "./ProfileImageUploader";
import { UploadedImageData } from "~~/hooks/useProfileMetadata";

interface ProfileEditorProps {
  setFieldValue: (field: string, value: string) => void;
  setProfileImage: Dispatch<SetStateAction<UploadedImageData[]>>;
  setBackgroundImage: Dispatch<SetStateAction<UploadedImageData[]>>;
  setBackgroundImageFile: Dispatch<SetStateAction<File | null>>;
  setProfileImageFile: Dispatch<SetStateAction<File | null>>;
  profileImageUrl?: string;
  backgroundImageUrl?: string;
}

export const ImageUploader: FC<ProfileEditorProps> = ({
  setFieldValue,
  setBackgroundImage,
  setProfileImage,
  setBackgroundImageFile,
  setProfileImageFile,
  profileImageUrl,
  backgroundImageUrl,
}) => {
  return (
    <div className="relative">
      <CoverImageUploader
        setFieldValue={setFieldValue}
        setUploadedImage={setBackgroundImage}
        setCoverImageFile={setBackgroundImageFile}
        existingImage={backgroundImageUrl}
      />
      <ProfileImageUploader
        setFieldValue={setFieldValue}
        setUploadedImage={setProfileImage}
        setProfileFile={setProfileImageFile}
        existingImage={profileImageUrl}
      />
    </div>
  );
};
