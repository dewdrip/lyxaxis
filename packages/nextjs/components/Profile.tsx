import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BlockieAvatar } from "./scaffold-eth";
import { useProfileMetadata } from "~~/hooks/useProfileMetadata";
import { getAddressColor, getFirst4Hex, truncateAddress } from "~~/utils/helpers";

type Props = {
  address: `0x${string}`;
};

export default function Profile({ address }: Props) {
  const { profile } = useProfileMetadata({
    address,
    enabled: true,
  });

  return (
    <div className="flex items-center">
      <div className="w-10 aspect-square rounded-full" style={{ backgroundColor: getAddressColor(address) }}>
        <Link href={`https://universaleverything.io/${address}`} target="_blank">
          {!profile?.profileImage || profile.profileImage.length === 0 ? (
            <BlockieAvatar
              address={address}
              // @ts-ignore
              size={"100%"}
            />
          ) : (
            <div className="relative w-10 aspect-square rounded-full object-cover">
              <Image
                src={profile.profileImage[0].url.replace("ipfs://", "https://api.universalprofile.cloud/ipfs/")}
                alt="Profile"
                fill
                className="rounded-full object-cover"
              />
            </div>
          )}
        </Link>
      </div>

      <strong className="text-md font-thin ml-2 text-center">
        {profile ? `${profile.name}` : truncateAddress(address)}
        {profile && <span className="text-purple-400 whitespace-nowrap">#{getFirst4Hex(address)}</span>}
      </strong>
    </div>
  );
}
