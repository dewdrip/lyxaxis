import { type FC, useMemo, useState } from "react";
import { TransactionItem } from "./TransactionItem";
import { useQuery } from "@tanstack/react-query";
import { useChainId } from "wagmi";
import { TransactionData } from "~~/app/create/[id]/page";
import { Address } from "~~/components/scaffold-eth";
import {
  useDeployedContractInfo,
  useScaffoldContract,
  useScaffoldEventHistory,
  useScaffoldReadContract,
} from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getPoolServerUrl } from "~~/utils/getPoolServerUrl";
import { notification } from "~~/utils/scaffold-eth";

export const Pool = ({ multisigAddress }: { multisigAddress: `0x${string}` }) => {
  const [transactions, setTransactions] = useState<TransactionData[]>();
  const [loading, setLoading] = useState<boolean>(false);
  // const [subscriptionEventsHashes, setSubscriptionEventsHashes] = useState<`0x${string}`[]>([]);
  const { targetNetwork } = useTargetNetwork();
  const poolServerUrl = getPoolServerUrl(targetNetwork.id);
  const chainId = useChainId();
  const { data: nonce } = useScaffoldReadContract({
    contractName: "MultiSig",
    contractAddress: multisigAddress,
    functionName: "nonce",
  });

  const { data: eventsHistory } = useScaffoldEventHistory({
    contractName: "MultiSig",
    eventName: "ExecuteTransaction",
    contractAddress: multisigAddress,
    fromBlock: 0n,
    watch: true,
  });

  const { data: MultiSig } = useScaffoldContract({
    contractName: "MultiSig",
    contractAddress: multisigAddress,
  });

  const historyHashes = useMemo(() => eventsHistory?.map(ev => ev.args.hash) || [], [eventsHistory]);

  const fetchTransactionData = async (id?: string) => {
    try {
      setLoading(true);

      const response = await fetch(`${poolServerUrl}${multisigAddress}`);
      const res = await response.json();

      if (!res.transactions) {
        console.error("No transactions found in response:", res);
        return;
      }

      const newTransactions: TransactionData[] = await Promise.all(
        res.transactions.map(async (tx: TransactionData) => {
          const validSignatures = [];

          for (const sig of tx.signatures || []) {
            const signer = (await MultiSig?.read.recover([tx.hash as `0x${string}`, sig])) as `0x${string}`;

            const isOwner = await MultiSig?.read.isOwner([signer as string]);

            if (signer && isOwner) {
              validSignatures.push({ signer, signature: sig });
            }
          }

          return { ...tx, validSignatures };
        }),
      );

      setTransactions(newTransactions);

      return newTransactions;
    } catch (error) {
      console.error("Error fetching transaction data:", error);
      notification.error("Error fetching transaction data");
    } finally {
      setLoading(false);
    }
  };

  useQuery({
    queryKey: ["campaign", multisigAddress],
    queryFn: () => fetchTransactionData(),
    enabled: !!multisigAddress, // Prevents execution if ID is missing
    refetchOnMount: true, // Always refetch when the component mounts
    refetchOnWindowFocus: true,
  });

  const lastTx = useMemo(
    () =>
      transactions
        ?.filter(tx => historyHashes.includes(tx.hash))
        .sort((a, b) => (BigInt(a.nonce) < BigInt(b.nonce) ? 1 : -1))[0],
    [historyHashes, transactions],
  );

  return (
    <div className="flex flex-col flex-1 items-center gap-8">
      <div className="flex items-center flex-col flex-grow w-full max-w-2xl">
        <div className="flex flex-col items-center bg-base-100 border border-gray rounded-xl py-6 w-full">
          <div className="text-xl font-bold">Pool</div>

          <div className="">Nonce: {nonce !== undefined ? `#${nonce}` : "Loading..."}</div>
          <div className="flex">
            <div className="text-sm">Controller Address:</div>{" "}
            <Address address={multisigAddress} disableBlockie={true} />
          </div>

          <div className="flex flex-col mt-8 gap-4 h-[18rem] overflow-y-scroll">
            {loading ? (
              <div className="bg-white w-4 h-4 loading loading-spinner my-20"></div>
            ) : transactions && transactions.length === 0 ? (
              <div className="w-full"></div>
            ) : (
              transactions &&
              transactions.map(tx => {
                return (
                  <TransactionItem
                    key={tx.hash}
                    tx={tx}
                    completed={historyHashes.includes(tx.hash as `0x${string}`)}
                    outdated={lastTx?.nonce != undefined && BigInt(tx.nonce) <= BigInt(lastTx?.nonce)}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
