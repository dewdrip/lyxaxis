import { useEffect, useState } from "react";
import Link from "next/link";
import { Address, Balance } from "../scaffold-eth";
import { usePublicClient } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import MultiSigABI from "~~/utils/abis/MultiSigABI.json";

export const MultisigCard = ({ multisigAddress }: { multisigAddress: string }) => {
  const publicClient = usePublicClient();
  const [universalProfileAddress, setUniversalProfileAddress] = useState("");
  const [name, setName] = useState<string>();
  const [signaturesRequired, setSignaturesRequired] = useState<bigint>();

  const { data: owners } = useScaffoldReadContract({
    contractName: "MultiSigRegistry",
    functionName: "getMultisigOwners",
    args: [multisigAddress],
  });

  useEffect(() => {
    const getMultisigData = async () => {
      if (!publicClient || !multisigAddress) return;

      try {
        const [nameResult, signaturesRequiredResult, universalProfileAddress] = await Promise.all([
          publicClient.readContract({
            address: multisigAddress,
            abi: MultiSigABI,
            functionName: "name",
          }),
          publicClient.readContract({
            address: multisigAddress,
            abi: MultiSigABI,
            functionName: "signaturesRequired",
          }),
          publicClient.readContract({
            address: multisigAddress,
            abi: MultiSigABI,
            functionName: "getUniversalProfile",
          }),
        ]);

        setName(nameResult as string);
        setSignaturesRequired(signaturesRequiredResult as bigint);
        setUniversalProfileAddress(universalProfileAddress as `0x${string}`);
      } catch (error) {
        console.error("Error fetching multisig data:", error);
      }
    };

    getMultisigData();
  }, [publicClient, multisigAddress]);

  return (
    <Link href={`/multisig/${multisigAddress}`}>
      <div className="flex bg-base-100 text-center items-center justify-between min-w-[398px] py-4 px-4  rounded-xl">
        <div className="flex flex-col items-start">
          <p className="m-0">{name || "Unnamed Multisig"}</p>
          {universalProfileAddress && <Address address={universalProfileAddress} />}
        </div>
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
