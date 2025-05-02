import { useEffect, useState } from "react";
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
  const [hasSignedNewHash, setHasSignedNewHash] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkValidSigForUpdateHah = async () => {
      setIsLoading(true);
      try {
        if (!metaMultiSigWallet || nonce === undefined) {
          setHasSignedNewHash(false);
          setIsLoading(false);
          return;
        }
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
            setHasSignedNewHash(true);
            return;
          }
        }
        setHasSignedNewHash(false);
      } catch (error) {
        console.error("Error checking valid signature for update hash:", error);
        setHasSignedNewHash(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkValidSigForUpdateHah();
  }, [metaMultiSigWallet, nonce, tx.to, tx.amount, tx.data, tx.signatures, address]);

  return { hasSignedNewHash, isLoading };
}
