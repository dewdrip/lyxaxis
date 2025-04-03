"use client";

import { type FC } from "react";
import { TransactionEventItem } from "../../multisig/_components";
import { QRCodeSVG } from "qrcode.react";
import { MultiSigNav, Navbar } from "~~/components/Navbar";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useDeployedContractInfo, useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

const Events: FC = () => {
  const { data: contractInfo } = useDeployedContractInfo("MetaMultiSigWallet");

  const contractAddress = contractInfo?.address;

  const { data: executeTransactionEvents } = useScaffoldEventHistory({
    contractName: "MetaMultiSigWallet",
    eventName: "ExecuteTransaction",
    fromBlock: 0n,
  });

  return (
    <div className="flex items-center flex-col flex-grow mx-auto gap-8 w-[432px] ">
      <MultiSigNav />

      <div className="w-full px-2">
        <div className="flex flex-col mt-10 items-center bg-base-100 border border-gray rounded-xl p-6 w-full">
          <div className="text-xl my-2">Events:</div>
          {executeTransactionEvents?.map(txEvent => (
            <TransactionEventItem key={txEvent.args.hash} {...(txEvent.args as Required<(typeof txEvent)["args"]>)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;
