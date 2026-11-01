import { NextResponse } from "next/server";
import { NETWORKS, explorerTokenUrl, parseNetworkId } from "@/lib/network";
import type { TrendingCoin, TrendingResponse } from "@/lib/trending";

export const revalidate = 60;

const MIN_VOLUME_USD = 1000;

// ---------------------------------------------------------------------------
// Solana: Raydium publishes a full, paginated list of every pool sorted by
// volume, so a genuine "scan everything, rank by volume" approach is possible.
// ---------------------------------------------------------------------------

interface RaydiumMint {
  address: string;
  symbol: string;
  name: string;
  logoURI: string;
}

interface RaydiumPool {
  id: string;
  mintA: RaydiumMint;
  mintB: RaydiumMint;
  price: number;
  tvl: number;
  openTime: string;
  day: { volume: number; priceMin: number; priceMax: number };
}

interface RaydiumApiResponse {
  success: boolean;
  data: { data: RaydiumPool[] };
}

const EXCLUDED_SYMBOLS = new Set([
  "SOL", "WSOL", "USDC", "USDT", "RAY", "ETH", "BTC", "WBTC", "WETH",
  "MSOL", "JITOSOL", "BSOL", "JUP", "PYUSD",
]);

const MIN_TVL_USD = 500;
const MAX_AGE_HOURS = 48;
const PAGES_TO_SCAN = 20;
const PAGE_SIZE = 100;

function isMemecoinToken(token: RaydiumMint): boolean {
  const symbol = token.symbol.toUpperCase();
  const name = token.name.toLowerCase();
  if (EXCLUDED_SYMBOLS.has(symbol)) return false;
  if (name.includes("xstock")) return false;
  if (name.includes("wrapped")) return false;
  if (symbol.endsWith("USD")) return false;
  return true;
}

async function fetchRaydiumPage(page: number): Promise<RaydiumPool[]> {
  const url = `https://api-v3.raydium.io/pools/info/list?poolType=all&poolSortField=volume24h&sortType=desc&pageSize=${PAGE_SIZE}&page=${page}`;
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) return [];
  const json: RaydiumApiResponse = await res.json();
  if (!json.success || !json.data?.data) return [];
  return json.data.data;
}

async function getSolanaTrending(): Promise<TrendingCoin[]> {
  const nowSeconds = Date.now() / 1000;
  const cutoffSeconds = nowSeconds - MAX_AGE_HOURS * 3600;

  const pageNumbers = Array.from({ length: PAGES_TO_SCAN }, (_, i) => i + 1);
  const pages = await Promise.all(pageNumbers.map(fetchRaydiumPage));
  const pools = pages.flat();

  const seen = new Set<string>();
  const coins: TrendingCoin[] = [];

  for (const pool of pools) {
    if (!pool.mintA || !pool.mintB || !pool.day) continue;

    const openTime = Number(pool.openTime);
    if (!openTime || openTime < cutoffSeconds) continue;
    if (pool.day.volume < MIN_VOLUME_USD) continue;
    if (pool.tvl < MIN_TVL_USD) continue;

    const isMintAEstablished = EXCLUDED_SYMBOLS.has(pool.mintA.symbol.toUpperCase());
    const token = isMintAEstablished ? pool.mintB : pool.mintA;

    if (!isMemecoinToken(token)) continue;
    if (seen.has(token.address)) continue;
    seen.add(token.address);

    coins.push({
      tokenAddress: token.address,
      poolAddress: pool.id,
      name: token.name,
      symbol: token.symbol,
      logoUri: token.logoURI || null,
      priceUsd: pool.price,
      volume24h: pool.day.volume,
      liquidityUsd: pool.tvl,
      ageHours: (nowSeconds - openTime) / 3600,
      priceMin: pool.day.priceMin,
      priceMax: pool.day.priceMax,
      dexscreenerUrl: `https://dexscreener.com/solana/${token.address}`,
      explorerUrl: explorerTokenUrl(token.address, "solana"),
    });
  }

  coins.sort((a, b) => b.volume24h - a.volume24h);
  return coins.slice(0, 50);
}

// ---------------------------------------------------------------------------
// BNB Chain: there is no equivalent open, no-API-key endpoint listing every
// PancakeSwap pair. This instead seeds candidates from Dexscreener's public
// "latest boosted tokens" list (dexscreener.com/token-boosts/latest) filtered
// to BNB Chain, then pulls each one's *real* live pair data (price, volume,
// liquidity, age) from Dexscreener's token endpoint and ranks by that. The
// market numbers are genuine and live; only the discovery/seed list differs
// from a full organic scan. Swap in a provider like Moralis, Bitquery, or
// GeckoTerminal here if you want a fully organic "every new PancakeSwap pair"
// scan.
// ---------------------------------------------------------------------------

interface DexscreenerBoost {
  chainId: string;
  tokenAddress: string;
}

interface DexscreenerPair {
  chainId: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; name: string; symbol: string };
  priceUsd?: string;
  priceChange?: { h24?: number };
  volume?: { h24?: number };
  liquidity?: { usd?: number };
  pairCreatedAt?: number;
  info?: { imageUrl?: string };
}

const MIN_LIQUIDITY_USD = 500;
const BATCH_SIZE = 30;

async function fetchBoostedTokens(chainSlug: string): Promise<string[]> {
  const res = await fetch("https://api.dexscreener.com/token-boosts/latest/v1", {
    next: { revalidate },
  });
  if (!res.ok) return [];
  const boosts: DexscreenerBoost[] = await res.json();
  const addresses = boosts.filter((b) => b.chainId === chainSlug).map((b) => b.tokenAddress);
  return Array.from(new Set(addresses));
}

async function fetchPairsForTokens(addresses: string[]): Promise<DexscreenerPair[]> {
  if (addresses.length === 0) return [];
  const url = `https://api.dexscreener.com/latest/dex/tokens/${addresses.join(",")}`;
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) return [];
  const json = await res.json();
  return (json?.pairs ?? []) as DexscreenerPair[];
}

async function getBscTrending(): Promise<TrendingCoin[]> {
  const chainSlug = NETWORKS.mainnet.dexscreenerChain as string;
  const tokenAddresses = await fetchBoostedTokens(chainSlug);

  const batches: string[][] = [];
  for (let i = 0; i < tokenAddresses.length; i += BATCH_SIZE) {
    batches.push(tokenAddresses.slice(i, i + BATCH_SIZE));
  }
  const pairsBatches = await Promise.all(batches.map(fetchPairsForTokens));
  const allPairs = pairsBatches.flat().filter((p) => p.chainId === chainSlug);

  // Keep only the highest-liquidity pair per base token.
  const bestPairByToken = new Map<string, DexscreenerPair>();
  for (const pair of allPairs) {
    const key = pair.baseToken?.address?.toLowerCase();
    if (!key) continue;
    const existing = bestPairByToken.get(key);
    const liquidity = pair.liquidity?.usd ?? 0;
    if (!existing || liquidity > (existing.liquidity?.usd ?? 0)) {
      bestPairByToken.set(key, pair);
    }
  }

  const now = Date.now();
  return Array.from(bestPairByToken.values())
    .filter((p) => (p.volume?.h24 ?? 0) >= MIN_VOLUME_USD)
    .filter((p) => (p.liquidity?.usd ?? 0) >= MIN_LIQUIDITY_USD)
    .map(
      (p): TrendingCoin => ({
        tokenAddress: p.baseToken.address,
        poolAddress: p.pairAddress,
        name: p.baseToken.name,
        symbol: p.baseToken.symbol,
        logoUri: p.info?.imageUrl ?? null,
        priceUsd: Number(p.priceUsd ?? 0),
        volume24h: p.volume?.h24 ?? 0,
        liquidityUsd: p.liquidity?.usd ?? 0,
        ageHours: p.pairCreatedAt ? (now - p.pairCreatedAt) / 3_600_000 : 0,
        priceChange24h: p.priceChange?.h24 ?? 0,
        dexscreenerUrl: `https://dexscreener.com/${chainSlug}/${p.pairAddress}`,
        explorerUrl: explorerTokenUrl(p.baseToken.address, "mainnet"),
      })
    )
    .sort((a, b) => b.volume24h - a.volume24h)
    .slice(0, 50);
}

export async function GET(req: Request) {
  const network = parseNetworkId(new URL(req.url).searchParams.get("network"));

  try {
    let body: TrendingResponse;

    if (network === "solana") {
      body = {
        coins: await getSolanaTrending(),
        source: "launched under 48h \u00b7 Raydium \u00b7 sorted by 24h volume",
      };
    } else if (network === "mainnet") {
      body = {
        coins: await getBscTrending(),
        source: "trending on PancakeSwap/Dexscreener \u00b7 sorted by 24h volume",
      };
    } else {
      // Testnets and Robinhood Chain have no indexed DEX market yet.
      body = {
        coins: [],
        source: `no market data is indexed for ${NETWORKS[network].label} yet`,
      };
    }

    return NextResponse.json(body);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
