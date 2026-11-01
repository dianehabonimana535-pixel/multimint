"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { toast } from "sonner";
import { STORAGE } from "@/lib/brand";
import {
  DEFAULT_NETWORK,
  getEvmChain,
  getNetwork,
  isEvmNetwork,
  isNetworkId,
  networkIdFromChainIdOrUndefined,
  type NetworkConfig,
  type NetworkId,
} from "@/lib/network";

interface NetworkContextValue {
  /** The network the app is currently showing/acting on. */
  network: NetworkId;
  /** Full config of the selected network. */
  config: NetworkConfig;
  /** Switches the app (and, for EVM networks with a connected wallet, the wallet) to the given network. */
  setNetwork: (id: NetworkId) => void;
  /** True while a wallet chain switch is in flight. */
  isSwitching: boolean;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);

export function NetworkProvider({ children }: { children: ReactNode }) {
  // wagmi's account state only concerns EVM wallets. A connected Solana wallet
  // is handled separately by the Solana wallet adapter and never needs a chain switch.
  const { isConnected: evmConnected } = useAccount();
  const connectedChainId = useChainId();
  const { switchChainAsync, isPending } = useSwitchChain();

  const [network, setNetworkState] = useState<NetworkId>(DEFAULT_NETWORK);
  const [hydrated, setHydrated] = useState(false);

  // Load the persisted preference once, client-side only, so the very first
  // render always matches the server (avoids a hydration mismatch).
  useEffect(() => {
    try {
      const stored =
        window.localStorage.getItem(STORAGE.network) ??
        window.localStorage.getItem(STORAGE.legacyNetwork);
      if (isNetworkId(stored)) {
        setNetworkState(stored);
      }
    } catch {
      // localStorage unavailable (e.g. private browsing) - fall back silently.
    }
    setHydrated(true);
  }, []);

  // If an EVM wallet is on a given chain (because the user switched it
  // directly inside MetaMask/Trust Wallet, or a session just reconnected),
  // let that be the source of truth for which EVM network the app shows.
  // This only applies while an EVM network is selected: when Solana is
  // selected, a connected EVM wallet must not pull the app away from it.
  useEffect(() => {
    if (!hydrated || !evmConnected || !connectedChainId) return;
    const fromWallet = networkIdFromChainIdOrUndefined(connectedChainId);
    if (!fromWallet) return;
    setNetworkState((current) => {
      if (!isEvmNetwork(current)) return current;
      return current === fromWallet ? current : fromWallet;
    });
  }, [connectedChainId, evmConnected, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE.network, network);
    } catch {
      // ignore
    }
  }, [network, hydrated]);

  const setNetwork = useCallback(
    async (id: NetworkId) => {
      if (id === network) return;

      // Only EVM targets need the wallet to follow. Solana has no chain id to
      // switch, and with no EVM wallet connected this just changes what the
      // app displays (explorer links, RPC reads, labels).
      if (isEvmNetwork(id) && evmConnected) {
        try {
          await switchChainAsync({ chainId: getEvmChain(id).id });
          setNetworkState(id);
        } catch {
          // The user rejected the switch in their wallet, or it isn't
          // supported by that wallet - stay on the current network.
          toast.error("Network switch was cancelled in your wallet.");
        }
      } else {
        setNetworkState(id);
      }
    },
    [network, evmConnected, switchChainAsync]
  );

  return (
    <NetworkContext.Provider
      value={{ network, config: getNetwork(network), setNetwork, isSwitching: isPending }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export function useAppNetwork(): NetworkContextValue {
  const ctx = useContext(NetworkContext);
  if (!ctx) {
    throw new Error("useAppNetwork must be used within a NetworkProvider");
  }
  return ctx;
}
