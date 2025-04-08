import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

type RegistryFunctionName = "getSignerMultisigs" | "getMultisigOwners" | "isValidMultisig";

interface UseMultiSigRegistryParams {
  functionName: RegistryFunctionName;
  args: [string]; // Address parameter for the registry functions
}

/**
 * Hook for interacting with the MultiSigRegistry contract
 * @param params - Object containing the function name and arguments to call on the registry
 * @returns Object containing the data returned from the registry function call
 */
export const useMultiSigRegistry = (params: UseMultiSigRegistryParams) => {
  const publicClient = usePublicClient();
  const { data: lyxaxisContract } = useDeployedContractInfo("Lyxaxis");
  const [registryAddress, setRegistryAddress] = useState<string>();
  const [data, setData] = useState<any>();

  // Get the registry address from Lyxaxis contract
  useEffect(() => {
    const getRegistryAddress = async () => {
      if (!publicClient || !lyxaxisContract?.address) return;

      try {
        const data = await publicClient.readContract({
          address: lyxaxisContract.address,
          abi: [
            {
              inputs: [],
              name: "getRegistry",
              outputs: [{ internalType: "address", name: "", type: "address" }],
              stateMutability: "view",
              type: "function",
            },
          ],
          functionName: "getRegistry",
        });
        setRegistryAddress(data as string);
      } catch (error) {
        console.error("Error fetching registry address:", error);
      }
    };

    getRegistryAddress();
  }, [publicClient, lyxaxisContract?.address]);

  // Call the specified function on the registry
  useEffect(() => {
    const callRegistryFunction = async () => {
      if (!publicClient || !registryAddress || !params.functionName || !params.args) return;

      try {
        const result = await publicClient.readContract({
          address: registryAddress,
          abi: [
            {
              inputs: [{ internalType: "address", name: "_signer", type: "address" }],
              name: "getSignerMultisigs",
              outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [{ internalType: "address", name: "_multisig", type: "address" }],
              name: "getMultisigOwners",
              outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [{ internalType: "address", name: "_multisig", type: "address" }],
              name: "isValidMultisig",
              outputs: [{ internalType: "bool", name: "", type: "bool" }],
              stateMutability: "view",
              type: "function",
            },
          ],
          functionName: params.functionName,
          args: params.args,
        });
        setData(result);
      } catch (error) {
        console.error(`Error calling ${params.functionName} on registry:`, error);
      }
    };

    callRegistryFunction();
  }, [publicClient, registryAddress, params.functionName, params.args]);

  return { data };
};
