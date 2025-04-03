"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useIsMounted } from "usehooks-ts";
import { useAccount, useWalletClient } from "wagmi";
import { PlusCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Address, AddressInput, InputBase } from "~~/components/scaffold-eth";

const CreateMultiSig: NextPage = () => {
  const { data: walletClient } = useWalletClient();
  const { address: ownerAddress } = useAccount();
  const [signers, setSigners] = useState<string[]>([]);
  const [newSigner, setNewSigner] = useState<string>("");

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

  const handleCreate = () => {};

  return useIsMounted() ? (
    <div className="flex flex-col flex-1 items-center my-20 gap-8 px-2">
      <div className="flex items-center flex-col flex-grow w-full max-w-lg">
        <div className="flex flex-col gap-y-6 bg-base-200 border border-gray rounded-xl w-full p-6">
          <div>
            <label className="label">
              <span className="label-text">Give a name to your Multisig</span>
            </label>
            <InputBase
              value={""}
              placeholder={"Name of multisig"}
              onChange={() => {
                null;
              }}
            />
          </div>
          <div className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-4">
              <label className="label p-0">
                <span className="label-text">Add Signers and number of confirmations</span>
              </label>
              <div className="flex flex-wrap gap-y-3 gap-x-5">
                {signers.map(signer => (
                  <div key={signer} className="flex gap-x-2 cursor-pointer">
                    {/* <span className="text-white">{signer}</span> */}
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
                />
                <div onClick={addSigner} className="flex gap-x-1 text-primary mt-2 text-sm items-center cursor-pointer">
                  <PlusCircleIcon className=" w-6" />
                  <span>Add Signer</span>
                </div>
              </div>
            </div>
          </div>
          <InputBase
            value={"0"}
            placeholder={"Loading..."}
            onChange={() => {
              null;
            }}
          />
          <div className="mt-2 flex items-center">
            <button
              className="w-fit px-12 mx-auto btn btn-secondary btn-md"
              disabled={!walletClient}
              onClick={handleCreate}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default CreateMultiSig;
