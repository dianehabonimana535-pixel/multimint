import type { NetworkId } from "./network";

export interface TrendingCoin {
  tokenAddress: string;
  /** Pool (Solana/Raydium) or pair (EVM/Dexscreener) address. */
  poolAddress: string;
  name: string;
  symbol: string;
  logoUri: string | null;
  priceUsd: number;
  volume24h: number;
  liquidityUsd: number;
  ageHours: number;
  /** Solana (Raydium) exposes a 24h price range... */
  priceMin?: number;
  priceMax?: number;
  /** ...EVM (Dexscreener) exposes a 24h percentage change. */
  priceChange24h?: number;
  dexscreenerUrl: string;
  explorerUrl: string;
}

export interface TrendingResponse {
  coins: TrendingCoin[];
  /** Short note shown under the list header (data source / limitations). */
  source: string;
}

/**
 * Fetches trending memecoins for the selected network, ranked by real 24h
 * trading volume. The heavy lifting happens server-side
 * (app/api/trending/route.ts) so the phone only downloads the final,
 * ready-to-display list.
 */
export async function fetchTrendingCoins(network: NetworkId): Promise<TrendingResponse> {
  const res = await fetch(`/api/trending?network=${network}`);
  if (!res.ok) {
    throw new Error(`Failed to load trending coins (${res.status})`);
  }
  return res.json();
}
