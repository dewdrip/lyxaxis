"use client";

import { type FC } from "react";
import { useParams } from "next/navigation";
import { TransactionEventItem } from "../../multisig/_components";
import { MultiSigNav } from "~~/components/Navbar";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

const Events: FC = () => {
  let { id: multisigAddress } = useParams();

  multisigAddress = multisigAddress as `0x${string}`;

  const { data: executeTransactionEvents } = useScaffoldEventHistory({
    contractName: "MultiSig",
    contractAddress: multisigAddress,
    eventName: "ExecuteTransaction",
    fromBlock: 0n,
  });

  return (
    <div className="flex items-center flex-col flex-grow mx-auto gap-8 w-[432px] ">
      <MultiSigNav multisigAddress={multisigAddress} />
      <div className="w-full px-4">
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
