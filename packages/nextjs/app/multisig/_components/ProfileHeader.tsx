import React, { useState } from "react";
import Link from "next/link";
import { FaExternalLinkAlt } from "react-icons/fa";
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
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);

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

  const renderBio = () => {
    if (!profile) return;

    if (profile.description.length < 100) {
      return <div className="text-sm line-clamp-1 mt-4">{profile.description}</div>;
    } else {
      return (
        <p className="text-sm mt-4">
          {profile.description.slice(0, 94)}...
          <button onClick={() => setIsDescriptionModalOpen(true)} className="text-primary text-sm hover:underline ml-1">
            See more
          </button>
        </p>
      );
    }
  };

  return (
    <div className="w-full">
      <div className="relative w-full h-24">
        {renderBackgroundImage()}
        {renderProfileImage()}
      </div>

      <div className="flex flex-col  border-b border-gray pt-7 px-6 pb-2 w-full">
        <div className="flex justify-between items-start">
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
                className="text-sm whitespace-nowrap border border-gray-light rounded-full px-3 py-1 cursor-pointer hover:bg-gray"
              >
                Edit profile
              </Link>
            </div>
          </div>
        </div>

        {/* Description */}
        {renderBio()}

        {/* Links */}
        {profile?.links && profile.links.length > 0 && (
          <div className="flex gap-2 overflow-x-auto max-w-full scrollbar-hide mt-1">
            {profile.links.map((link, index) => (
              <Link
                key={index}
                href={link.url}
                target="_blank"
                className="text-sm bg-gray-100 py-1 rounded-full whitespace-nowrap flex items-center gap-1 hover:bg-gray-200"
              >
                {link.title}
                <FaExternalLinkAlt size={12} />
              </Link>
            ))}
          </div>
        )}

        {/* Tags */}
        {profile?.tags && profile.tags.length > 0 && (
          <div className="flex gap-2 overflow-x-auto max-w-full scrollbar-hide mt-1">
            {profile.tags.map((tag, index) => (
              <span
                key={index}
                className="text-sm border border-gray-light bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <ReceiveModal address={upAddress} isOpen={isReceiveModalOpen} onClose={() => setIsReceiveModalOpen(false)} />

      {/* Description Modal */}
      {isDescriptionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Description</h3>
              <button onClick={() => setIsDescriptionModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <p className="text-sm whitespace-pre-wrap">{profile?.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
