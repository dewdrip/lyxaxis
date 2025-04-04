"use client";

import { type FC } from "react";
import { TransactionEventItem } from "../_components";
import { Pool } from "../_components/Pool";
import { QRCodeSVG } from "qrcode.react";
import { MultiSigNav, Navbar } from "~~/components/Navbar";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useDeployedContractInfo, useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

const Multisig: FC = () => {
  const { data: contractInfo } = useDeployedContractInfo("MultiSig");

  const contractAddress = contractInfo?.address;

  const { data: executeTransactionEvents } = useScaffoldEventHistory({
    contractName: "MultiSig",
    eventName: "ExecuteTransaction",
    fromBlock: 0n,
  });

  return (
    <div className="flex items-center flex-col flex-grow gap-8">
      <MultiSigNav />
      <div className="flex gap-4 items-center justify-between border-b border-gray p-6 w-full ">
        <div className="flex flex-col gap-y-2 items-start">
          <div>
            <div className="text-xl">Balance:</div>
            <Balance className="text-3xl -ml-4" address={contractAddress} />
          </div>
          <Address address={contractAddress} />
        </div>

        <div className="flex flex-col items-center gap-y-2">
          <QRCodeSVG value={contractAddress || ""} size={100} />
        </div>
      </div>

      <div className="w-full flex flex-col px-4">
        <div>Addresses of Signers</div>
      </div>
      <div className="w-full flex flex-col px-4">
        <Pool />
      </div>
    </div>
  );
};

export default Multisig;
