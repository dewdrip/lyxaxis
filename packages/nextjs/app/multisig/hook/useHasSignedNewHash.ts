import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

export function useHasSignedNewHash({
  metaMultiSigWallet,
  nonce,
  tx,
}: {
  metaMultiSigWallet: any;
  nonce: bigint | undefined;
  tx: any;
}) {
  const { address } = useAccount();

  const { data: hasSignedNewHash = false, isLoading } = useQuery({
    queryKey: [
      "hasSignedNewHash",
      metaMultiSigWallet?.address,
      nonce?.toString(), // ✅ Convert BigInt to string
      tx?.to,
      tx?.amount?.toString?.() || tx?.amount, // ✅ Safe conversion if it's BigInt
      tx?.data,
      tx?.signatures,
      address,
    ],
    enabled: !!metaMultiSigWallet && nonce !== undefined && !!tx && Array.isArray(tx.signatures) && !!address,
    queryFn: async () => {
      const newHash = (await metaMultiSigWallet.read.getTransactionHash([
        nonce as bigint,
        tx.to,
        BigInt(tx.amount),
        tx.data,
      ])) as `0x${string}`;

      for (const sig of tx.signatures) {
        const signer = await metaMultiSigWallet.read.recover([newHash, sig]);
        const isOwner = await metaMultiSigWallet.read.isOwner([signer as string]);
        if (isOwner && signer === address) {
          return true;
        }
      }

      return false;
    },
    refetchOnMount: true, // Always refetch when the component mounts
    refetchOnWindowFocus: true,
    staleTime: 10_000_000, // adjust as needed
  });

  return { hasSignedNewHash, isLoading };
}

export function useCanExecute({
  metaMultiSigWallet,
  signaturesRequired,
  nonce,
  tx,
}: {
  metaMultiSigWallet: any;
  signaturesRequired: bigint | undefined;
  nonce: bigint | undefined;
  tx: any;
}) {
  const { address } = useAccount();

  const { data, isLoading } = useQuery({
    queryKey: [
      "canExecuteTransaction",
      metaMultiSigWallet?.address,
      nonce?.toString(), // ✅ Convert BigInt to string
      tx?.to,
      tx?.amount?.toString?.() || tx?.amount, // ✅ Safe conversion if it's BigInt
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
      const newHash = (await metaMultiSigWallet.read.getTransactionHash([
        nonce as bigint,
        tx.to,
        BigInt(tx.amount),
        tx.data,
      ])) as `0x${string}`;

      let validSignatureCount = 0;

      for (const sig of tx.signatures) {
        const signer = await metaMultiSigWallet.read.recover([newHash, sig]);
        const isOwner = await metaMultiSigWallet.read.isOwner([signer as string]);
        if (isOwner) {
          validSignatureCount++;
        }
      }

      if (validSignatureCount >= Number(signaturesRequired)) {
        return { canExecuteTransaction: true, validSignatureCount };
      } else {
        return { canExecuteTransaction: false, validSignatureCount };
      }
    },
    refetchOnMount: true, // Always refetch when the component mounts
    refetchOnWindowFocus: true,
    staleTime: 10_000_000, // adjust as needed
  });

  return {
    canExecuteTransaction: data?.canExecuteTransaction ?? false,
    validSignatureCount: data?.validSignatureCount,
    isLoading,
  };
}
