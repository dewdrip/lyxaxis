"use client";

import { type FC, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Checkbox } from "@chakra-ui/react";
import { useIsMounted, useLocalStorage } from "usehooks-ts";
import { Abi, Address as AddressType, encodeFunctionData } from "viem";
import { useChainId, usePublicClient, useReadContract, useWalletClient } from "wagmi";
import { TrashIcon } from "@heroicons/react/24/solid";
import { TransactionData } from "~~/app/transfer/[id]/page";
import { MultiSigNav } from "~~/components/Navbar";
import Profile from "~~/components/Profile";
import { ProfileInput } from "~~/components/ProfileInput";
import { IntegerInput } from "~~/components/scaffold-eth";
import { toaster } from "~~/components/ui/toaster";
import { useMultiSigRegistry } from "~~/hooks/contract/useMultiSigRegistry";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import MultiSigABI from "~~/utils/abis/MultiSigABI.json";
import { getPoolServerUrl } from "~~/utils/getPoolServerUrl";
import { DEFAULT_TX_DATA, PredefinedTxData } from "~~/utils/methods";

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

  const [selectedForRemoval, setSelectedForRemoval] = useState<string | null>(null);

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

  const [addSigner, setAddSigner] = useState(true);

  return isMounted() ? (
    <div className="flex flex-col flex-1 items-center  gap-8">
      <MultiSigNav multisigAddress={multisigAddress} />
      <div className="flex items-center flex-col flex-grow w-full max-w-lg px-4">
        <div className="flex flex-col items-center bg-base-100 shadow shadow-secondary border-gray rounded-xl p-6 w-full">
          <div className="max-w-full">Signatures required: {String(signaturesRequired)}</div>

          <div className="mt-6 w-full space-y-3 max-h-[100px] overflow-y-auto">
            {owners?.map((owner: string, i: number) => (
              <div key={i} className="flex justify-between items-center">
                <Profile address={owner as `0x${string}`} imageClassName="w-6" />
                <div className="flex items-center gap-2">
                  <span>Owner</span>
                  {!addSigner && selectedForRemoval !== owner && (
                    <TrashIcon
                      className="w-5 text-red-500 cursor-pointer hover:text-red-700"
                      onClick={() => {
                        setSelectedForRemoval(owner);
                        setPredefinedTxData({
                          ...predefinedTxData,
                          signer: owner,
                        });
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-4 form-control w-full">
            <div className="w-full">
              <div className="flex gap-4">
                <Checkbox.Root
                  checked={addSigner}
                  onCheckedChange={() => {
                    setAddSigner(true);
                    setSelectedForRemoval(null);
                    setPredefinedTxData({
                      ...predefinedTxData,
                      methodName: "addSigner",
                      signer: "",
                      newSignaturesNumber: "",
                    });
                  }}
                  className="cursor-pointer"
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control>
                    <Checkbox.Indicator className="border border-gray bg-base-200" />
                  </Checkbox.Control>
                  <Checkbox.Label>Add Signer</Checkbox.Label>
                </Checkbox.Root>

                <Checkbox.Root
                  checked={!addSigner}
                  onCheckedChange={() => {
                    setAddSigner(false);
                    setSelectedForRemoval(null);
                    setPredefinedTxData({
                      ...predefinedTxData,
                      methodName: "removeSigner",
                      signer: "",
                      newSignaturesNumber: "",
                    });
                  }}
                  className="cursor-pointer"
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control>
                    <Checkbox.Indicator className="border border-gray bg-base-200" />
                  </Checkbox.Control>
                  <Checkbox.Label>Remove Signer</Checkbox.Label>
                </Checkbox.Root>
              </div>
            </div>

            <ProfileInput
              value={predefinedTxData.signer}
              onSelectAddress={address => setPredefinedTxData({ ...predefinedTxData, signer: address })}
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
