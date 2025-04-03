"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useIsMounted } from "usehooks-ts";
import { useAccount, useWalletClient } from "wagmi";
import { PlusCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Address, AddressInput, InputBase } from "~~/components/scaffold-eth";
import { useCreateWallet } from "~~/hooks/contract/useCreateWallet";
import { notification } from "~~/utils/scaffold-eth";

const CreateMultiSig: NextPage = () => {
  const { data: walletClient } = useWalletClient();
  const { address: ownerAddress } = useAccount();
  const [signers, setSigners] = useState<string[]>([]);
  const [newSigner, setNewSigner] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [requiredSignatures, setRequiredSignatures] = useState<string>("");

  const { createWallet, isLoading, error, deployedAddress } = useCreateWallet();

  useEffect(() => {
    if (ownerAddress) {
      setSigners([ownerAddress]);
    }
  }, [ownerAddress]);

  const addSigner = () => {
    if (newSigner && !signers.includes(newSigner)) {
      setSigners([...signers, newSigner]);
      setNewSigner("");
    }
  };

  const removeSigner = (signerToRemove: string) => {
    if (signerToRemove === ownerAddress) return;
    setSigners(signers.filter(signer => signer !== signerToRemove));
  };

  const handleKeyPressOnAddSigner = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Add Signer
    }
  };

  const handleCreate = async () => {
    if (!name) {
      notification.error("Please enter a name for the multisig");
      return;
    }

    if (signers.length < 2) {
      notification.error("Please add at least 2 signers");
      return;
    }

    const reqSigs = parseInt(requiredSignatures);
    if (isNaN(reqSigs) || reqSigs < 1 || reqSigs > signers.length) {
      notification.error("Invalid number of required signatures");
      return;
    }

    try {
      await createWallet({
        name,
        chainId: 31337n,
        owners: signers as `0x${string}`[],
        signaturesRequired: BigInt(requiredSignatures || "0"),
      });

      if (error) {
        throw error;
      }

      notification.success("Multisig created successfully!");

      setName("");
      setSigners(ownerAddress ? [ownerAddress] : []);
      setNewSigner("");
      setRequiredSignatures("");
    } catch (error) {
      console.error("Error creating multisig:", error);
      notification.error("Error creating multisig");
    }
  };

  return useIsMounted() ? (
    <div className="flex flex-col flex-1 items-center my-20 gap-8 px-2">
      <div className="flex items-center flex-col flex-grow w-full max-w-lg">
        <div className="flex flex-col gap-y-6 bg-base-200 border border-gray rounded-xl w-full p-6">
          <div>
            <label className="label">
              <span className="label-text">Give a name to your Multisig</span>
            </label>
            <InputBase value={name} placeholder={"Name of multisig"} onChange={(value: string) => setName(value)} />
          </div>
          <div className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-4">
              <label className="label p-0">
                <span className="label-text">Add Signers and number of confirmations</span>
              </label>
              <div className="flex flex-wrap gap-y-3 gap-x-5">
                {signers.map(signer => (
                  <div key={signer} className="flex gap-x-2 cursor-pointer">
                    <Address address={signer} />
                    <TrashIcon className="w-6 text-red-500 cursor-pointer" onClick={() => removeSigner(signer)} />
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-y-1">
                <AddressInput
                  placeholder={"Signer address"}
                  value={newSigner}
                  onChange={(newValue: string) => setNewSigner(newValue)}
                  // onKeyPress={handleKeyPressOnAddSigner}
                />
                <div onClick={addSigner} className="flex gap-x-1 text-primary mt-2 text-sm items-center cursor-pointer">
                  <PlusCircleIcon className=" w-6" />
                  <span>Add Signer</span>
                </div>
              </div>
            </div>
          </div>
          <InputBase
            value={requiredSignatures}
            placeholder={"Required number of signatures"}
            onChange={(value: string) => setRequiredSignatures(value)}
          />
          <div className="mt-2 flex items-center">
            <button
              className="w-fit px-12 mx-auto btn btn-secondary btn-md"
              disabled={!walletClient || isLoading}
              onClick={handleCreate}
            >
              {isLoading ? "Creating..." : "Create"}
            </button>
          </div>

          {!!deployedAddress && (
            <div className="flex">
              <span className="mr-2">New Multisig:</span> <Address address={deployedAddress} />
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;
};

export default CreateMultiSig;
