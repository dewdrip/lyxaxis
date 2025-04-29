"use client";

import { type FC } from "react";
import { useParams } from "next/navigation";
import { Pool } from "../_components/Pool";
import { ProfileHeader } from "../_components/ProfileHeader";
import { MultiSigNav } from "~~/components/Navbar";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useProfileMetadata } from "~~/hooks/useProfileMetadata";

const Multisig: FC = () => {
  let { id: multisigAddress } = useParams();

  multisigAddress = multisigAddress as `0x${string}`;

  const { data: upAddress, isLoading: isUpAddressLoading } = useScaffoldReadContract({
    contractName: "MultiSig",
    functionName: "getUniversalProfile",
    contractAddress: multisigAddress,
  });

  const { profile, loading: profileLoading } = useProfileMetadata({
    address: upAddress as `0x${string}`,
    enabled: true,
  });

  console.log("profile", profile);

  return (
    <div className="flex items-center pb-8 flex-col flex-grow">
      <MultiSigNav multisigAddress={multisigAddress} />

      <ProfileHeader
        profileLoading={profileLoading}
        profile={profile}
        multisigAddress={multisigAddress}
        upAddress={upAddress as `0x${string}`}
      />

      {/* <div className="w-full flex flex-col px-4">
        <div>Addresses of Signers</div>
      </div> */}
      <div className="w-full flex flex-col px-4 pt-6">
        <Pool multisigAddress={multisigAddress as `0x${string}`} />
      </div>
    </div>
  );
};

export default Multisig;
