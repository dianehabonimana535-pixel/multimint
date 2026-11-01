import { bsc, bscTestnet } from "viem/chains";
import { defineChain, type Chain } from "viem";
import { SITE_URL } from "./brand";

// Network ids. "mainnet" / "testnet" are the BNB Smart Chain ids and keep their
// original names on purpose: they are already stored in users' history
// (localStorage) and in shared links (?network=testnet).
export type NetworkId = "solana" | "solana-devnet" | "mainnet" | "testnet" | "robinhood" | "robinhood-testnet";

export type ChainFamily = "solana" | "evm";

export const NETWORK_IDS: NetworkId[] = [
  "solana",
  "solana-devnet",
  "mainnet",
  "testnet",
  "robinhood",
  "robinhood-testnet",
];

export const DEFAULT_NETWORK: NetworkId = "solana";

/** Network assumed for a legacy EVM token link/entry that carries no network. */
export const LEGACY_EVM_NETWORK: NetworkId = "mainnet";

export function isNetworkId(value: unknown): value is NetworkId {
  return typeof value === "string" && (NETWORK_IDS as string[]).includes(value);
}

/** Safe parser for query strings / stored values. Falls back to the default. */
export function parseNetworkId(value: string | null | undefined): NetworkId {
  return isNetworkId(value) ? value : DEFAULT_NETWORK;
}

export interface NetworkConfig {
  id: NetworkId;
  family: ChainFamily;
  /** viem chain definition. Only present for EVM networks. */
  chain?: Chain;
  label: string;
  shortLabel: string;
  rpcUrl: string;
  explorerBase: string;
  isTestnet: boolean;
  faucetUrl?: string;
  /** Gas token symbol: SOL, BNB, ETH... */
  nativeSymbol: string;
  /** Name of the explorer, for button labels. */
  explorerName: string;
  /** Rough gas price (gwei) shown before the wallet quotes a live one. EVM only. */
  fallbackGasPriceGwei: number;
  /** Whether a real DEX market exists (trending, price data, pool links). */
  hasLiveMarket: boolean;
  /** Query string appended to explorer links (e.g. Solscan "?cluster=devnet"). */
  explorerSuffix?: string;
  /** Dexscreener chain slug, when hasLiveMarket is true. */
  dexscreenerChain?: string;
  /** Name of the DEX used for the "Create Liquidity Pool" shortcut. */
  dexName?: string;
}

// Robinhood Chain: an Arbitrum Orbit L2, EVM-compatible, ETH as gas token.
// Mainnet chain id 4663, testnet chain id 46630.
export const robinhoodChain = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.mainnet.chain.robinhood.com"] } },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://robinhoodchain.blockscout.com" },
  },
});

export const robinhoodChainTestnet = defineChain({
  id: 46630,
  name: "Robinhood Chain Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.chain.robinhood.com/rpc"] } },
  blockExplorers: {
    default: { name: "Explorer", url: "https://explorer.testnet.chain.robinhood.com" },
  },
  testnet: true,
});

function envOr(value: string | undefined, fallback: string): string {
  return value && value.length > 0 ? value : fallback;
}

const SOLANA_RPC = envOr(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
  "https://api.mainnet-beta.solana.com"
);
const SOLANA_DEVNET_RPC = envOr(
  process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL,
  "https://api.devnet.solana.com"
);
const BSC_RPC = envOr(process.env.NEXT_PUBLIC_BSC_RPC_URL, "https://bsc-dataseed.binance.org");
const BSC_TESTNET_RPC = envOr(
  process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL,
  "https://data-seed-prebsc-1-s1.binance.org:8545"
);
const ROBINHOOD_RPC = envOr(
  process.env.NEXT_PUBLIC_ROBINHOOD_RPC_URL,
  "https://rpc.mainnet.chain.robinhood.com"
);
const ROBINHOOD_TESTNET_RPC = envOr(
  process.env.NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC_URL,
  "https://rpc.testnet.chain.robinhood.com/rpc"
);

export const NETWORKS: Record<NetworkId, NetworkConfig> = {
  solana: {
    id: "solana",
    family: "solana",
    label: "Solana",
    shortLabel: "Solana",
    rpcUrl: SOLANA_RPC,
    explorerBase: "https://solscan.io",
    isTestnet: false,
    nativeSymbol: "SOL",
    explorerName: "Solscan",
    fallbackGasPriceGwei: 0,
    hasLiveMarket: true,
    dexscreenerChain: "solana",
    dexName: "Raydium",
  },
  "solana-devnet": {
    id: "solana-devnet",
    family: "solana",
    label: "Solana Devnet",
    shortLabel: "Sol Dev",
    rpcUrl: SOLANA_DEVNET_RPC,
    explorerBase: "https://solscan.io",
    explorerSuffix: "?cluster=devnet",
    isTestnet: true,
    faucetUrl: "https://faucet.solana.com",
    nativeSymbol: "SOL",
    explorerName: "Solscan (devnet)",
    fallbackGasPriceGwei: 0,
    hasLiveMarket: false,
  },
  mainnet: {
    id: "mainnet",
    family: "evm",
    chain: bsc,
    label: "BNB Smart Chain",
    shortLabel: "BNB",
    rpcUrl: BSC_RPC,
    explorerBase: "https://bscscan.com",
    isTestnet: false,
    nativeSymbol: "BNB",
    explorerName: "BscScan",
    fallbackGasPriceGwei: 3,
    hasLiveMarket: true,
    dexscreenerChain: "bsc",
    dexName: "PancakeSwap",
  },
  testnet: {
    id: "testnet",
    family: "evm",
    chain: bscTestnet,
    label: "BNB Smart Chain Testnet",
    shortLabel: "BNB Test",
    rpcUrl: BSC_TESTNET_RPC,
    explorerBase: "https://testnet.bscscan.com",
    isTestnet: true,
    faucetUrl: "https://www.bnbchain.org/en/testnet-faucet",
    nativeSymbol: "tBNB",
    explorerName: "Testnet Explorer",
    fallbackGasPriceGwei: 3,
    hasLiveMarket: false,
  },
  robinhood: {
    id: "robinhood",
    family: "evm",
    chain: robinhoodChain,
    label: "Robinhood Chain",
    shortLabel: "Robinhood",
    rpcUrl: ROBINHOOD_RPC,
    explorerBase: "https://robinhoodchain.blockscout.com",
    isTestnet: false,
    nativeSymbol: "ETH",
    explorerName: "Blockscout",
    fallbackGasPriceGwei: 0.1,
    hasLiveMarket: false,
  },
  "robinhood-testnet": {
    id: "robinhood-testnet",
    family: "evm",
    chain: robinhoodChainTestnet,
    label: "Robinhood Chain Testnet",
    shortLabel: "RH Test",
    rpcUrl: ROBINHOOD_TESTNET_RPC,
    explorerBase: "https://explorer.testnet.chain.robinhood.com",
    isTestnet: true,
    faucetUrl: "https://faucet.testnet.chain.robinhood.com",
    nativeSymbol: "ETH",
    explorerName: "Testnet Explorer",
    fallbackGasPriceGwei: 0.1,
    hasLiveMarket: false,
  },
};

export function getNetwork(id: NetworkId): NetworkConfig {
  return NETWORKS[id];
}

export function isEvmNetwork(id: NetworkId): boolean {
  return NETWORKS[id].family === "evm";
}

export function isSolanaNetwork(id: NetworkId): boolean {
  return NETWORKS[id].family === "solana";
}

export const EVM_NETWORK_IDS: NetworkId[] = NETWORK_IDS.filter(isEvmNetwork);

/** All EVM chains, typed as a non-empty tuple for wagmi/viem. */
export function evmChains(): [Chain, ...Chain[]] {
  const chains = EVM_NETWORK_IDS.map((id) => NETWORKS[id].chain as Chain);
  return chains as [Chain, ...Chain[]];
}

/** Returns the viem chain for an EVM network. Throws for Solana. */
export function getEvmChain(id: NetworkId): Chain {
  const chain = NETWORKS[id].chain;
  if (!chain) throw new Error(`${NETWORKS[id].label} is not an EVM network`);
  return chain;
}

/** Maps a wagmi/viem chain id back to our NetworkId. Returns undefined when unknown. */
export function networkIdFromChainIdOrUndefined(chainId: number | undefined): NetworkId | undefined {
  return EVM_NETWORK_IDS.find((id) => NETWORKS[id].chain?.id === chainId);
}

/** Same, but falls back to BSC mainnet for any chain id we don't recognize. */
export function networkIdFromChainId(chainId: number | undefined): NetworkId {
  return networkIdFromChainIdOrUndefined(chainId) ?? LEGACY_EVM_NETWORK;
}

const EVM_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

export function looksLikeEvmAddress(address: string): boolean {
  return EVM_ADDRESS_RE.test(address);
}

/**
 * Picks the network to use for a token address. An explicit, valid
 * ?network= wins; otherwise the address format decides (0x... = EVM on BNB
 * mainnet for backward compatibility, anything else = Solana).
 */
export function resolveNetworkForAddress(
  address: string,
  networkParam?: string | null
): NetworkId {
  if (isNetworkId(networkParam)) return networkParam;
  // Without an explicit network, a base58 address is assumed to be Solana mainnet.
  // Devnet tokens must carry ?network=solana-devnet (History links always do).
  return looksLikeEvmAddress(address) ? LEGACY_EVM_NETWORK : "solana";
}

// Back-compat exports: these resolve to the default network and are safe to
// use anywhere the actual selected network isn't known yet (e.g. static
// metadata). Prefer the NetworkId-aware helpers wherever the network is known.
export const NETWORK_LABEL = NETWORKS[DEFAULT_NETWORK].label;
export const RPC_ENDPOINT = NETWORKS.solana.rpcUrl;

export function explorerAddressUrl(address: string, network: NetworkId = DEFAULT_NETWORK): string {
  const config = NETWORKS[network];
  const segment = config.family === "solana" ? "account" : "address";
  return `${config.explorerBase}/${segment}/${address}${config.explorerSuffix ?? ""}`;
}

export function explorerTxUrl(txId: string, network: NetworkId = DEFAULT_NETWORK): string {
  const config = NETWORKS[network];
  return `${config.explorerBase}/tx/${txId}${config.explorerSuffix ?? ""}`;
}

export function explorerTokenUrl(address: string, network: NetworkId = DEFAULT_NETWORK): string {
  const config = NETWORKS[network];
  return `${config.explorerBase}/token/${address}${config.explorerSuffix ?? ""}`;
}

// Wrapped SOL, used to pair a new token in a Raydium pool.
const NATIVE_SOL_MINT = "So11111111111111111111111111111111111111112";

export function raydiumCreatePoolUrl(mintAddress: string): string {
  return `https://raydium.io/liquidity/create-pool/?base=${mintAddress}&quote=${NATIVE_SOL_MINT}`;
}

export function pancakeSwapAddLiquidityUrl(tokenAddress: string): string {
  return `https://pancakeswap.finance/add/BNB/${tokenAddress}`;
}

/** "Create liquidity pool" deep link for a token, or null if the network has no supported DEX. */
export function liquidityUrl(network: NetworkId, tokenAddress: string): string | null {
  if (network === "solana") return raydiumCreatePoolUrl(tokenAddress);
  if (network === "mainnet") return pancakeSwapAddLiquidityUrl(tokenAddress);
  return null;
}

/** Generic DEX liquidity landing page, used before any token exists. */
export function liquidityLandingUrl(network: NetworkId): string | null {
  if (network === "solana") return "https://raydium.io/liquidity/";
  if (network === "mainnet") return "https://pancakeswap.finance/liquidity";
  return null;
}

export function dexscreenerTokenUrl(network: NetworkId, address: string): string | null {
  const slug = NETWORKS[network].dexscreenerChain;
  return slug ? `https://dexscreener.com/${slug}/${address}` : null;
}

export interface TrustInfo {
  /** Solana: how many of the 3 authorities (mint/freeze/update) were revoked. */
  revokedCount?: number;
  /** EVM: whether ownership was renounced at deployment. */
  ownershipRenounced?: boolean;
}

/**
 * Builds a pre-filled "Share on X" intent URL for a created token. Used both
 * right after creation and from the History page for past tokens.
 */
export function buildShareOnXUrl(
  name: string,
  symbol: string,
  address: string,
  network: NetworkId,
  trust: TrustInfo = {}
): string {
  const config = NETWORKS[network];

  let trustLine = "";
  if (config.family === "solana") {
    if (trust.revokedCount === 3) trustLine = "All authorities revoked, zero rug pull risk.";
    else if (typeof trust.revokedCount === "number" && trust.revokedCount > 0)
      trustLine = `${trust.revokedCount}/3 authorities revoked.`;
  } else if (trust.ownershipRenounced) {
    trustLine = "Ownership renounced, zero rug pull risk.";
  }

  const networkTag = config.isTestnet ? " (testnet)" : "";

  const text = `\u{1F680} ${name} ($${symbol}) just launched on ${config.label}${networkTag}! ${trustLine}\n\nCA: ${address}\n${explorerTokenUrl(
    address,
    network
  )}\n${SITE_URL}`;

  return `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
}
