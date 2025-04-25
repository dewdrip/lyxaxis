import Link from "next/link";
import Profile from "../Profile";
import { Balance } from "../scaffold-eth";
import { usePublicClient } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const MultisigCard = ({ multisigAddress }: { multisigAddress: string }) => {
  const { data: owners } = useScaffoldReadContract({
    contractName: "MultiSigRegistry",
    functionName: "getMultisigOwners",
    args: [multisigAddress],
  });

  const { data: signaturesRequired } = useScaffoldReadContract({
    contractName: "MultiSig",
    contractAddress: multisigAddress,
    functionName: "signaturesRequired",
  });
  const { data: universalProfileAddress } = useScaffoldReadContract({
    contractName: "MultiSig",
    contractAddress: multisigAddress,
    functionName: "getUniversalProfile",
  });

  return (
    <Link href={`/multisig/${multisigAddress}`}>
      <div className="flex bg-base-100 text-center items-center justify-between w-full py-4 px-4  rounded-xl">
        {universalProfileAddress && <Profile address={universalProfileAddress as `0x${string}`} />}
        <div>
          <p className="m-0">
            Signers: {signaturesRequired?.toString() || "?"}/{owners?.length || 0}
          </p>
          <Balance address={universalProfileAddress} />
        </div>
      </div>
    </Link>
  );
};
