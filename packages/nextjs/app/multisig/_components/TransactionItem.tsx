import { type FC, useState } from "react";
import { useRouter } from "next/navigation";
import { Address, BlockieAvatar } from "../../../components/scaffold-eth";
import { useCanExecute, useHasSignedNewHash } from "../hook/useHasSignedNewHash";
import { PreveiwProfileModal } from "./PreviewProfile";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { Abi, DecodeFunctionDataReturnType, decodeFunctionData, formatEther } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { TransactionData } from "~~/app/transfer/[id]/page";
import Profile from "~~/components/Profile";
import {
  useDeployedContractInfo,
  useScaffoldContract,
  useScaffoldReadContract,
  useTransactor,
} from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getPoolServerUrl } from "~~/utils/getPoolServerUrl";
import { truncateString } from "~~/utils/helpers";
import { notification } from "~~/utils/scaffold-eth";

type TransactionItemProps = { tx: TransactionData; completed: boolean; outdated: boolean; onRefetch?: () => void };

export const TransactionItem: FC<TransactionItemProps> = ({ tx, completed, outdated, onRefetch }) => {
  const router = useRouter();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const transactor = useTransactor();
  const { targetNetwork } = useTargetNetwork();
  const poolServerUrl = getPoolServerUrl(targetNetwork.id);

  const [isExecuting, setIsExecuting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const { data: signaturesRequired } = useScaffoldReadContract({
    contractName: "MultiSig",
    contractAddress: tx.address,
    functionName: "signaturesRequired",
  });

  const { data: nonce } = useScaffoldReadContract({
    contractName: "MultiSig",
    contractAddress: tx.address,
    functionName: "nonce",
  });

  const { data: metaMultiSigWallet } = useScaffoldContract({
    contractName: "MultiSig",
    contractAddress: tx.address,
    walletClient,
  });

  const { hasSignedNewHash, isLoading: isCheckingSignatures } = useHasSignedNewHash({
    metaMultiSigWallet,
    nonce,
    tx,
  });

  const {
    canExecuteTransaction,
    validSignatureCount,
    isLoading: isLoadingCanExecute,
  } = useCanExecute({
    metaMultiSigWallet,
    signaturesRequired,
    nonce,
    tx,
  });

  const { data: contractInfo } = useDeployedContractInfo({
    contractName: "MultiSig",
  });

  const combinedAbi = contractInfo?.abi
    ? [
        ...contractInfo.abi,
        ...[
          {
            inputs: [
              {
                internalType: "bytes32",
                name: "dataKey",
                type: "bytes32",
              },
              {
                internalType: "bytes",
                name: "dataValue",
                type: "bytes",
              },
            ],
            name: "setData",
            outputs: [],
            stateMutability: "payable",
            type: "function",
          },
        ],
      ]
    : [];

  const txnData =
    combinedAbi.length > 0 && tx.data
      ? decodeFunctionData({ abi: combinedAbi as Abi, data: tx.data })
      : ({} as DecodeFunctionDataReturnType);

  const hasSigned = tx.signers.indexOf(address as string) >= 0 && BigInt(tx.nonce) === nonce;
  const hasEnoughSignatures = signaturesRequired ? tx.signatures.length >= Number(signaturesRequired) : false;

  const getSortedSigList = async (allSigs: `0x${string}`[], newHash: `0x${string}`) => {
    const sigList = [];
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const s in allSigs) {
      const recover = (await metaMultiSigWallet?.read.recover([newHash, allSigs[s]])) as `0x${string}`;

      sigList.push({ signature: allSigs[s], signer: recover });
    }

    sigList.sort((a, b) => {
      return BigInt(a.signer) > BigInt(b.signer) ? 1 : -1;
    });

    const finalSigList: `0x${string}`[] = [];
    const finalSigners: `0x${string}`[] = [];
    const used: Record<string, boolean> = {};
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const s in sigList) {
      if (!used[sigList[s].signature]) {
        finalSigList.push(sigList[s].signature);

        if (!finalSigners.includes(sigList[s].signer)) {
          finalSigners.push(sigList[s].signer);
        }
      }
      used[sigList[s].signature] = true;
    }

    return [finalSigList, finalSigners];
  };

  const executeTransaction = async () => {
    try {
      setIsExecuting(true);
      if (!contractInfo || !metaMultiSigWallet) {
        console.log("No contract info");
        return;
      }

      const upAddress = (await publicClient?.readContract({
        address: tx.address,
        abi: contractInfo.abi,
        functionName: "getUniversalProfile",
      })) as `0x${string}`;

      const balance = await publicClient?.getBalance({
        address: upAddress,
      });

      if (balance !== undefined && BigInt(tx.amount) > balance) {
        notification.error("Insufficient balance. Please fund your profile.");
        setIsExecuting(false);
        return;
      }

      const newHash = (await metaMultiSigWallet.read.getTransactionHash([
        nonce as bigint,
        tx.to,
        BigInt(tx.amount),
        tx.data,
      ])) as `0x${string}`;

      const [finalSigList] = await getSortedSigList(tx.signatures, newHash);

      const txHash = await transactor(() =>
        metaMultiSigWallet.write.executeTransaction([tx.to, BigInt(tx.amount), tx.data, finalSigList]),
      );

      if (txHash) {
        await fetch(poolServerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            {
              ...tx,
              nonce,
              isExecuted: true,
            },
            // stringifying bigint
            (key, value) => (typeof value === "bigint" ? value.toString() : value),
          ),
        });

        setIsExecuting(false);

        if (onRefetch) {
          onRefetch();
        }
      }
    } catch (e) {
      //notification.error("Error executing transaction");
      console.log(e);
      setIsExecuting(false);
    }
  };

  const signTransaction = async () => {
    try {
      setIsSigning(true);

      if (!walletClient) {
        setIsSigning(false);
        return;
      }

      const newHash = (await metaMultiSigWallet?.read.getTransactionHash([
        nonce as bigint,
        tx.to,
        BigInt(tx.amount),
        tx.data,
      ])) as `0x${string}`;

      const signature = await walletClient.signMessage({
        message: { raw: newHash },
      });

      const signer = await metaMultiSigWallet?.read.recover([newHash, signature]);

      const isOwner = await metaMultiSigWallet?.read.isOwner([signer as string]);

      if (isOwner) {
        // Remove any existing signature from the same signer
        const filteredSignatures: `0x${string}`[] = [];
        for (const sig of tx.signatures) {
          const recovered = await metaMultiSigWallet?.read.recover([newHash, sig]);
          if (recovered !== signer) {
            filteredSignatures.push(sig);
          }
        }
        // Add the new signature
        const updatedSignatures = [...filteredSignatures, signature];

        const [finalSigList, finalSigners] = await getSortedSigList(updatedSignatures, newHash);

        await fetch(poolServerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            {
              ...tx,
              nonce,
              signatures: finalSigList,
              signers: finalSigners,
            },
            // stringifying bigint
            (key, value) => (typeof value === "bigint" ? value.toString() : value),
          ),
        });

        if (onRefetch) {
          onRefetch();
        }
      } else {
        notification.info("Only owners can sign transactions");
      }

      setIsSigning(false);
    } catch (e) {
      notification.error("Error signing transaction");
      console.log(e);
      setIsSigning(false);
    }
  };

  return (
    <>
      <input type="checkbox" id={`label-${tx.hash}`} className="modal-toggle" />
      <div className="modal" role="dialog">
        {txnData.functionName !== "setData" ? (
          <div className="modal-box w-[400px] top-20 mx-auto">
            <div className="flex flex-col">
              <div className="flex gap-2">
                <div className="font-bold">{tx.title}</div>
              </div>

              {tx.description ? (
                <div className="text-sm max-h-[100px] overflow-y-auto mt-2">{tx.description}</div>
              ) : (
                <div className="text-sm flex-1 text-slate-400">No description</div>
              )}

              <div className="flex flex-col gap-2 mt-6">
                {txnData.args ? (
                  <>
                    <h4 className="font-bold">Arguments</h4>
                    <div className="flex gap-4">
                      Updated signer: <Address address={String(txnData.args?.[0])} />
                    </div>
                    <div>Updated signatures required: {String(txnData.args?.[1])}</div>
                  </>
                ) : (
                  <>
                    <div className="flex gap-4">
                      Recipient: <Address address={tx.to} />{" "}
                    </div>
                    <div>Amount: {formatEther(BigInt(tx.amount))} LYX </div>
                  </>
                )}
              </div>
              <div className="mt-4">
                {String(signaturesRequired) && (
                  <span>
                    Signed: {validSignatureCount}/{String(signaturesRequired)} {hasSignedNewHash ? "✅" : ""}
                  </span>
                )}
                <div className="font-bold">Sig hash</div>{" "}
                <div className="flex gap-1 mt-2">
                  <BlockieAvatar size={20} address={tx.hash} /> {tx.hash.slice(0, 7)}
                </div>
              </div>
              <div className="modal-action">
                <label htmlFor={`label-${tx.hash}`} className="btn btn-sm">
                  Close!
                </label>
              </div>
            </div>
          </div>
        ) : (
          <PreveiwProfileModal txnData={txnData} tx={tx} />
        )}
      </div>

      <div className="flex flex-col pb-2 border-b border-secondary last:border-b-0">
        <div className="flex w-full gap-4 justify-between">
          <div className="flex flex-col gap-y-1">
            <div className="font-bold">{truncateString(tx.title, 16)}</div>

            {tx.description ? (
              <div className="text-sm flex-1">{truncateString(tx.description, 50)}</div>
            ) : (
              <div className="text-sm flex-1 text-slate-400">No description</div>
            )}

            {Object.keys(txnData).length === 0 && (
              <div className="flex gap-1 items-center">
                To:{" "}
                <Profile
                  address={(txnData.args?.[0] ? String(txnData.args?.[0]) : tx.to) as `0x${string}`}
                  imageClassName="w-6"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-y-4 items-end">
            <div className="flex gap-x-2 items-center justify-end">
              <div className="flex gap-1 font-bold">
                {String(signaturesRequired) && (
                  <span className="whitespace-nowrap">
                    Signed: {validSignatureCount}/{String(signaturesRequired)} {hasSignedNewHash ? "✅" : ""}
                  </span>
                )}
              </div>
              <label htmlFor={`label-${tx.hash}`} className=" text-blue-500 hover:text-blue-700">
                <IoIosInformationCircleOutline size={24} />
              </label>
            </div>
            {/* 
            {isCheckingSignatures ? (
              <div>Loading...</div>
            ) : !hasSignedNewHash ? (
              <div className="text-sm">Outdated, Resign!</div>
            ) : (
              <div className="text-sm">Pending Transaction</div>
            )} */}

            {!tx.isExecuted &&
              (isCheckingSignatures || isLoadingCanExecute ? (
                <div className="flex w-full items-center justify-center">
                  <div className="loading loading-xs" />
                </div>
              ) : (
                <div className="flex justify-center items-center gap-x-2">
                  <div className="flex" title={hasSigned ? "You have already Signed this transaction" : ""}>
                    <button
                      className="btn btn-xs w-[3.6rem] btn-primary"
                      disabled={hasSignedNewHash}
                      title={!hasEnoughSignatures ? "Not enough signers to Execute" : ""}
                      onClick={signTransaction}
                    >
                      {isSigning ? <div className="loading loading-xs" /> : "Sign"}
                    </button>
                  </div>

                  <div title={!hasEnoughSignatures ? "Not enough signers to Execute" : ""}>
                    <button
                      className="btn btn-xs w-[3.6rem] btn-primary "
                      disabled={!canExecuteTransaction}
                      onClick={executeTransaction}
                    >
                      {isExecuting ? <div className="loading loading-xs" /> : "Exec"}
                    </button>
                  </div>
                </div>
              ))}

            <div>{truncateString(formatEther(BigInt(tx.amount)), 9)} LYX</div>
          </div>
        </div>
      </div>
    </>
  );
};
