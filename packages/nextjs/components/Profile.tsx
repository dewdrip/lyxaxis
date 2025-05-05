import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BlockieAvatar } from "./scaffold-eth";
import { AddressCopyIcon } from "./scaffold-eth/Address/AddressCopyIcon";
import { useProfileMetadata } from "~~/hooks/useProfileMetadata";
import { getAddressColor, getFirst4Hex, truncateAddress, truncateString } from "~~/utils/helpers";

type Props = {
  address: `0x${string}`;
  copyable?: boolean;
  imageClassName?: string;
  nameClassName?: string;
  iconClassName?: string;
  containerClassName?: string;
};

export default function Profile({
  address,
  copyable = true,
  imageClassName = "",
  nameClassName = "",
  iconClassName = "",
  containerClassName = "",
}: Props) {
  const { profile } = useProfileMetadata({
    address,
    enabled: true,
  });

  return (
    <div className={`flex items-center ${containerClassName}`}>
      <div
        className={`w-10 aspect-square rounded-full ${imageClassName}`}
        style={{ backgroundColor: getAddressColor(address) }}
      >
        <Link href={`https://universaleverything.io/${address}`} target="_blank">
          {!profile?.profileImage || profile.profileImage.length === 0 ? (
            <BlockieAvatar
              address={address}
              // @ts-ignore
              size={"100%"}
            />
          ) : (
            <div className={`relative w-10 aspect-square rounded-full object-cover ${imageClassName}`}>
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

      <strong className={`text-md font-thin ml-2 text-center ${nameClassName}`}>
        {profile ? `${truncateString(profile.name, 9)}` : truncateAddress(address)}
        {profile && <span className="text-purple-400 whitespace-nowrap">#{getFirst4Hex(address)}</span>}
      </strong>

      {copyable && (
        <AddressCopyIcon className={`ml-1 w-5 aspect-square cursor-pointer ${iconClassName}`} address={address} />
      )}
    </div>
  );
}
