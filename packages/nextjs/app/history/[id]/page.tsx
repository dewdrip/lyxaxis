"use client";

import { type FC } from "react";
import { useParams } from "next/navigation";
import { Pool } from "~~/app/multisig_components/Pool";
import { MultiSigNav } from "~~/components/Navbar";

const History: FC = () => {
  let { id: multisigAddress } = useParams();

  multisigAddress = multisigAddress as `0x${string}`;

  return (
    <div className="flex items-center pb-8 flex-col flex-grow">
      <MultiSigNav multisigAddress={multisigAddress} />

      <div className="w-full flex flex-col px-4 pt-6">
        <Pool multisigAddress={multisigAddress as `0x${string}`} isHistory={true} />
      </div>
    </div>
  );
};

export default History;
