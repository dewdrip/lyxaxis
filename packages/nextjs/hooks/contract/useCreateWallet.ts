import { useState } from "react";
import { Address } from "viem";
import { useScaffoldWatchContractEvent, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface CreateWalletParams {
  name: string;
  chainId: bigint;
  owners: Address[];
  signaturesRequired: bigint;
}

export const useCreateWallet = () => {
  const [deployedAddress, setDeployedAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { writeContractAsync: createWallet } = useScaffoldWriteContract({
    contractName: "Lyxaxis",
  });

  // Watch for the CreatedMultisig event
  useScaffoldWatchContractEvent({
    contractName: "Lyxaxis",
    eventName: "CreatedMultisig",
    onLogs: logs => {
      // Get the most recent event's multisig address
      const latestLog = logs[logs.length - 1];
      if (latestLog && "multisig" in latestLog.args) {
        setDeployedAddress(latestLog.args.multisig as Address);
        setIsLoading(false);
      }
    },
  });

  const createWalletWithParams = async (params: CreateWalletParams) => {
    try {
      setIsLoading(true);
      setError(null);
      setDeployedAddress(null); // Reset the deployed address
      await createWallet({
        functionName: "createWallet",
        args: [params.name, params.chainId, params.owners, params.signaturesRequired],
      });
    } catch (error) {
      console.error("Error creating wallet:", error);
      setError(error instanceof Error ? error : new Error("Unknown error occurred"));
      throw error;
    } finally {
      // Only set loading to false here if the event listener hasn't already done it
      if (!deployedAddress) {
        setIsLoading(false);
      }
    }
  };

  return {
    createWallet: createWalletWithParams,
    deployedAddress,
    isLoading,
    error,
  };
};
