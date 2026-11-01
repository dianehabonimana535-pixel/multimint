"use client";

import dynamic from "next/dynamic";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAppNetwork } from "@/components/NetworkProvider";

// The Solana button reads browser wallet state, so it must not render on the server.
const SolanaConnectButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

/**
 * RainbowKit's own chain menu only lists EVM chains, so it is hidden
 * (chainStatus="none"): the network switcher in the navbar covers every network
 * (Solana, Solana Devnet, BNB, Robinhood...) and moves a connected EVM wallet
 * to the matching chain.
 * Shows the right wallet button for the selected network: Solana wallets or EVM wallets. */
export default function ConnectWalletButton() {
  const { config } = useAppNetwork();

  if (config.family === "solana") {
    return <SolanaConnectButton className="!h-8 !rounded-md !bg-primary !text-xs !font-medium" />;
  }

  return <ConnectButton chainStatus="none" accountStatus="address" showBalance={false} />;
}
