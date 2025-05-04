"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OptionalForm } from "./components/OptionalForm";
import { RequiredForm } from "./components/RequiredForm";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useCreateWallet } from "~~/hooks/contract/useCreateWallet";
import { Link, UploadedImageData } from "~~/hooks/useProfileMetadata";
import { UniversalProfileOwner } from "~~/types/universalProfile";
import { notification } from "~~/utils/scaffold-eth";

const CreateMultiSig: NextPage = () => {
  const router = useRouter();
  const [pages, setPages] = useState<number>(0);

  const { address: ownerAddress } = useAccount();

  const [signers, setSigners] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<UploadedImageData[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<UploadedImageData[]>([]);
  const [description, setDescription] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null);

  const [newSigner, setNewSigner] = useState<UniversalProfileOwner>({ address: "", controller: "" });

  const [requiredSignatures, setRequiredSignatures] = useState<string>("");

  const [name, setName] = useState<string>("");

  const { createWallet, isLoading: isCreateWalletLoading } = useCreateWallet();

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleCreate = async () => {
    if (!name) {
      notification.error("Please enter a name for the multisig");
      return;
    }

    if (signers.length === 0) {
      notification.error("Please add a signer");
      return;
    }

    const reqSigs = parseInt(requiredSignatures);
    if (isNaN(reqSigs) || reqSigs < 1 || reqSigs > signers.length) {
      notification.error("Invalid number of required signatures");
      return;
    }

    try {
      const profileMetadata = {
        name,
        description: description,
        links,
        tags,
        profileImage: profileImage,
        backgroundImage: backgroundImage,
      };

      const newMultisigAddress = await createWallet({
        profileMetadata,
        owners: signers as `0x${string}`[],
        signaturesRequired: BigInt(requiredSignatures || "0"),
      });

      if (newMultisigAddress) {
        setName("");
        setSigners(ownerAddress ? [ownerAddress] : []);
        setNewSigner({ address: "", controller: "" });
        setRequiredSignatures("");

        router.replace(`/multisig/${newMultisigAddress}`);
      }
    } catch (error) {
      console.error("Error creating multisig:", error);
      const err = error instanceof Error ? error.message : "Error creating multisig";
      notification.error(`${err}. Please check your network connection and try again`);
    }
  };

  const componentArray = [
    <RequiredForm
      key="required-form"
      handleCreate={handleCreate}
      setSigners={setSigners}
      setName={setName}
      setNewSigner={setNewSigner}
      setRequiredSignatures={setRequiredSignatures}
      requiredSignatures={requiredSignatures}
      newSigner={newSigner}
      signers={signers}
      name={name}
      isCreateWalletLoading={isCreateWalletLoading}
      pages={pages}
      setPages={setPages}
    />,
    <OptionalForm
      key="optional-form"
      handleCreate={handleCreate}
      profileImage={profileImage}
      backgroundImage={backgroundImage}
      description={description}
      setDescription={setDescription}
      tags={tags}
      links={links}
      setTags={setTags}
      setLinks={setLinks}
      setProfileImage={setProfileImage}
      setBackgroundImage={setBackgroundImage}
      setBackgroundImageFile={setBackgroundImageFile}
      setProfileImageFile={setProfileImageFile}
      isCreateWalletLoading={isCreateWalletLoading}
      pages={pages}
      setPages={setPages}
    />,
  ];

  return hasMounted ? componentArray[pages] : null;
};

export default CreateMultiSig;
