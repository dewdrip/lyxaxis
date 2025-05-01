import { ERC725 } from "@erc725/erc725.js";
import LSP3ProfileMetadataSchemas from "@erc725/erc725.js/schemas/LSP3ProfileMetadata.json";
import { BytesLike } from "ethers";
import { ethers } from "hardhat";

export interface ProfilePayload {
  name: string;
  description: string;
  tags: string[];
  links: any[];
  profileImage?: any[];
  backgroundImage?: any[];
}

export const encodeProfileMetadata = async (_profile: ProfilePayload): Promise<{ key: string; value: BytesLike }> => {
  let profileMetadata = {
    LSP3Profile: _profile,
  };

  const profileMetadataHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(profileMetadata)));

  const lsp3DataValue = {
    verification: {
      method: "keccak256(utf8)",
      data: profileMetadataHash,
    },
    // this is an IPFS CID of a LSP3 Profile Metadata example, you can use your own
    url: `ipfs://`,
  };

  const erc725 = new ERC725(LSP3ProfileMetadataSchemas);

  const encodedData = erc725.encodeData([
    {
      keyName: "LSP3Profile",
      value: lsp3DataValue,
    },
  ]);

  return { key: encodedData.keys[0], value: encodedData.values[0] };
};
