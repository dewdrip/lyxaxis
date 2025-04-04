"use client";

import { type FC, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useIsMounted, useLocalStorage } from "usehooks-ts";
import { Address, parseEther } from "viem";
import { useChainId, useWalletClient } from "wagmi";
import { MultiSigNav } from "~~/components/Navbar";
import { AddressInput, EtherInput, InputBase } from "~~/components/scaffold-eth";
import { useDeployedContractInfo, useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getPoolServerUrl } from "~~/utils/getPoolServerUrl";
import { DEFAULT_TX_DATA, METHODS, Method, PredefinedTxData } from "~~/utils/methods";
import { notification } from "~~/utils/scaffold-eth";

export type TransactionData = {
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

  const [ethValue, setEthValue] = useState("");
  const { data: contractInfo } = useDeployedContractInfo("MultiSig");

  const [predefinedTxData, setPredefinedTxData] = useLocalStorage<PredefinedTxData>("predefined-tx-data", {
    methodName: "transferFunds",
    signer: "",
    newSignaturesNumber: "",
    amount: "0",
  });

  const { data: nonce } = useScaffoldReadContract({
    contractName: "MultiSig",
    contractAddress: multisigAddress,
    functionName: "nonce",
  });

  console.log("nonce", nonce);

  const { data: signaturesRequired } = useScaffoldReadContract({
    contractName: "MultiSig",
    functionName: "signaturesRequired",
  });

  const txTo = predefinedTxData.methodName === "transferFunds" ? predefinedTxData.signer : multisigAddress;

  const { data: metaMultiSigWallet } = useScaffoldContract({
    contractName: "MultiSig",
    contractAddress: multisigAddress,
  });

  const handleCreate = async () => {
    try {
      if (!walletClient) {
        console.log("No wallet client!");
        return;
      }

      const newHash = (await metaMultiSigWallet?.read.getTransactionHash([
        nonce as bigint,
        String(txTo),
        BigInt(predefinedTxData.amount as string),
        predefinedTxData.callData as `0x${string}`,
      ])) as `0x${string}`;

      const signature = await walletClient.signMessage({
        message: { raw: newHash },
      });

      const recover = (await metaMultiSigWallet?.read.recover([newHash, signature])) as Address;

      const isOwner = await metaMultiSigWallet?.read.isOwner([recover]);

      if (isOwner) {
        if (!multisigAddress || !predefinedTxData.amount || !txTo) {
          return;
        }

        const txData: TransactionData = {
          chainId: chainId,
          address: multisigAddress,
          nonce: nonce || 0n,
          to: txTo,
          amount: predefinedTxData.amount,
          data: predefinedTxData.callData as `0x${string}`,
          hash: newHash,
          signatures: [signature],
          signers: [recover],
          requiredApprovals: signaturesRequired || 0n,
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
    }
  };

  useEffect(() => {
    if (predefinedTxData && !predefinedTxData.callData && predefinedTxData.methodName !== "transferFunds") {
      setPredefinedTxData({
        ...predefinedTxData,
        methodName: "transferFunds",
        callData: "",
      });
    }
  }, [predefinedTxData, setPredefinedTxData]);

  return isMounted() ? (
    <div className="w-full">
      <MultiSigNav multisigAddress={multisigAddress} />
      <div className="flex flex-col flex-1 items-center my-10 gap-8 px-4">
        <div className="flex items-center flex-col flex-grow w-full max-w-lg">
          <div className="flex flex-col bg-base-200 border border-gray rounded-xl w-full p-6">
            <div>
              <label className="label">
                <span className="label-text">Nonce</span>
              </label>
              <InputBase
                disabled
                value={nonce !== undefined ? `# ${nonce}` : "Loading..."}
                placeholder={"Loading..."}
                onChange={() => {
                  null;
                }}
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="mt-6 w-full">
                <label className="label">
                  <span className="label-text">Select method</span>
                </label>
                <select
                  className="select select-bordered select-sm w-full bg-base-200 text-accent font-medium"
                  value={predefinedTxData.methodName}
                  onChange={e =>
                    setPredefinedTxData({
                      ...predefinedTxData,
                      methodName: e.target.value as Method,
                      callData: "" as `0x${string}`,
                    })
                  }
                >
                  <option value={"transferFunds"}>transferFunds</option>
                </select>
              </div>

              <AddressInput
                placeholder={predefinedTxData.methodName === "transferFunds" ? "Recipient address" : "Signer address"}
                value={predefinedTxData.signer}
                onChange={signer => setPredefinedTxData({ ...predefinedTxData, signer: signer })}
              />

              {predefinedTxData.methodName === "transferFunds" && (
                <EtherInput
                  value={ethValue}
                  onChange={val => {
                    setPredefinedTxData({ ...predefinedTxData, amount: String(parseEther(val)) });
                    setEthValue(val);
                  }}
                />
              )}
              <InputBase
                value={predefinedTxData.callData || ""}
                placeholder={"Calldata"}
                onChange={() => {
                  null;
                }}
                disabled
              />

              <button className="btn btn-secondary btn-sm" disabled={!walletClient} onClick={handleCreate}>
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default CreatePage;
