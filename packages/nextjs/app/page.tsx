"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount, usePublicClient } from "wagmi";
import { MultisigCard } from "~~/components/cards/MultisigCard";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  const {
    data: registryAddress,
    isLoading: registryAddressLoading,
    error: registryAddressError,
  } = useScaffoldReadContract({
    contractName: "Lyxaxis",
    functionName: "getRegistry",
  });

  const {
    data: multisigs,
    isLoading: multisigsLoading,
    error: multisigsError,
  } = useScaffoldReadContract({
    contractName: "MultiSigRegistry",
    functionName: "getSignerMultisigs",
    contractAddress: registryAddress,
    args: [connectedAddress],
  });

  return (
    <div className="flex items-center flex-col flex-grow pt-10 w-full">
      <div className="flex flex-col justify-center items-center gap-y-8 w-full">
        {multisigsLoading || registryAddressLoading ? (
          <div className="flex items-center justify-center py-32">
            <span className="loading w-6" />
          </div>
        ) : multisigs && multisigs.length === 0 ? (
          <div className="flex flex-col min-w-[398px] border border-gray p-4 text-center items-center  rounded-xl">
            {/* <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" /> */}
            <h5 className="text-lg">Get started</h5>
            <p className="text-base ">Create a multisig to get started</p>
            <Link
              href={"/createmultisig"}
              children={<button className="btn btn-primary btn-sm ">Create Multisig</button>}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-y-3 w-full max-w-[398px]">
            {multisigs && (
              <div className="flex items-center w-full justify-between gap-x-4">
                <h6 className="text-2xl text-left">My Multisigs</h6>
                <Link
                  href={"/createmultisig"}
                  children={<button className="btn btn-primary btn-sm">Create Multisig</button>}
                />
              </div>
            )}
            <div className="flex flex-col gap-y-2 w-full h-[32rem] overflow-y-scroll">
              {multisigs &&
                multisigs?.map((multisigAddress: string) => (
                  <>
                    <MultisigCard key={multisigAddress} multisigAddress={multisigAddress} />
                  </>
                ))}
              {/* {(!multisigs || multisigs.length === 0) && (
                <p className="text-center text-gray-500">No multisigs found</p>
              )} */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
