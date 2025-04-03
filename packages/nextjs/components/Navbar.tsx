import * as React from "react";
import Link from "next/link";
import { Balance, FaucetButton, RainbowKitCustomConnectButton } from "./scaffold-eth";
// import Logo from "../assets/logo.svg";
import { useAccount } from "wagmi";
import { useNetworkColor } from "~~/hooks/scaffold-eth";

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
  const { address, isConnected, chain } = useAccount();

  const networkColor = useNetworkColor();

  return (
    <div className="bg-base-200 w-[432px] mx-auto justify-between flex  gap-x-1 px-2  border-b border-gray py-4">
      <Link href="/">
        {/* <img src={Logo.src} alt="GoluksMe" className="mt-1 cursor-pointer w-28" /> */}
        <div className="ml-2">Logo</div>
      </Link>

      <div className=" flex">
        <RainbowKitCustomConnectButton />
        {/* <FaucetButton /> */}
      </div>
    </div>
  );
};

export const MultiSigNav = () => {
  return (
    <div className=" w-full flex gap-x-3  border-b border-gray py-4  px-2">
      <NavButton link="/multisig/3820390420" title="Wallet" />
      <NavButton link="/owners/34781823989141" title="Signers" />
      <NavButton link="/events/4274893298980943" title="Event" />
    </div>
  );
};
