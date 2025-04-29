import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RiEditBoxFill } from "react-icons/ri";
import { useIsMounted } from "usehooks-ts";
import { isAddress } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { PlusCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { BackButton } from "~~/app/createmultisig/components/BackButton";
import { ImageUploader } from "~~/app/createmultisig/components/imageUploader";
import { Address, AddressInput, InputBase } from "~~/components/scaffold-eth";
import { UploadedImageData } from "~~/hooks/useProfileMetadata";

export const EditProfileForm = ({
  profileImage,
  backgroundImage,
  description,
  setDescription,
  setProfileImage,
  setBackgroundImage,
  handleCreate,
  isCreateWalletLoading,
  setBackgroundImageFile,
  setProfileImageFile,
}: {
  handleCreate: () => Promise<void>;
  profileImage: UploadedImageData[];
  backgroundImage: UploadedImageData[];
  description: string;
  setProfileImage: Dispatch<SetStateAction<UploadedImageData[]>>;
  setBackgroundImage: Dispatch<SetStateAction<UploadedImageData[]>>;
  setBackgroundImageFile: Dispatch<SetStateAction<File | null>>;
  setProfileImageFile: Dispatch<SetStateAction<File | null>>;
  setDescription: Dispatch<SetStateAction<string>>;
  isCreateWalletLoading: boolean;
}) => {
  let { id: multisigAddress } = useParams();
  const { data: walletClient } = useWalletClient();

  return useIsMounted() ? (
    <div className="flex flex-col flex-1 items-center  gap-8 px-4">
      <div className="flex  flex-col flex-grow w-full max-w-lg">
        <div className="mt-5 mb-2">
          <BackButton action={() => 0} isRequiredPage={true} />
          <div className="text-left text-xl mt-2">Update Your Multisig UP Profile</div>
          <div className="text-xs max-w-[350px] ">Create proposal to update profile details</div>
        </div>

        <div className="flex flex-col gap-y-6 bg-base-200 border border-gray rounded-xl w-full">
          <ImageUploader
            setFieldValue={async (field: string, value: string): Promise<void> => {
              // Handle the image upload field value setting
              console.log(field, value);
            }}
            setBackgroundImageFile={setBackgroundImageFile}
            setProfileImageFile={setProfileImageFile}
            setBackgroundImage={setBackgroundImage}
            setProfileImage={setProfileImage}
          />
          <div className="px-2 flex flex-col gap-y-6 pb-6">
            <div className="flex flex-col gap-y-4">
              <div className="flex flex-col gap-y-1">
                <label className="label p-0">
                  <span className="label-text">Update Multisig Description</span>
                </label>
                <InputBase
                  value={description}
                  placeholder={"Brief Description"}
                  onChange={(value: string) => setDescription(value)}
                />
              </div>
            </div>
            <div className="mt-2 flex items-center justify-center px-6">
              <button
                className="w-fit px-3 btn btn-primary btn-sm h-[2.5rem] rounded-xl"
                disabled={!walletClient || isCreateWalletLoading}
                onClick={handleCreate}
              >
                {isCreateWalletLoading ? "Creating..." : "Create Proposal"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};
