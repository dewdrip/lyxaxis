import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { UPClientProvider, createClientUPProvider } from "@lukso/up-provider";
import { PublicClient, WalletClient, createPublicClient, createWalletClient, custom, http } from "viem";
import { lukso } from "viem/chains";

interface UPProviderContextType {
  provider: UPClientProvider | null;
  publicClient: PublicClient | null;
  walletClient: WalletClient | null;
  chainId: number;
  accounts: Array<`0x${string}`>;
  contextAccounts: Array<`0x${string}`>;
  isConnected: boolean;
  selectedAddress: `0x${string}` | null;
  setSelectedAddress: (address: `0x${string}` | null) => void;
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
}

const initialUPProviderContextValue: UPProviderContextType = {
  provider: null,
  publicClient: null,
  walletClient: null,
  chainId: 0,
  accounts: [],
  contextAccounts: [],
  isConnected: false,
  selectedAddress: null,
  setSelectedAddress: () => {},
  isSearching: false,
  setIsSearching: () => {},
};

const UPProviderContext = createContext<UPProviderContextType>(initialUPProviderContextValue);

export function useUPProvider() {
  return useContext(UPProviderContext);
}

export function UPProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [provider, setProvider] = useState<UPClientProvider | null>(null);
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [chainId, setChainId] = useState<number>(0);
  const [accounts, setAccounts] = useState<Array<`0x${string}`>>([]);
  const [contextAccounts, setContextAccounts] = useState<Array<`0x${string}`>>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<`0x${string}` | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize provider and client
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initProvider = async () => {
      try {
        const upProvider = createClientUPProvider();

        // Simple check if provider is available
        if (!upProvider) {
          console.error("UP Provider not available");
          return;
        }

        setProvider(upProvider);

        const publicClient = createPublicClient({
          chain: lukso,
          transport: http(),
        });

        setPublicClient(publicClient);

        const walletClient = createWalletClient({
          chain: lukso,
          transport: custom(upProvider),
        });

        setWalletClient(walletClient);
      } catch (err) {
        console.error("Provider initialization:", err);
      }
    };

    initProvider();
  }, []);

  useEffect(() => {
    if (!provider || !walletClient) return;

    const handleAccountsChange = (_accounts: `0x${string}`[]) => {
      setAccounts(_accounts);
      setIsConnected(_accounts.length > 0);
    };

    const handleContextAccountsChange = (_contextAccounts: `0x${string}`[]) => {
      setContextAccounts(_contextAccounts);
    };

    provider.on("accountsChanged", handleAccountsChange);
    provider.on("contextAccountsChanged", handleContextAccountsChange);
    provider.on("chainChanged", (id: number) => setChainId(id));

    return () => {
      provider.removeListener("accountsChanged", handleAccountsChange);
      provider.removeListener("contextAccountsChanged", handleContextAccountsChange);
      provider.removeListener("chainChanged", (id: number) => setChainId(id));
    };
  }, [provider, walletClient]);

  const contextProperties = useMemo(
    () => ({
      provider,
      publicClient,
      walletClient,
      chainId,
      accounts,
      contextAccounts,
      isConnected,
      selectedAddress,
      setSelectedAddress,
      isSearching,
      setIsSearching,
    }),
    [
      provider,
      publicClient,
      walletClient,
      chainId,
      accounts,
      contextAccounts,
      isConnected,
      selectedAddress,
      setSelectedAddress,
      isSearching,
      setIsSearching,
    ],
  );

  return <UPProviderContext.Provider value={contextProperties}>{children}</UPProviderContext.Provider>;
}
