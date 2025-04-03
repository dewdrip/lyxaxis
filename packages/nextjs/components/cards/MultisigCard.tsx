import Link from "next/link";
import { Address } from "../scaffold-eth";

export const MultisigCard = ({ multisigAddress }: { multisigAddress: string }) => {
  return (
    <Link href={`/multisig/${multisigAddress}`}>
      <div className="flex bg-base-100 text-center items-center justify-between min-w-[398px] py-4 px-4  rounded-xl">
        <div className="flex flex-col items-start">
          <p className="m-0">Name of Multisig</p>
          <Address address={multisigAddress} />
        </div>
        <div>
          <p className="m-0">Signers: 1/2</p>
          <div>Balance: $0</div>
        </div>
      </div>
    </Link>
  );
};
