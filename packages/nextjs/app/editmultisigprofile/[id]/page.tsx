"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { InterfaceAbi, ethers } from "ethers";
import type { NextPage } from "next";
import { useIsMounted, useLocalStorage } from "usehooks-ts";
import { useChainId, usePublicClient, useWalletClient } from "wagmi";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { BackButton } from "~~/app/createmultisig/components/BackButton";
import { ImageUploader } from "~~/app/createmultisig/components/imageUploader";
import { TransactionData } from "~~/app/transfer/[id]/page";
import { LinkInput } from "~~/components/LinkInput";
import { TagInput } from "~~/components/TagInput";
import { InputBase } from "~~/components/scaffold-eth";
import { useCreateWallet } from "~~/hooks/contract/useCreateWallet";
import { useScaffoldReadContract, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { Link, ProfilePayload, UploadedImageData, useProfileMetadata } from "~~/hooks/useProfileMetadata";
import { AddressType } from "~~/types/abitype/abi";
import LspABI from "~~/utils/abis/LspABI.json";
import MultiSigABI from "~~/utils/abis/MultiSigABI.json";
import { getPoolServerUrl } from "~~/utils/getPoolServerUrl";
import { DEFAULT_TX_DATA, PredefinedTxData } from "~~/utils/methods";
import { notification } from "~~/utils/scaffold-eth";

const EditMultiSigProfile: NextPage = () => {
  let { id: multisigAddress } = useParams();
  multisigAddress = multisigAddress as `0x${string}`;
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const { targetNetwork } = useTargetNetwork();
  const poolServerUrl = getPoolServerUrl(targetNetwork.id);

  const router = useRouter();

  const { data: upAddress } = useScaffoldReadContract({
    contractName: "MultiSig",
    functionName: "getUniversalProfile",
    contractAddress: multisigAddress,
  });

  const { profile, loading: profileLoading } = useProfileMetadata({
    address: upAddress as `0x${string}`,
    enabled: true,
  }) as {
    profile: ProfilePayload | null;
    loading: boolean;
  };

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [profileImage, setProfileImage] = useState<UploadedImageData[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<UploadedImageData[]>([]);

  const [createProposalLoading, setCreateProposalLoading] = useState<boolean>(false);

  const [predefinedTxData, setPredefinedTxData] = useLocalStorage<PredefinedTxData>(
    "predefined-tx-data",
    DEFAULT_TX_DATA,
  );

  const { data: signaturesRequired } = useScaffoldReadContract({
    contractName: "MultiSig",
    contractAddress: multisigAddress,
    functionName: "signaturesRequired",
  });

  const { data: nonce } = useScaffoldReadContract({
    contractName: "MultiSig",
    contractAddress: multisigAddress,
    functionName: "nonce",
  });

  const { encodeProfileMetadata } = useCreateWallet();

  const handleCreate = async () => {
    try {
      setCreateProposalLoading(true);

      if (!walletClient) {
        console.log("No wallet client!");
        return;
      }

      if (!name) {
        notification.error("Please enter a name for the multisig");
        return;
      }

      if (!upAddress) {
        notification.error("No Universal Profile address found");
        return;
      }

      const LSP3ProfileKey = "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5";

      const profileMetadata: ProfilePayload = {
        name,
        description,
        links,
        tags,
        profileImage,
        backgroundImage,
      };

      const encodedProfileMetadata = await encodeProfileMetadata(profileMetadata);

      const upContract = new ethers.Contract(upAddress as `0x${string}`, LspABI as InterfaceAbi);

      // Prepare the setData transaction
      const callData = upContract.interface.encodeFunctionData("setData", [LSP3ProfileKey, encodedProfileMetadata]);

      const newHash = (await publicClient?.readContract({
        address: multisigAddress,
        abi: MultiSigABI,
        functionName: "getTransactionHash",
        args: [nonce as bigint, upAddress, 0n, callData as `0x${string}`],
      })) as `0x${string}`;

      const signature = await walletClient.signMessage({
        message: { raw: newHash },
      });

      const recover = (await publicClient?.readContract({
        address: multisigAddress,
        abi: MultiSigABI,
        functionName: "recover",
        args: [newHash, signature],
      })) as AddressType;

      const isOwner = await publicClient?.readContract({
        address: multisigAddress,
        abi: MultiSigABI,
        functionName: "isOwner",
        args: [recover],
      });

      if (isOwner) {
        if (!multisigAddress) {
          return;
        }

        const txData: TransactionData = {
          title: "Edit Profile",
          description: "",
          chainId: chainId,
          address: multisigAddress,
          nonce: (nonce as bigint) || 0n,
          to: upAddress,
          amount: "0",
          data: callData as `0x${string}`,
          hash: newHash,
          signatures: [signature],
          signers: [recover],
          requiredApprovals: (signaturesRequired as bigint) || 0n,
        };

        console.log("txData", txData);

        await fetch(poolServerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            txData,
            // stringifying bigint
            (key, value) => (typeof value === "bigint" ? value.toString() : value),
          ),
        });

        setPredefinedTxData(DEFAULT_TX_DATA);

        router.push(`/multisig/${multisigAddress}`);
      } else {
        notification.info("Only owners can propose transactions");
      }
    } catch (e) {
      notification.error("Error while proposing transaction");
      console.log(e);
    } finally {
      setCreateProposalLoading(false);
    }
  };

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const addLink = () => {
    setLinks([...links, { id: Date.now().toString(), title: "", url: "" }]);
  };

  const removeLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
  };

  const setLinkTitle = (id: string, title: string) => {
    setLinks(links.map(link => (link.id === id ? { ...link, title } : link)));
  };

  const setLinkUrl = (id: string, url: string) => {
    setLinks(links.map(link => (link.id === id ? { ...link, url } : link)));
  };

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setDescription(profile.description || "");
      setTags(profile.tags || []);
      setLinks(profile.links || []);
      setProfileImage(profile.profileImage ?? []);
      setBackgroundImage(profile.backgroundImage ?? []);
    }
  }, [profile]);

  const getImageUrl = (ipfsUrl: string) => ipfsUrl.replace("ipfs://", "https://api.universalprofile.cloud/ipfs/");

  const renderImage = () => {
    if (profileLoading || !profile) return <div className="bg-base-100 w-full h-24 skeleton "></div>;

    return (
      <ImageUploader
        setBackgroundImage={setBackgroundImage}
        setProfileImage={setProfileImage}
        profileImageUrl={
          Array.isArray(profile.profileImage) && profile.profileImage.length > 0
            ? getImageUrl(profile.profileImage[0].url)
            : ""
        }
        backgroundImageUrl={
          Array.isArray(profile.backgroundImage) && profile.backgroundImage.length > 0
            ? getImageUrl(profile.backgroundImage[0].url)
            : ""
        }
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

        <div className="flex flex-col gap-y-6 bg-base-200 border border-gray rounded-xl w-full mb-4 h-[490px] overflow-y-scroll">
          {renderImage()}
          <div className="px-2 flex flex-col gap-y-6 pb-6">
            <div className="flex flex-col gap-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Multisig name</span>
                </label>
                <InputBase value={name} placeholder={"Name of multisig"} onChange={(value: string) => setName(value)} />
              </div>

              <div className="flex flex-col gap-y-1">
                <label className="label p-0">
                  <span className="label-text">Multisig Description</span>
                </label>
                <InputBase
                  value={description}
                  placeholder={"Brief Description"}
                  onChange={(value: string) => setDescription(value)}
                />
              </div>

              {/* Tags */}
              <div className="flex flex-col ">
                <label className="label p-0">
                  <span className="label-text">Tags</span>
                </label>
                <TagInput onAdd={addTag} onDelete={removeTag} tags={tags} />
              </div>

              {/* Links */}
              <div className="flex flex-col gap-y-4">
                <div className="flex justify-between items-center">
                  <label className="label p-0">
                    <span className="label-text">Links</span>
                  </label>
                  <button onClick={addLink} className="btn btn-primary btn-sm h-[2.5rem] rounded-xl">
                    <PlusCircleIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {links.map(link => (
                    <LinkInput
                      key={link.id}
                      title={link.title}
                      url={link.url}
                      onCancel={() => removeLink(link.id)}
                      onChangeTitle={title => setLinkTitle(link.id, title)}
                      onChangeUrl={url => setLinkUrl(link.id, url)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-center px-6">
              <button
                className="btn btn-primary btn-sm h-[2.5rem] w-[140px] rounded-lg"
                disabled={!walletClient || false}
                onClick={handleCreate}
              >
                {createProposalLoading ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  "Create Proposal"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default EditMultiSigProfile;
