"use client";

import dynamic from "next/dynamic";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAppNetwork } from "@/components/NetworkProvider";

// The Solana button reads browser wallet state, so it must not render on the server.
const SolanaConnectButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

/** Shows the right wallet button for the selected network: Solana wallets or EVM wallets. */
export default function ConnectWalletButton() {
  const { config } = useAppNetwork();

  if (config.family === "solana") {
    return <SolanaConnectButton className="!h-8 !rounded-md !bg-primary !text-xs !font-medium" />;
  }

  return <ConnectButton chainStatus="icon" accountStatus="address" showBalance={false} />;
}
