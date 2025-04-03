"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount, usePublicClient } from "wagmi";
import { MultisigCard } from "~~/components/cards/MultisigCard";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const publicClient = usePublicClient();
  const { data: lyxaxisContract } = useDeployedContractInfo("Lyxaxis");
  const [registryAddress, setRegistryAddress] = useState<string>();
  const [multisigs, setMultisigs] = useState<string[]>([]);

  useEffect(() => {
    const getRegistryAddress = async () => {
      if (!publicClient || !lyxaxisContract?.address) return;

      try {
        const data = await publicClient.readContract({
          address: lyxaxisContract.address,
          abi: [
            {
              inputs: [],
              name: "getRegistry",
              outputs: [{ internalType: "address", name: "", type: "address" }],
              stateMutability: "view",
              type: "function",
            },
          ],
          functionName: "getRegistry",
        });
        setRegistryAddress(data as string);
      } catch (error) {
        console.error("Error fetching registry address:", error);
      }
    };

    getRegistryAddress();
  }, [publicClient, lyxaxisContract?.address]);

  useEffect(() => {
    const getMultisigs = async () => {
      if (!publicClient || !registryAddress || !connectedAddress) return;

      try {
        const data = await publicClient.readContract({
          address: registryAddress,
          abi: [
            {
              inputs: [{ internalType: "address", name: "_signer", type: "address" }],
              name: "getSignerMultisigs",
              outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
              stateMutability: "view",
              type: "function",
            },
          ],
          functionName: "getSignerMultisigs",
          args: [connectedAddress],
        });
        setMultisigs(data as string[]);
      } catch (error) {
        console.error("Error fetching multisigs:", error);
      }
    };

    getMultisigs();
  }, [publicClient, registryAddress, connectedAddress]);

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

        <div className="flex flex-col gap-y-3 w-full">
          <div className="flex items-center justify-between">
            <h6 className="text-2xl text-left">My Multisigs</h6>
            <Link
              href={"/createmultisig"}
              children={<button className="btn btn-primary btn-sm">Create Multisig </button>}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            {multisigs?.map((multisigAddress: string) => (
              <MultisigCard key={multisigAddress} multisigAddress={multisigAddress} />
            ))}
            {(!multisigs || multisigs.length === 0) && <p className="text-center text-gray-500">No multisigs found</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
