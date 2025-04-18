import { useState } from "react";
import useJSONUploader from "../useJSONUploader";
import { Profile } from "../useProfileMetadata";
import { ERC725 } from "@erc725/erc725.js";
import LSP3ProfileMetadataSchemas from "@erc725/erc725.js/schemas/LSP3ProfileMetadata.json";
import { ethers } from "ethers";
import { Address } from "viem";
import { useScaffoldWatchContractEvent, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface CreateWalletParams {
  chainId: bigint;
  owners: Address[];
  signaturesRequired: bigint;
  profileMetadata: Profile;
}

export const useCreateWallet = () => {
  const [deployedAddress, setDeployedAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { upload: uploadProfile } = useJSONUploader({ enabled: false });

  const { writeContractAsync: createWallet } = useScaffoldWriteContract({
    contractName: "Lyxaxis",
  });

  // Watch for the CreatedMultisig event
  useScaffoldWatchContractEvent({
    contractName: "Lyxaxis",
    eventName: "CreatedMultisig",
    onLogs: logs => {
      // Get the most recent event's multisig address
      const latestLog = logs[logs.length - 1];
      if (latestLog && "multisig" in latestLog.args) {
        setDeployedAddress(latestLog.args.multisig as Address);
        setIsLoading(false);
      }
    },
  });

  const encodeProfileMetadata = async (_profile: Profile): Promise<`0x${string}`> => {
    let profileMetadata = {
      LSP3Profile: _profile,
    };

    const profile = await uploadProfile(profileMetadata);

    if (!profile) {
      throw new Error("Failed to upload profile metadata");
    }

    const profileMetadataHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(profileMetadata)));

    const lsp3DataValue = {
      verification: {
        method: "keccak256(utf8)",
        data: profileMetadataHash,
      },
      // this is an IPFS CID of a LSP3 Profile Metadata example, you can use your own
      url: `ipfs://${profile.ipfsHash}`,
    };

    const erc725 = new ERC725(LSP3ProfileMetadataSchemas);

    const encodedData = erc725.encodeData([
      {
        keyName: "LSP3Profile",
        value: lsp3DataValue,
      },
    ]);

    return encodedData.values[0] as `0x${string}`;
  };

  const createWalletWithParams = async (params: CreateWalletParams) => {
    try {
      setIsLoading(true);
      setError(null);
      setDeployedAddress(null); // Reset the deployed address

      const encodedProfileMetadata = await encodeProfileMetadata(params.profileMetadata);

      await createWallet({
        functionName: "createWallet",
        args: [encodedProfileMetadata, params.chainId, params.owners, params.signaturesRequired],
      });
    } catch (error) {
      console.error("Error creating wallet:", error);
      setError(error instanceof Error ? error : new Error("Unknown error occurred"));
      throw error;
    } finally {
      // Only set loading to false here if the event listener hasn't already done it
      if (!deployedAddress) {
        setIsLoading(false);
      }
    }
  };

  return {
    createWallet: createWalletWithParams,
    deployedAddress,
    isLoading,
    error,
  };
};
