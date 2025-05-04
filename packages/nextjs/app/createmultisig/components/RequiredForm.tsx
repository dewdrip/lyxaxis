import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { BackButton } from "./BackButton";
import { useIsMounted } from "usehooks-ts";
import { isAddress } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { PlusCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import Profile from "~~/components/Profile";
import { ProfileInput } from "~~/components/ProfileInput";
import { InputBase } from "~~/components/scaffold-eth";
import { UniversalProfileOwner } from "~~/types/universalProfile";
import { getController } from "~~/utils/helpers";
import { notification } from "~~/utils/scaffold-eth";

export const RequiredForm = ({
  setSigners,
  signers,
  setName,
  name,
  handleCreate,
  isCreateWalletLoading,

  newSigner,
  setNewSigner,
  setRequiredSignatures,
  requiredSignatures,
  pages,
  setPages,
}: {
  handleCreate: () => Promise<void>;
  setSigners: Dispatch<SetStateAction<string[]>>;
  setName: Dispatch<SetStateAction<string>>;
  setNewSigner: Dispatch<SetStateAction<UniversalProfileOwner>>;
  newSigner: UniversalProfileOwner;
  signers: string[];
  name: string;
  isCreateWalletLoading: boolean;

  setRequiredSignatures: Dispatch<SetStateAction<string>>;
  requiredSignatures: string;
  setPages: Dispatch<SetStateAction<number>>;
  pages: number;
}) => {
  const { data: walletClient } = useWalletClient();

  const { address: ownerAddress } = useAccount();

  const [newSignerError, setNewSignerError] = useState<string>("");

  const [owners, setOwners] = useState<UniversalProfileOwner[]>([]);

  useEffect(() => {
    (async () => {
      if (ownerAddress) {
        const controller = await getController(ownerAddress as `0x${string}`);
        setOwners([{ address: ownerAddress, controller }]);
        setSigners([controller]);
      }
    })();
  }, [ownerAddress]);

  const addSigner = () => {
    if (!newSigner) return;

    if (!signers.includes(newSigner.controller)) {
      setSigners([...signers, newSigner.controller]);
      setOwners([...owners, newSigner]);
      setNewSigner({ address: "", controller: "" });
    } else {
      notification.error("Signer already added");
    }
  };

  const removeSigner = (signerToRemove: string) => {
    setSigners(signers.filter(signer => signer !== signerToRemove));
    setOwners(owners.filter(owner => owner.controller !== signerToRemove));
  };

  const handleNext = () => {
    if (!name) {
      notification.error("Please enter a name for the multisig");
      return;
    }

    if (signers.length === 0) {
      notification.error("Please add at least one signer");
      return;
    }

    if (Number(requiredSignatures) <= 0) {
      notification.error("Required signatures must be greater than 0");
      return;
    }

    if (Number(requiredSignatures) > signers.length) {
      notification.error("Required signatures cannot be greater than number of signers");
      return;
    }

    setPages(1);
  };

  const handleKeyPressOnAddSigner = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addSigner();
    }
  };

  return useIsMounted() ? (
    <div className="flex flex-col flex-1 items-center  gap-8 px-4">
      <div className="flex  flex-col flex-grow w-full max-w-lg">
        <div className="mt-5 mb-2">
          <BackButton action={() => setPages(0)} isRequiredPage={true} />
          <div className="text-left text-2xl mt-2">Create a new Multisig</div>
          <div className="text-sm max-w-[350px]">
            Set a name, signers and number of signatures for your multisig. These details are required
          </div>
        </div>

        <div className="flex flex-col h-[450px] overflow-y-scroll gap-y-6 bg-base-200 border border-gray rounded-xl w-full p-4">
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
              <div className="flex flex-wrap gap-y-3 gap-x-3 max-h-[100px] overflow-y-auto">
                {owners
                  .map(owner => (
                    <div key={owner.address} className="flex gap-x-1 cursor-pointer">
                      <Profile address={owner.address as `0x${string}`} imageClassName="w-6" />
                      {owners.length > 1 && (
                        <TrashIcon
                          className="w-5 text-red-500 cursor-pointer"
                          onClick={() => removeSigner(owner.controller)}
                        />
                      )}
                    </div>
                  ))
                  .reverse()}
              </div>
              <div className="flex flex-col gap-y-1">
                <ProfileInput
                  value={newSigner.address}
                  onSelectAddress={profile => {
                    setNewSigner(profile);
                    setNewSignerError("");
                  }}
                  placeholder={"Signer address"}
                />

                {newSignerError ? (
                  <div className="text-red-500 text-sm">{newSignerError}</div>
                ) : (
                  newSigner.address &&
                  isAddress(newSigner.address) && (
                    <div
                      onClick={addSigner}
                      className="flex gap-x-1 text-primary mt-2 text-sm items-center cursor-pointer"
                    >
                      <PlusCircleIcon className="w-4" />
                      <span>Add Signer</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
          <InputBase
            value={requiredSignatures}
            placeholder={"Required number of signatures"}
            onChange={(value: string) => setRequiredSignatures(value)}
          />
          <div className="mt-2 flex items-center justify-center px-4">
            {/* <button
              className="w-fit px-12 btn btn-base-100 border-primary btn-sm h-[2.5rem] rounded-xl hover:border-primary"
              disabled={!walletClient || isCreateWalletLoading}
              onClick={handleCreate}
            >
              Back
            </button> */}
            <button
              className="w-fit px-12 btn btn-primary btn-sm h-[2.5rem] rounded-xl"
              disabled={!walletClient || isCreateWalletLoading}
              onClick={handleNext}
            >
              {isCreateWalletLoading ? "Creating..." : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};
