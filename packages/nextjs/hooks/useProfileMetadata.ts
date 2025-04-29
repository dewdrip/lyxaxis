import { useCallback, useEffect, useMemo, useState } from "react";
import { useTargetNetwork } from "./scaffold-eth";
import { ERC725, ERC725JSONSchema } from "@erc725/erc725.js";
import lsp3ProfileSchema from "@erc725/erc725.js/schemas/LSP3ProfileMetadata.json";

export interface Profile {
  name: string;
  description: string;
  tags: string[];
  links: Link[];
  profileImage: Image[];
  backgroundImage: Image[];
}

export interface ProfilePayload {
  name: string;
  description: string;
  tags: string[];
  links: Link[];
  profileImage?: UploadedImageData[];
  backgroundImage?: UploadedImageData[];
}

interface Link {
  title: string;
  url: string;
}

interface Image {
  width: number;
  height: number;
  hashFunction: string;
  hash: string;
  url: string;
}

export interface UploadedImageData {
  width: number;
  height: number;
  verification: {
    method: string;
    data: string;
  };
  url: string;
}

interface UseProfileMetadataOptions {
  address?: `0x${string}`;
  enabled?: boolean;
}

interface UseProfileMetadataResult {
  profile: Profile | null;
  loading: boolean;
  fetchProfile: (address: `0x${string}`) => Promise<Profile | null>;
}

/**
 * Custom hook to handle profile data fetching and updating.
 *
 * @param {UseProfileMetadataOptions} options - Optional settings for the hook.
 * @returns {UseProfileMetadataResult} - The profile data, issued assets, and a function to fetch the profile manually.
 */
export function useProfileMetadata(options: UseProfileMetadataOptions = { enabled: true }): UseProfileMetadataResult {
  const { address, enabled = true } = options;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  const { targetNetwork } = useTargetNetwork();

  // Fetch profile data
  const fetchProfile = useCallback(
    async (address: `0x${string}`): Promise<Profile | null> => {
      const erc725js = new ERC725(
        lsp3ProfileSchema as ERC725JSONSchema[],
        address,
        targetNetwork.rpcUrls.default.http[0],
        {
          ipfsGateway: "https://api.universalprofile.cloud/ipfs/",
        },
      );

      try {
        setLoading(true);
        const profileMetaData = await erc725js.fetchData("LSP3Profile");

        if (
          profileMetaData.value &&
          typeof profileMetaData.value === "object" &&
          "LSP3Profile" in profileMetaData.value
        ) {
          const fetchedProfile = profileMetaData.value.LSP3Profile;
          setProfile(fetchedProfile);

          return fetchedProfile;
        }
      } catch (error) {
        console.log("Cannot fetch universal profile data: ", error);
      } finally {
        setLoading(false);
      }

      return null;
    },
    [address],
  );

  // Fetch profile automatically if enabled
  useEffect(() => {
    if (enabled && address) {
      fetchProfile(address);
    }
  }, [address, fetchProfile, enabled]);

  return useMemo(
    () => ({
      profile,
      loading,
      fetchProfile,
    }),
    [profile, loading, fetchProfile],
  );
}
