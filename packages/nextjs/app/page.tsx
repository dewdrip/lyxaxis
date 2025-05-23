"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WelcomeUI from "./_components/WelcomeUI";
import type { NextPage } from "next";
import { useIsMounted } from "usehooks-ts";
import { useAccount } from "wagmi";
import { MultisigCard } from "~~/components/cards/MultisigCard";
import { useUPProvider } from "~~/contexts/UPProviderContext";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { getController } from "~~/utils/helpers";

const Home: NextPage = () => {
  const isMounted = useIsMounted();
  const { address: connectedAddress } = useAccount();

  const [controller, setController] = useState<string | undefined>(undefined);

  const { contextAccounts } = useUPProvider();

  const { data: registryAddress, isLoading: registryAddressLoading } = useScaffoldReadContract({
    contractName: "Lyxaxis",
    functionName: "getRegistry",
  });

  const { data: multisigs, isLoading: multisigsLoading } = useScaffoldReadContract({
    contractName: "MultiSigRegistry",
    functionName: "getSignerMultisigs",
    contractAddress: registryAddress,
    args: [controller],
  });

  useEffect(() => {
    (async () => {
      if (connectedAddress || contextAccounts.length > 0) {
        setController(await getController((connectedAddress || contextAccounts[0]) as `0x${string}`));
      }
    })();
  }, [connectedAddress, contextAccounts]);

  return isMounted() ? (
    <div className="flex items-center flex-col flex-grow pt-10 w-full h-screen overflow-y-auto">
      <div className="flex flex-col justify-center items-center gap-y-8 w-full">
        {multisigsLoading || registryAddressLoading ? (
          <div className="flex items-center justify-center py-32">
            <span className="loading w-6" />
          </div>
        ) : (multisigs && multisigs.length === 0) || !connectedAddress ? (
          <div className="max-w-[398px]">
            <WelcomeUI />
          </div>
        ) : (
          <div className="flex flex-col gap-y-3 w-full max-w-[398px]">
            {multisigs && (
              <div className="flex items-center w-full justify-between gap-x-4">
                <h6 className="text-2xl text-left">My Multisigs</h6>
                <Link href={"/createmultisig"}>
                  <button className="btn btn-primary btn-sm">Create Multisig</button>
                </Link>
              </div>
            )}
            <div className="flex flex-col gap-y-2 w-full h-[32rem] overflow-y-scroll">
              {multisigs &&
                multisigs?.map((multisigAddress: string) => (
                  <>
                    <MultisigCard key={multisigAddress} multisigAddress={multisigAddress} />
                  </>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;
};

export default Home;
