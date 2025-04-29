"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { EditProfileForm } from "../components/EditProfileForm";
import type { NextPage } from "next";
import { useIsMounted } from "usehooks-ts";
import { useAccount, useWalletClient } from "wagmi";
import { BackButton } from "~~/app/createmultisig/components/BackButton";
import { ImageUploader } from "~~/app/createmultisig/components/imageUploader";
import { InputBase } from "~~/components/scaffold-eth";
import { toaster } from "~~/components/ui/toaster";
import { useCreateWallet } from "~~/hooks/contract/useCreateWallet";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { UploadedImageData, useProfileMetadata } from "~~/hooks/useProfileMetadata";
import { notification } from "~~/utils/scaffold-eth";

const EditMultiSigProfile: NextPage = () => {
  const router = useRouter();

  let { id: multisigAddress } = useParams();

  multisigAddress = multisigAddress as `0x${string}`;

  const { data: upAddress, isLoading: isUpAddressLoading } = useScaffoldReadContract({
    contractName: "MultiSig",
    functionName: "getUniversalProfile",
    contractAddress: multisigAddress,
  });

  const { profile, loading: profileLoading } = useProfileMetadata({
    address: upAddress as `0x${string}`,
    enabled: true,
  });

  const { address: ownerAddress } = useAccount();

  const [profileImage, setProfileImage] = useState<UploadedImageData[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<UploadedImageData[]>([]);

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null);

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setDescription(profile.description || "");
    }
  }, [profile]);

  const { createWallet, isLoading: isCreateWalletLoading, error } = useCreateWallet();

  const { data: walletClient } = useWalletClient();

  const handleCreate = async () => {
    if (!name) {
      notification.error("Please enter a name for the multisig");
      return;
    }

    try {
      const profileMetadata = {
        name,
        description: description,
        links: [] as any,
        tags: [] as any,
        profileImage: profileImage,
        backgroundImage: backgroundImage,
      };
    } catch (error) {
      console.error("Error creating multisig:", error);
      toaster.create({
        title: "Error creating multisigs",
        type: "error",
      });
    }
  };

  const getImageUrl = (ipfsUrl: string) => ipfsUrl.replace("ipfs://", "https://api.universalprofile.cloud/ipfs/");

  const renderImage = () => {
    if (profileLoading || !profile) return <div className="bg-base-100 w-full h-24 skeleton "></div>;

    return (
      <ImageUploader
        setFieldValue={async (field: string, value: string): Promise<void> => {
          // Handle the image upload field value setting
          console.log(field, value);
        }}
        setBackgroundImageFile={setBackgroundImageFile}
        setProfileImageFile={setProfileImageFile}
        setBackgroundImage={setBackgroundImage}
        setProfileImage={setProfileImage}
        profileImageUrl={profile.profileImage.length > 0 ? getImageUrl(profile.profileImage[0].url) : ""}
        backgroundImageUrl={profile.backgroundImage.length > 0 ? getImageUrl(profile.backgroundImage[0].url) : ""}
      />
    );
  };

  return useIsMounted() ? (
    <div className="flex flex-col flex-1 items-center w-full gap-8 px-4">
      <div className="flex  flex-col flex-grow w-full max-w-lg">
        <div className="mt-5 mb-2">
          <BackButton action={() => 0} isRequiredPage={true} />
          <div className="text-left text-xl mt-2">Update Your Multisig UP Profile</div>
          <div className="text-xs max-w-[350px] ">Create proposal to update profile details</div>
        </div>

        <div className="flex flex-col gap-y-6 bg-base-200 border border-gray rounded-xl w-full mb-4">
          {renderImage()}
          <div className="px-2 flex flex-col gap-y-6 pb-6">
            <div className="flex flex-col gap-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Update Multisig name</span>
                </label>
                <InputBase value={name} placeholder={"Name of multisig"} onChange={(value: string) => setName(value)} />
              </div>

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

export default EditMultiSigProfile;
