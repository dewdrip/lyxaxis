"use client";

import { type FC, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useIsMounted, useLocalStorage } from "usehooks-ts";
import { Abi, Address as AddressType, encodeFunctionData } from "viem";
import { useChainId, usePublicClient, useReadContract, useWalletClient } from "wagmi";
import { TransactionData } from "~~/app/create/[id]/page";
import { MultiSigNav } from "~~/components/Navbar";
import { ProfileInput } from "~~/components/ProfileInput";
import { Address, AddressInput, IntegerInput } from "~~/components/scaffold-eth";
import { toaster } from "~~/components/ui/toaster";
import { useMultiSigRegistry } from "~~/hooks/contract/useMultiSigRegistry";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import MultiSigABI from "~~/utils/abis/MultiSigABI.json";
import { getPoolServerUrl } from "~~/utils/getPoolServerUrl";
import { DEFAULT_TX_DATA, Method, OWNERS_METHODS, PredefinedTxData } from "~~/utils/methods";

const Owners: FC = () => {
  const isMounted = useIsMounted();
  let { id: multisigAddress } = useParams();
  multisigAddress = multisigAddress as `0x${string}`;

  const router = useRouter();

  const [predefinedTxData, setPredefinedTxData] = useLocalStorage<PredefinedTxData>(
    "predefined-tx-data",
    DEFAULT_TX_DATA,
  );

  const { data: signaturesRequired } = useReadContract({
    address: multisigAddress,
    abi: MultiSigABI,
    functionName: "signaturesRequired",
  });

  const { data: owners } = useMultiSigRegistry({
    functionName: "getMultisigOwners",
    args: [multisigAddress],
  });

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const { targetNetwork } = useTargetNetwork();
  const chainId = useChainId();

  const poolServerUrl = getPoolServerUrl(targetNetwork.id);

  const { data: nonce } = useReadContract({
    address: multisigAddress,
    abi: MultiSigABI,
    functionName: "nonce",
  });

  const handleCreate = async () => {
    try {
      if (!walletClient) {
        console.log("No wallet client!");
        return;
      }

      const callData = encodeFunctionData({
        abi: MultiSigABI as Abi,
        functionName: predefinedTxData.methodName,
        args: [predefinedTxData.signer, predefinedTxData.newSignaturesNumber],
      });

      const newHash = (await publicClient?.readContract({
        address: multisigAddress,
        abi: MultiSigABI,
        functionName: "getTransactionHash",
        args: [
          nonce as bigint,
          String(multisigAddress),
          BigInt(predefinedTxData.amount as string),
          callData as `0x${string}`,
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
      })) as AddressType;

      const isOwner = await publicClient?.readContract({
        address: multisigAddress,
        abi: MultiSigABI,
        functionName: "isOwner",
        args: [recover],
      });

      if (isOwner) {
        if (!multisigAddress || !predefinedTxData.amount || !multisigAddress) {
          return;
        }

        const txData: TransactionData = {
          chainId: chainId,
          address: multisigAddress,
          nonce: (nonce as bigint) || 0n,
          to: multisigAddress,
          amount: predefinedTxData.amount,
          data: callData as `0x${string}`,
          hash: newHash,
          signatures: [signature],
          signers: [recover],
          requiredApprovals: (signaturesRequired as bigint) || 0n,
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

        setPredefinedTxData({
          ...predefinedTxData,
          callData,
          amount: "0",
          to: multisigAddress,
        });

        setTimeout(() => {
          router.push(`/multisig/${multisigAddress}`);
        }, 777);
      } else {
        toaster.create({
          title: "Only owners can propose transactions",
          type: "info",
        });
      }
    } catch (e) {
      toaster.create({
        title: "Error while proposing transaction",
        type: "error",
      });
      console.log(e);
    }
  };

  useEffect(() => {
    if (predefinedTxData.methodName === "transferFunds") {
      setPredefinedTxData(DEFAULT_TX_DATA);
    }
  }, [predefinedTxData.methodName, setPredefinedTxData]);

  return isMounted() ? (
    <div className="flex flex-col flex-1 items-center  gap-8">
      <MultiSigNav multisigAddress={multisigAddress} />
      <div className="flex items-center flex-col flex-grow w-full max-w-lg px-4">
        <div className="flex flex-col items-center bg-base-100 shadow shadow-secondary border-gray rounded-xl p-6 w-full">
          <div className="max-w-full">Signatures required: {String(signaturesRequired)}</div>

          <div className="mt-6 w-full space-y-3">
            {owners?.map((owner: string, i: number) => (
              <div key={i} className="flex justify-between">
                <Address address={owner} />
                <span>Owner</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-4 form-control w-full">
            <div className="w-full">
              <label className="label">
                <span className="label-text">Select method</span>
              </label>
              <select
                className="select select-bordered select-sm w-full bg-base-200 text-accent font-medium"
                value={predefinedTxData.methodName}
                onChange={e =>
                  setPredefinedTxData({ ...predefinedTxData, methodName: e.target.value as Method, callData: "" })
                }
              >
                {OWNERS_METHODS.map(method => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            <ProfileInput
              onSelectAddress={address => {
                console.log(address);
                return true;
              }}
            />

            <AddressInput
              placeholder="Signer address"
              value={predefinedTxData.signer}
              onChange={s => setPredefinedTxData({ ...predefinedTxData, signer: s })}
            />

            <IntegerInput
              placeholder="New № of signatures required"
              value={predefinedTxData.newSignaturesNumber}
              onChange={s => setPredefinedTxData({ ...predefinedTxData, newSignaturesNumber: s as string })}
              disableMultiplyBy1e18
            />

            <button className="btn btn-secondary btn-sm" onClick={handleCreate}>
              Create Tx
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default Owners;
