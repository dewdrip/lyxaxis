import { TransactionItem } from "./TransactionItem";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TransactionData } from "~~/app/transfer/[id]/page";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getPoolServerUrl } from "~~/utils/getPoolServerUrl";
import { notification } from "~~/utils/scaffold-eth";

export const Pool = ({
  multisigAddress,
  isHistory = false,
}: {
  multisigAddress: `0x${string}`;
  isHistory?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { targetNetwork } = useTargetNetwork();
  const poolServerUrl = getPoolServerUrl(targetNetwork.id);

  const { data: MultiSig } = useScaffoldContract({
    contractName: "MultiSig",
    contractAddress: multisigAddress,
  });

  const fetchTransactionData = async () => {
    try {
      const response = await fetch(`${poolServerUrl}${multisigAddress}`);
      const res = await response.json();

      if (!res.transactions) {
        console.error("No transactions found in response:", res);
        return [];
      }

      return await Promise.all(
        res.transactions.map(async (tx: TransactionData) => {
          const validSignatures = await Promise.all(
            (tx.signatures || []).map(async sig => {
              const signer = (await MultiSig?.read.recover([tx.hash as `0x${string}`, sig])) as `0x${string}`;
              const isOwner = await MultiSig?.read.isOwner([signer as string]);
              return signer && isOwner ? { signer, signature: sig } : null;
            }),
          );

          return { ...tx, validSignatures: validSignatures.filter(Boolean) };
        }),
      );
    } catch (error) {
      console.error("Error fetching transaction data:", error);
      notification.error("Error fetching transaction data");
      return [];
    }
  };

  const queryKey = ["campaign", multisigAddress];
  const { data: transactions, isLoading } = useQuery({
    queryKey,
    queryFn: fetchTransactionData,
    enabled: !!multisigAddress,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const filteredTransactions = transactions?.filter(tx => (isHistory ? tx.isExecuted : !tx.isExecuted));

  return (
    <div className="flex flex-col flex-1 w-full items-center gap-8">
      <div className="flex items-center flex-col flex-grow w-full max-w-2xl">
        <div className="flex flex-col items-center bg-base-100 border border-gray rounded-xl p-6 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="text-xl font-bold">{isHistory ? "History" : "Proposals"}</div>
          </div>

          {!isHistory && (
            <div className="flex w-full">
              <div className="text-sm">Controller:</div> <Address address={multisigAddress} disableBlockie={true} />
            </div>
          )}

          <div className="flex flex-col mt-8 w-full gap-4 h-[18rem] overflow-y-scroll">
            {isLoading ? (
              <div className="bg-white w-4 h-4 mx-auto loading loading-spinner my-20" />
            ) : !filteredTransactions?.length ? (
              <div className="w-full" />
            ) : (
              filteredTransactions.map(tx => (
                <TransactionItem key={tx.hash} tx={tx} onRefetch={() => queryClient.invalidateQueries({ queryKey })} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
