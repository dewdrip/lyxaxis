"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DarkLogo from "../public/lyxaxisdarkbg.svg";
import WhiteLogo from "../public/lyxaxiswhitebg.svg";
import { UPRainbowKitCustomConnectButton } from "./scaffold-eth";
import { useTheme } from "next-themes";

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
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDarkMode = resolvedTheme === "dark";

  return (
    <div className="bg-base-200 w-full max-w-[432px] mx-auto justify-between flex  gap-x-1 px-2  border-b border-gray py-4">
      <Link href="/">
        <img src={isDarkMode ? DarkLogo.src : WhiteLogo.src} alt="lyxaxis" className="mt-1 cursor-pointer w-28" />
      </Link>

      <div className=" flex">
        <UPRainbowKitCustomConnectButton />
      </div>
    </div>
  );
};

export const MultiSigNav = ({ multisigAddress }: { multisigAddress: string }) => {
  return (
    <div className=" w-full flex gap-x-3  border-b border-gray py-4  px-2">
      <NavButton link={`/${multisigAddress}`} title="Wallet" />
      <NavButton link={`/transfer/${multisigAddress}`} title="Transfer" />
      <NavButton link={`/owners/${multisigAddress}`} title="Signers" />
      <NavButton link={`/history/${multisigAddress}`} title="History" />
    </div>
  );
};
