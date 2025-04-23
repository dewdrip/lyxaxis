import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { BackButton } from "./BackButton";
import { ImageUploader } from "./imageUploader";
import { RiEditBoxFill } from "react-icons/ri";
import { useIsMounted } from "usehooks-ts";
import { isAddress } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { PlusCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Address, AddressInput, InputBase } from "~~/components/scaffold-eth";
import { UploadedImageData } from "~~/hooks/useProfileMetadata";

export const OptionalForm = ({
  profileImage,
  backgroundImage,
  description,
  setDescription,
  setProfileImage,
  setBackgroundImage,
  handleCreate,
  isCreateWalletLoading,

  pages,
  setPages,
}: {
  handleCreate: () => Promise<void>;
  profileImage: UploadedImageData[];
  backgroundImage: UploadedImageData[];
  description: string;
  setProfileImage: Dispatch<SetStateAction<UploadedImageData[]>>;
  setBackgroundImage: Dispatch<SetStateAction<UploadedImageData[]>>;
  setDescription: Dispatch<SetStateAction<string>>;
  isCreateWalletLoading: boolean;

  setPages: Dispatch<SetStateAction<number>>;
  pages: number;
}) => {
  const { data: walletClient } = useWalletClient();

  const { address: ownerAddress } = useAccount();

  return useIsMounted() ? (
    <div className="flex flex-col flex-1 items-center  gap-8 px-4">
      <div className="flex  flex-col flex-grow w-full max-w-lg">
        <div className="mt-5 mb-2">
          <BackButton action={() => setPages(0)} />
          <div className="text-left text-2xl mt-2">Give your Multisig a face</div>
          <div className="text-xs max-w-[350px] ">
            Add profile image and other meta data to your multisig. These details are optional and can be updated later
            by creating a proposal
          </div>
        </div>

        <div className="flex flex-col gap-y-6 bg-base-200 border border-gray rounded-xl w-full">
          <ImageUploader
            setFieldValue={async (field: string, value: string): Promise<void> => {
              // Handle the image upload field value setting
              console.log(field, value);
            }}
            setBackgroundImage={setBackgroundImage}
            setProfileImage={setProfileImage}
          />
          <div className="px-2 flex flex-col gap-y-6 pb-6">
            <div className="flex flex-col gap-y-4">
              <div className="flex flex-col gap-y-4">
                <label className="label p-0">
                  <span className="label-text">Add Multisig Description</span>
                </label>
                <InputBase
                  value={description}
                  placeholder={"Brief Description"}
                  onChange={(value: string) => setDescription(value)}
                />
              </div>
            </div>
            <div className="mt-2 flex justify-between px-6">
              <button
                className="w-fit px-12  btn btn-base-100 border-primary btn-sm h-[2.5rem] rounded-xl hover:border-primary"
                disabled={!walletClient || isCreateWalletLoading}
                onClick={handleCreate}
              >
                Skip
              </button>
              <button
                className="w-fit px-12  btn btn-primary btn-sm h-[2.5rem] rounded-xl"
                disabled={!walletClient || isCreateWalletLoading}
                onClick={handleCreate}
              >
                {isCreateWalletLoading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};
