import React, { useState } from "react";
import Link from "next/link";
import { ReceiveModal } from "~~/components/ReceiveModal";
import { Address, Balance } from "~~/components/scaffold-eth";
import { Profile } from "~~/hooks/useProfileMetadata";

interface ProfileHeaderProps {
  profileLoading: boolean;
  profile: Profile | null;
  multisigAddress: string;
  upAddress: string;
}

export function ProfileHeader({ profileLoading, profile, multisigAddress, upAddress }: ProfileHeaderProps) {
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);

  const getImageUrl = (ipfsUrl: string) => ipfsUrl.replace("ipfs://", "https://api.universalprofile.cloud/ipfs/");

  const renderBackgroundImage = () => {
    if (profileLoading || !profile) return <div className="bg-base-100 w-full h-full skeleton absolute"></div>;
    if (profile.backgroundImage.length > 0) {
      return (
        <img
          src={getImageUrl(profile.backgroundImage[0].url)}
          alt="Profile background"
          className="object-cover w-full h-full absolute rounded-t-xl"
        />
      );
    }
    return <div className="bg-base-100 w-full h-full absolute"></div>;
  };

  const renderProfileImage = () => {
    if (profileLoading || !profile)
      return (
        <div className="absolute border-[3px] skeleton border-base-300 w-24 h-24 object-cover right-8 -bottom-12 rounded-full"></div>
      );
    if (profile.profileImage.length > 0) {
      return (
        <img
          src={getImageUrl(profile.profileImage[0].url)}
          alt="Profile"
          className="absolute border-[3px] border-base-300 w-24 h-24 object-cover right-8 -bottom-12 rounded-full"
        />
      );
    }
    return (
      <div className="absolute border-[3px] bg-base-100 border-base-300 w-24 h-24 object-cover right-8 -bottom-12 rounded-full"></div>
    );
  };

  return (
    <div className="w-full">
      <div className="relative w-full h-24">
        {renderBackgroundImage()}
        {renderProfileImage()}
      </div>

      <div className="flex gap-4 items-center justify-between border-b border-gray pt-7 p-6 w-full">
        <div className="flex flex-col items-start">
          {profileLoading || !profile ? (
            <div className="skeleton w-24 h-6"></div>
          ) : (
            <div className="text-base font-semibold">{profile.name}</div>
          )}
          <Balance className="text-xl -ml-4" address={upAddress} />
          <Address address={upAddress} disableBlockie={false} />
        </div>

        <div className="flex flex-col gap-y-2 mt-auto items-end">
          <div className="flex gap-x-2">
            <button
              onClick={() => setIsReceiveModalOpen(true)}
              className="text-sm border border-gray-light rounded-full px-3 py-1 cursor-pointer hover:bg-gray"
            >
              Receive
            </button>
            <Link
              href={`/editmultisigprofile/${multisigAddress}`}
              className="text-sm border border-gray-light rounded-full px-3 py-1 cursor-pointer hover:bg-gray"
            >
              Edit profile
            </Link>
          </div>
        </div>
      </div>

      <ReceiveModal address={upAddress} isOpen={isReceiveModalOpen} onClose={() => setIsReceiveModalOpen(false)} />
    </div>
  );
}
