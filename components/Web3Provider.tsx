"use client";

import { useMemo, useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { wagmiConfig } from "@/lib/wagmi";
import { NETWORKS } from "@/lib/network";
import { NetworkProvider, useAppNetwork } from "@/components/NetworkProvider";

import "@rainbow-me/rainbowkit/styles.css";
import "@solana/wallet-adapter-react-ui/styles.css";

// Solana connection that follows the selected network (mainnet or devnet).
// While an EVM network is selected the Solana side just idles on mainnet.
function SolanaProviders({ children }: { children: React.ReactNode }) {
  const { config } = useAppNetwork();
  const endpoint = config.family === "solana" ? config.rpcUrl : NETWORKS.solana.rpcUrl;
  // Wallet Standard wallets (Phantom, Solflare, Backpack...) are detected
  // automatically, so no explicit adapter list is needed.
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

// Both wallet stacks are mounted side by side: wagmi/RainbowKit for the EVM
// networks and the Solana wallet adapter for Solana. Which one is active is
// decided by the network selected in NetworkProvider.
export default function Web3Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({ accentColor: "#F0B90B" })}>
          <NetworkProvider>
            <SolanaProviders>{children}</SolanaProviders>
          </NetworkProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
