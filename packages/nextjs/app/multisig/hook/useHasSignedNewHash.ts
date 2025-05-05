import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { getController } from "~~/utils/helpers";

// Common types and interfaces
interface TransactionParams {
  metaMultiSigWallet: any;
  nonce: bigint | undefined;
  tx: any;
}

interface CanExecuteParams extends TransactionParams {
  signaturesRequired: bigint | undefined;
}

// Common query configuration
const commonQueryConfig = {
  refetchOnMount: true,
  refetchOnWindowFocus: true,
  staleTime: 10_000_000,
};

const getTransactionHash = async (
  wallet: any,
  params: { nonce: bigint; to: string; amount: string | bigint; data: string },
) => {
  return (await wallet.read.getTransactionHash([
    params.nonce,
    params.to,
    BigInt(params.amount),
    params.data,
  ])) as `0x${string}`;
};

const validateSignature = async (wallet: any, hash: `0x${string}`, signature: string) => {
  const signer = await wallet.read.recover([hash, signature]);
  const isOwner = await wallet.read.isOwner([signer as string]);
  return { signer, isOwner };
};

export function useHasSignedNewHash({ metaMultiSigWallet, nonce, tx }: TransactionParams) {
  const { address } = useAccount();

  const { data: hasSignedNewHash = false, isLoading } = useQuery({
    queryKey: [
      "hasSignedNewHash",
      metaMultiSigWallet?.address,
      nonce?.toString(),
      tx?.to,
      tx?.amount?.toString?.() || tx?.amount,
      tx?.data,
      tx?.signatures,
      address,
    ],
    enabled: !!metaMultiSigWallet && nonce !== undefined && !!tx && Array.isArray(tx.signatures) && !!address,
    queryFn: async () => {
      const newHash = await getTransactionHash(metaMultiSigWallet, {
        nonce: nonce as bigint,
        to: tx.to,
        amount: tx.amount,
        data: tx.data,
      });

      if (!address) throw new Error("Address is undefined");
      const controller = await getController(address as `0x${string}`);

      for (const sig of tx.signatures) {
        const { signer, isOwner } = await validateSignature(metaMultiSigWallet, newHash, sig);
        if (isOwner && signer === controller) {
          return true;
        }
      }

      return false;
    },
    ...commonQueryConfig,
  });

  return { hasSignedNewHash, isLoading };
}

export function useCanExecute({ metaMultiSigWallet, signaturesRequired, nonce, tx }: CanExecuteParams) {
  const { address } = useAccount();

  const { data, isLoading } = useQuery({
    queryKey: [
      "canExecuteTransaction",
      metaMultiSigWallet?.address,
      nonce?.toString(),
      tx?.to,
      tx?.amount?.toString?.() || tx?.amount,
      tx?.data,
      tx?.signatures,
      address,
    ],
    enabled:
      !!metaMultiSigWallet &&
      nonce !== undefined &&
      !!tx &&
      Array.isArray(tx.signatures) &&
      !!address &&
      !!signaturesRequired,
    queryFn: async () => {
      const newHash = await getTransactionHash(metaMultiSigWallet, {
        nonce: nonce as bigint,
        to: tx.to,
        amount: tx.amount,
        data: tx.data,
      });

      let validSignatureCount = 0;

      for (const sig of tx.signatures) {
        const { isOwner } = await validateSignature(metaMultiSigWallet, newHash, sig);
        if (isOwner) {
          validSignatureCount++;
        }
      }

      return {
        canExecuteTransaction: validSignatureCount >= Number(signaturesRequired),
        validSignatureCount,
      };
    },
    ...commonQueryConfig,
  });

  return {
    canExecuteTransaction: data?.canExecuteTransaction ?? false,
    validSignatureCount: data?.validSignatureCount,
    isLoading,
  };
}
