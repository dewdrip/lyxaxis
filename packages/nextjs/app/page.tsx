"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { MultisigCard } from "~~/components/cards/MultisigCard";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="flex flex-col justify-center items-center gap-y-8  ">
        <div className="flex flex-col min-w-[398px] border border-gray p-4 text-center items-center  rounded-xl">
          {/* <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" /> */}
          <h5 className="text-lg">Get started</h5>
          <p className="text-base ">Create a multisig to get started</p>
          <Link
            href={"/createmultisig"}
            children={<button className="btn btn-primary btn-sm ">Create Multisig</button>}
          />
        </div>

        <div className="flex flex-col gap-y-3">
          <div className="flex items-center justify-between">
            <h6 className="text-2xl text-left">My Multisigs</h6>
            <Link
              href={"/createmultisig"}
              children={<button className="btn btn-primary btn-sm">Create Multisig </button>}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <MultisigCard multisigAddress={connectedAddress ? connectedAddress : ""} />
            <MultisigCard multisigAddress={connectedAddress ? connectedAddress : ""} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
