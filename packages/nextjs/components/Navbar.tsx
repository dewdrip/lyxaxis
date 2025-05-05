import * as React from "react";
import Link from "next/link";
import { RainbowKitCustomConnectButton } from "./scaffold-eth";

export const NavButton = ({ link, title }: { link: string; title: string }) => {
  return (
    <Link href={link}>
      <button className="ml-auto btn btn-sm btn-primary flex font-medium justify-center items-center text-sm border px-4 font-body rounded border-gray-400 max-w-[140px] hover:bg-gray-200 cursor-pointer transition-all duration-500">
        {title}
      </button>
    </Link>
  );
};

export const Navbar = () => {
  return (
    <div className="bg-base-200 w-[432px] mx-auto justify-between flex  gap-x-1 px-2  border-b border-gray py-4">
      <Link href="/">
        {/* <img src={Logo.src} alt="GoluksMe" className="mt-1 cursor-pointer w-28" /> */}
        <div className="ml-2">Lyxaxis</div>
      </Link>

      <div className=" flex">
        <RainbowKitCustomConnectButton />
        {/* <FaucetButton /> */}
      </div>
    </div>
  );
};

export const MultiSigNav = ({ multisigAddress }: { multisigAddress: string }) => {
  return (
    <div className=" w-full flex gap-x-3  border-b border-gray py-4  px-2">
      <NavButton link={`/multisig/${multisigAddress}`} title="Wallet" />
      <NavButton link={`/transfer/${multisigAddress}`} title="Transfer" />
      <NavButton link={`/owners/${multisigAddress}`} title="Signers" />
      <NavButton link={`/history/${multisigAddress}`} title="History" />
    </div>
  );
};
