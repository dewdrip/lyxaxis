"use client";

import { type FC, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useIsMounted, useLocalStorage } from "usehooks-ts";
import { Address, isAddress, parseEther } from "viem";
import { useChainId, usePublicClient, useReadContract, useWalletClient } from "wagmi";
import LyxInput from "~~/components/LyxInput";
import { MultiSigNav } from "~~/components/Navbar";
import { ProfileInput } from "~~/components/ProfileInput";
import { InputBase } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import MultiSigABI from "~~/utils/abis/MultiSigABI.json";
import { getPoolServerUrl } from "~~/utils/getPoolServerUrl";
import { DEFAULT_TX_DATA, PredefinedTxData } from "~~/utils/methods";
import { notification } from "~~/utils/scaffold-eth/notification";

export type TransactionData = {
  title: string;
  description: string;
  chainId: number;
  address: Address;
  nonce: bigint;
  to: string;
  amount: string;
  data: `0x${string}`;
  hash: `0x${string}`;
  signatures: `0x${string}`[];
  signers: Address[];
  validSignatures?: { signer: Address; signature: Address }[];
  requiredApprovals: bigint;
  isExecuted?: boolean;
};

const CreatePage: FC = () => {
  let { id: multisigAddress } = useParams();

  multisigAddress = multisigAddress as `0x${string}`;

  const isMounted = useIsMounted();
  const router = useRouter();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const { targetNetwork } = useTargetNetwork();

  const poolServerUrl = getPoolServerUrl(targetNetwork.id);

  const [predefinedTxData, setPredefinedTxData] = useLocalStorage<PredefinedTxData>("predefined-tx-data", {
    methodName: "transferFunds",
    signer: "",
    newSignaturesNumber: "",
    amount: "",
    description: "",
  });

  const { data: nonce } = useReadContract({
    address: multisigAddress,
    abi: MultiSigABI,
    functionName: "nonce",
  });

  const { data: signaturesRequired } = useReadContract({
    address: multisigAddress,
    abi: MultiSigABI,
    functionName: "signaturesRequired",
  });

  const publicClient = usePublicClient();

  const [isProposing, setIsProposing] = useState(false);

  const handleCreate = async () => {
    try {
      if (!walletClient) {
        notification.error("No wallet client!");
        return;
      }

      if (!isAddress(predefinedTxData.signer)) {
        notification.error("Invalid recipient address");
        setIsProposing(false);
        return;
      }

      if (!predefinedTxData.amount || Number(predefinedTxData.amount) <= 0) {
        notification.error("Amount must be greater than 0");
        setIsProposing(false);
        return;
      }

      if (!isAddress(predefinedTxData.signer)) {
        notification.error("Invalid recipient address");
        setIsProposing(false);
        return;
      }

      if (!predefinedTxData.amount || Number(predefinedTxData.amount) <= 0) {
        notification.error("Amount must be greater than 0");
        setIsProposing(false);
        return;
      }

      setIsProposing(true);

      const newHash = (await publicClient?.readContract({
        address: multisigAddress,
        abi: MultiSigABI,
        functionName: "getTransactionHash",
        args: [
          nonce as bigint,
          String(predefinedTxData.signer),
          BigInt(predefinedTxData.amount as string),
          predefinedTxData.callData as `0x${string}`,
        ],
      })) as `0x${string}`;

      const signature = await walletClient.signMessage({
        message: { raw: newHash },
      });

      const recover = (await publicClient?.readContract({
        address: multisigAddress,
        abi: MultiSigABI,
        functionName: "recover",
        args: [newHash, signature],
      })) as Address;

      const isOwner = await publicClient?.readContract({
        address: multisigAddress,
        abi: MultiSigABI,
        functionName: "isOwner",
        args: [recover],
      });

      if (isOwner) {
        const txData: TransactionData = {
          title: "Transfer Funds",
          description: predefinedTxData.description?.trim() || "",
          chainId: chainId,
          address: multisigAddress,
          nonce: (nonce as bigint) || 0n,
          to: predefinedTxData.signer,
          amount: predefinedTxData.amount,
          data: predefinedTxData.callData as `0x${string}`,
          hash: newHash,
          signatures: [signature],
          signers: [recover],
          requiredApprovals: (signaturesRequired as bigint) || 0n,
          isExecuted: false,
        };

        await fetch(poolServerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            txData,
            // stringifying bigint
            (key, value) => (typeof value === "bigint" ? value.toString() : value),
          ),
        });

        setPredefinedTxData(DEFAULT_TX_DATA);

        setTimeout(() => {
          router.push(`/multisig/${multisigAddress}`);
        }, 777);
      } else {
        notification.info("Only owners can propose transactions");
      }
    } catch (e) {
      notification.error("Error while proposing transaction");
      console.log(e);
    } finally {
      setIsProposing(false);
    }
  };

  const handleSelectAddress = (address: `0x${string}`) => {
    setPredefinedTxData({ ...predefinedTxData, signer: address });
  };

  useEffect(() => {
    if (predefinedTxData.methodName !== "transferFunds") {
      setPredefinedTxData({
        ...predefinedTxData,
        methodName: "transferFunds",
        signer: "",
        newSignaturesNumber: "",
        callData: "",
        amount: "",
        description: "",
      });
    }
  }, []);

  return isMounted() ? (
    <div className="w-full">
      <MultiSigNav multisigAddress={multisigAddress} />
      <div className="flex flex-col flex-1 items-center my-10 gap-8 px-4">
        <div className="flex items-center flex-col flex-grow w-full max-w-lg">
          <div className="flex flex-col bg-base-200 border border-gray rounded-xl w-full p-6">
            <div className="flex flex-col gap-4">
              <div className="mt-6 w-full">
                <label className="label">
                  <span className="label-text">Transfer Funds</span>
                </label>
              </div>

              <ProfileInput
                value={predefinedTxData.signer}
                onSelectAddress={handleSelectAddress}
                placeholder="Enter profile name or address"
              />

              <LyxInput
                value={predefinedTxData.amount}
                onChange={val => {
                  setPredefinedTxData({ ...predefinedTxData, amount: String(parseEther(val)) });
                }}
              />

              <InputBase
                value={predefinedTxData.description}
                placeholder="Description (optional)"
                onChange={val => {
                  setPredefinedTxData({ ...predefinedTxData, description: val });
                }}
              />

              <button
                className="btn btn-secondary btn-sm"
                disabled={!walletClient || isProposing}
                onClick={handleCreate}
              >
                {isProposing ? "Proposing..." : "Propose"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default CreatePage;
