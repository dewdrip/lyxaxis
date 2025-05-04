// src/components/ProfileEditor.tsx
import { Dispatch, FC, SetStateAction } from "react";
import { CoverImageUploader } from "./CoverImageUploader";
import { ProfileImageUploader } from "./ProfileImageUploader";
import { UploadedImageData } from "~~/hooks/useProfileMetadata";

interface ProfileEditorProps {
  setProfileImage: Dispatch<SetStateAction<UploadedImageData[]>>;
  setBackgroundImage: Dispatch<SetStateAction<UploadedImageData[]>>;
  profileImageUrl?: string;
  backgroundImageUrl?: string;
}

export const ImageUploader: FC<ProfileEditorProps> = ({
  setBackgroundImage,
  setProfileImage,
  profileImageUrl,
  backgroundImageUrl,
}) => {
  return (
    <div className="relative">
      <CoverImageUploader setUploadedImage={setBackgroundImage} existingImage={backgroundImageUrl} />
      <ProfileImageUploader setUploadedImage={setProfileImage} existingImage={profileImageUrl} />
    </div>
  );
};
