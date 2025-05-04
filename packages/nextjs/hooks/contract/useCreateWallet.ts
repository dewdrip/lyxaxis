import { useEffect, useState } from "react";
import useJSONUploader from "../useJSONUploader";
import { ProfilePayload } from "../useProfileMetadata";
import { ERC725 } from "@erc725/erc725.js";
import LSP3ProfileMetadataSchemas from "@erc725/erc725.js/schemas/LSP3ProfileMetadata.json";
import axios from "axios";
import { ethers } from "ethers";
import { Address } from "viem";
import "viem";
import { useAccount, usePublicClient } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface CreateWalletParams {
  owners: Address[];
  signaturesRequired: bigint;
  profileMetadata: ProfilePayload;
}

export const useCreateWallet = () => {
  const [deployedAddress, setDeployedAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const publicClient = usePublicClient();

  const { address: connectedAddress } = useAccount();

  const { upload: uploadProfile } = useJSONUploader({ enabled: false });

  const { data: multiSigRegistryData } = useDeployedContractInfo({
    contractName: "MultiSigRegistry",
  });

  const { data: registryAddress, isLoading: registryAddressLoading } = useScaffoldReadContract({
    contractName: "Lyxaxis",
    functionName: "getRegistry",
  });

  const { writeContractAsync: createWallet } = useScaffoldWriteContract({
    contractName: "Lyxaxis",
  });

  const encodeProfileMetadata = async (_profile: ProfilePayload): Promise<`0x${string}`> => {
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
      if (!publicClient) {
        notification.error("Cannot access account");
        return;
      }

      console.log(params.owners);

      setIsLoading(true);
      setError(null);
      setDeployedAddress(null); // Reset the deployed address

      const encodedProfileMetadata = await encodeProfileMetadata(params.profileMetadata);

      const trxHash = await createWallet({
        functionName: "createWallet",
        args: [encodedProfileMetadata, params.owners, params.signaturesRequired],
      });

      if (trxHash && multiSigRegistryData?.abi && connectedAddress && registryAddress) {
        const signerMultisigsData = await publicClient.readContract({
          address: registryAddress,
          abi: multiSigRegistryData.abi,
          functionName: "getSignerMultisigs",
          args: [params.owners[0]],
        });

        setDeployedAddress(signerMultisigsData[signerMultisigsData.length - 1] as Address);

        return signerMultisigsData[signerMultisigsData.length - 1] as Address;
      }
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
    encodeProfileMetadata,
    deployedAddress,
    isLoading,
    error,
  };
};

export const useDecodedProfileMetadata = (encodedValue: `0x${string}` | null) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchAndDecodeProfileMetadata = async () => {
      if (!encodedValue) return;

      setLoading(true);
      setError(null);
      setData(null);

      try {
        const erc725 = new ERC725(LSP3ProfileMetadataSchemas);
        const decoded = erc725.decodeData([
          {
            keyName: "LSP3Profile",
            value: encodedValue,
          },
        ]);

        const ipfsHash = decoded[0]?.value?.url?.replace("ipfs://", "");
        if (!ipfsHash) throw new Error("Invalid IPFS URL in metadata");

        const response = await axios.get(`https://api.universalprofile.cloud/ipfs/${ipfsHash}`);
        setData(response.data.LSP3Profile);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndDecodeProfileMetadata();
  }, [encodedValue]);

  return { data, loading, error };
};
