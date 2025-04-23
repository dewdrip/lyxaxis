// src/components/ProfileEditor.tsx
import { Dispatch, FC, SetStateAction } from "react";
import { CoverImageUploader } from "./CoverImageUploader";
import { ProfileImageUploader } from "./ProfileImageUploader";
import { UploadedImageData } from "~~/hooks/useProfileMetadata";

interface ProfileEditorProps {
  setFieldValue: (field: string, value: string) => void;
  setProfileImage: Dispatch<SetStateAction<UploadedImageData[]>>;
  setBackgroundImage: Dispatch<SetStateAction<UploadedImageData[]>>;
}

export const ImageUploader: FC<ProfileEditorProps> = ({ setFieldValue, setBackgroundImage, setProfileImage }) => {
  return (
    <div className="relative">
      <CoverImageUploader setFieldValue={setFieldValue} setUploadedImage={setBackgroundImage} />
      <ProfileImageUploader setFieldValue={setFieldValue} setUploadedImage={setProfileImage} />
    </div>
  );
};
