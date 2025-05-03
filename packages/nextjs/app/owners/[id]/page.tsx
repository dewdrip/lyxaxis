"use client";

import { type FC, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Checkbox } from "@chakra-ui/react";
import { useIsMounted, useLocalStorage } from "usehooks-ts";
import { Abi, Address as AddressType, encodeFunctionData, isAddress } from "viem";
import { useChainId, usePublicClient, useReadContract, useWalletClient } from "wagmi";
import { TrashIcon } from "@heroicons/react/24/solid";
import { TransactionData } from "~~/app/transfer/[id]/page";
import { MultiSigNav } from "~~/components/Navbar";
import Profile from "~~/components/Profile";
import { ProfileInput } from "~~/components/ProfileInput";
import { InputBase, IntegerInput } from "~~/components/scaffold-eth";
import { useMultiSigRegistry } from "~~/hooks/contract/useMultiSigRegistry";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import MultiSigABI from "~~/utils/abis/MultiSigABI.json";
import { getPoolServerUrl } from "~~/utils/getPoolServerUrl";
import { DEFAULT_TX_DATA, PredefinedTxData } from "~~/utils/methods";
import { notification } from "~~/utils/scaffold-eth/notification";

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
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    try {
      setIsCreating(true);
      if (!walletClient) {
        console.log("No wallet client!");
        return;
      }

      if (!isAddress(predefinedTxData.signer)) {
        notification.error("Invalid signer address");
        setIsCreating(false);
        return;
      }

      if (Number(predefinedTxData.newSignaturesNumber) < 1) {
        notification.error("Required signatures must be at least 1");
        setIsCreating(false);
        return;
      }

      if (predefinedTxData.methodName === "addSigner") {
        if (Number(predefinedTxData.newSignaturesNumber) > (owners?.length || 0) + 1) {
          notification.error(`New required signatures cannot exceed ${(owners?.length || 0) + 1}`);
          setIsCreating(false);
          return;
        }
        const isAlreadyOwner = await publicClient?.readContract({
          address: multisigAddress,
          abi: MultiSigABI,
          functionName: "isOwner",
          args: [predefinedTxData.signer],
        });

        if (isAlreadyOwner) {
          notification.error("Address is already an owner");
          setIsCreating(false);
          return;
        }
      } else if (predefinedTxData.methodName === "removeSigner") {
        if (Number(predefinedTxData.newSignaturesNumber) > (owners?.length || 0) - 1) {
          notification.error(`New required signatures cannot exceed ${(owners?.length || 0) - 1}`);
          setIsCreating(false);
          return;
        }
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
        args: [nonce as bigint, String(multisigAddress), 0n, callData as `0x${string}`],
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
        const txData: TransactionData = {
          title: predefinedTxData.methodName === "addSigner" ? "Add Signer" : "Remove Signer",
          description: predefinedTxData.description?.trim() || "",
          chainId: chainId,
          address: multisigAddress,
          nonce: (nonce as bigint) || 0n,
          to: multisigAddress,
          amount: "0",
          data: callData as `0x${string}`,
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

        setPredefinedTxData({
          ...predefinedTxData,
          callData,
          amount: "0",
          to: multisigAddress,
        });

        router.push(`/multisig/${multisigAddress}`);
      } else {
        notification.info("Only owners can propose transactions");
      }
    } catch (e) {
      notification.error("Error while proposing transaction");
      console.log(e);
    } finally {
      setIsCreating(false);
    }
  };

  const [addSigner, setAddSigner] = useState(true);

  useEffect(() => {
    if (predefinedTxData.methodName === "addSigner") {
      setAddSigner(true);
    } else if (owners?.length && predefinedTxData.methodName === "removeSigner") {
      setAddSigner(false);
    } else {
      setPredefinedTxData({
        ...predefinedTxData,
        methodName: "addSigner",
        signer: "",
        newSignaturesNumber: "",
        description: "",
      });
    }
  }, []);

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

                {owners?.length > 1 && (
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
                )}
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

            <InputBase
              value={predefinedTxData.description}
              placeholder="Description (optional)"
              onChange={val => {
                setPredefinedTxData({ ...predefinedTxData, description: val });
              }}
            />

            <button className="btn btn-secondary btn-sm" onClick={handleCreate} disabled={!walletClient || isCreating}>
              {isCreating ? "Proposing..." : "Propose"}
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default Owners;
