import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { BRAND_FULL } from "./brand";
import { EVM_NETWORK_IDS, NETWORKS, evmChains } from "./network";

// WalletConnect requires a free projectId from https://cloud.walletconnect.com
// so that mobile wallets (Trust Wallet, Binance Wallet, etc.) can connect via
// QR code. Injected wallets (MetaMask browser extension) work without it.
const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

// Only the EVM networks are registered here: Solana has its own wallet stack
// (see components/Web3Provider.tsx). The in-app network switcher
// (components/NetworkProvider.tsx) moves a connected EVM wallet between these
// chains with wagmi's useSwitchChain.
const transports = Object.fromEntries(
  EVM_NETWORK_IDS.map((id) => [NETWORKS[id].chain!.id, http(NETWORKS[id].rpcUrl)])
);

export const wagmiConfig = getDefaultConfig({
  appName: BRAND_FULL,
  projectId: WALLETCONNECT_PROJECT_ID || "00000000000000000000000000000000",
  chains: evmChains(),
  transports,
  ssr: true,
});
