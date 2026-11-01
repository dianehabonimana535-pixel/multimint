"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ExternalLink, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { NETWORKS, resolveNetworkForAddress, type NetworkId } from "@/lib/network";

interface MarketData {
  priceUsd: number;
  volume24h: number;
  liquidityUsd: number;
  /** EVM (Dexscreener) */
  priceChange24h?: number;
  /** Solana (Raydium) */
  priceMin24h?: number;
  priceMax24h?: number;
  dexscreenerUrl: string | null;
}

interface CommonData {
  tokenAddress: string;
  name: string;
  symbol: string;
  logoUri: string | null;
  description: string | null;
  supply: string;
  decimals: number;
  network: NetworkId;
  market: MarketData | null;
  explorerUrl: string;
}

interface SolanaTokenData extends CommonData {
  family: "solana";
  authorities: {
    mintRevoked: boolean;
    freezeRevoked: boolean;
    updateRevoked: boolean | null;
  };
  holderCount: number | null;
}

interface EvmTokenData extends CommonData {
  family: "evm";
  mintable: boolean;
  ownershipRenounced: boolean;
}

type TokenDashboardData = SolanaTokenData | EvmTokenData;

function formatUsd(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(4)}`;
}

function formatSupply(supply: string, decimals: number): string {
  const value = Number(BigInt(supply)) / 10 ** decimals;
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  return value.toLocaleString();
}

function AuthorityRow({ label, revoked }: { label: string; revoked: boolean | null }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
      <span className="text-sm">{label}</span>
      {revoked === null ? (
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <HelpCircle className="h-3.5 w-3.5" /> N/A
        </span>
      ) : revoked ? (
        <span className="flex items-center gap-1 text-xs text-green-400">
          <CheckCircle2 className="h-3.5 w-3.5" /> Revoked
        </span>
      ) : (
        <span className="flex items-center gap-1 text-xs text-amber-400">
          <XCircle className="h-3.5 w-3.5" /> Active
        </span>
      )}
    </div>
  );
}

function noMarketMessage(network: NetworkId): string {
  const config = NETWORKS[network];
  if (config.family === "solana")
    return config.hasLiveMarket
      ? "No active Raydium pool found for this token yet."
      : "Live market data is only available for Solana mainnet tokens.";
  if (config.hasLiveMarket) return "No active PancakeSwap pair found for this token yet.";
  return "Live market data is only available for Solana and BNB Smart Chain mainnet tokens.";
}

export default function TokenDashboardPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const address = params.address as string;
  // Which network to query is explicit in the URL (?network=testnet), so a
  // link from History always resolves the token on the chain it was actually
  // created on, regardless of what the app-wide switcher is currently set to.
  // Plain /token/[address] links (no ?network=) are resolved by address
  // format: 0x... is treated as BNB mainnet, anything else as Solana.
  const network: NetworkId = resolveNetworkForAddress(address ?? "", searchParams.get("network"));

  const [data, setData] = useState<TokenDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(null);
    fetch(`/api/token/${address}?network=${network}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || `Error ${res.status}`);
        }
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [address, network]);

  if (loading) {
    return <p className="container py-10 text-center text-gray-400">Loading token dashboard…</p>;
  }

  if (error || !data) {
    return <p className="container py-10 text-center text-red-400">Error: {error}</p>;
  }

  const config = NETWORKS[data.network];

  return (
    <main className="container max-w-2xl py-10">
      <div className="mb-6 flex items-center gap-4">
        {data.logoUri && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.logoUri} alt={data.symbol} className="h-16 w-16 rounded-full" />
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold">{data.name}</h1>
            <span
              className={
                config.isTestnet
                  ? "rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-400"
                  : "rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent"
              }
            >
              {config.shortLabel}
            </span>
          </div>
          <p className="text-muted-foreground">${data.symbol}</p>
        </div>
      </div>

      {data.description && (
        <p className="mb-6 text-sm text-muted-foreground">{data.description}</p>
      )}

      <p className="mb-6 break-all rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-gray-400">
        {data.tokenAddress}
      </p>

      {data.market ? (
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-gray-500">Price</p>
            <p className="text-lg font-semibold">{formatUsd(data.market.priceUsd)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-gray-500">24h Volume</p>
            <p className="text-lg font-semibold">{formatUsd(data.market.volume24h)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-gray-500">Liquidity</p>
            <p className="text-lg font-semibold">{formatUsd(data.market.liquidityUsd)}</p>
          </div>
          {data.market.priceChange24h !== undefined ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-gray-500">24h Change</p>
              <p className="text-lg font-semibold">{data.market.priceChange24h.toFixed(2)}%</p>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-gray-500">24h Range</p>
              <p className="text-lg font-semibold">
                {formatUsd(data.market.priceMin24h ?? 0)} – {formatUsd(data.market.priceMax24h ?? 0)}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-gray-400">
          {noMarketMessage(data.network)}
        </p>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-gray-500">Total Supply</p>
          <p className="text-lg font-semibold">{formatSupply(data.supply, data.decimals)}</p>
        </div>
        {data.family === "solana" ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-gray-500">Holders</p>
            <p className="text-lg font-semibold">
              {data.holderCount === null ? "Unavailable" : data.holderCount.toLocaleString()}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-gray-500">Mintable</p>
            <p className="text-lg font-semibold">{data.mintable ? "Yes" : "No — fixed supply"}</p>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="mb-3 font-semibold">
          {data.family === "solana" ? "Token Authorities" : "Token Ownership"}
        </h2>
        <div className="space-y-2">
          {data.family === "solana" ? (
            <>
              <AuthorityRow label="Mint Authority" revoked={data.authorities.mintRevoked} />
              <AuthorityRow label="Freeze Authority" revoked={data.authorities.freezeRevoked} />
              <AuthorityRow label="Update Authority" revoked={data.authorities.updateRevoked} />
            </>
          ) : (
            <AuthorityRow label="Ownership Renounced" revoked={data.ownershipRenounced} />
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <a
          href={data.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
        >
          {config.explorerName} <ExternalLink className="h-3.5 w-3.5" />
        </a>
        {data.market?.dexscreenerUrl && (
          <a
            href={data.market.dexscreenerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg bg-purple-600/20 px-4 py-2 text-sm text-purple-300 hover:bg-purple-600/30"
          >
            DexScreener <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </main>
  );
}
