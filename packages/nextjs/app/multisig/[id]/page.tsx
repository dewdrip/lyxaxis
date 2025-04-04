"use client";

import { type FC } from "react";
import { useParams } from "next/navigation";
import { TransactionEventItem } from "../_components";
import { Pool } from "../_components/Pool";
import { QRCodeSVG } from "qrcode.react";
import { MultiSigNav, Navbar } from "~~/components/Navbar";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useDeployedContractInfo, useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

const Multisig: FC = () => {
  const { data: contractInfo } = useDeployedContractInfo("MultiSig");

  let { id: multisigAddress } = useParams();

  multisigAddress = multisigAddress as `0x${string}`;

  const { data: executeTransactionEvents } = useScaffoldEventHistory({
    contractName: "MultiSig",
    eventName: "ExecuteTransaction",
    contractAddress: multisigAddress,
    fromBlock: 0n,
  });

  return (
    <div className="flex items-center pb-8 flex-col flex-grow gap-8">
      <MultiSigNav multisigAddress={multisigAddress} />
      <div className="flex gap-4 items-center justify-between border-b border-gray p-6 w-full ">
        <div className="flex flex-col gap-y-2 items-start">
          <div>
            <div className="text-xl">Balance:</div>
            <Balance className="text-3xl -ml-4" address={multisigAddress} />
          </div>
          <Address address={multisigAddress} />
        </div>

        <div className="flex flex-col items-center gap-y-2">
          <QRCodeSVG value={multisigAddress || ""} size={100} />
        </div>
      </div>

      <div className="w-full flex flex-col px-4">
        <div>Addresses of Signers</div>
      </div>
      <div className="w-full flex flex-col px-4">
        <Pool multisigAddress={multisigAddress} />
      </div>
    </div>
  );
};

export default Multisig;
