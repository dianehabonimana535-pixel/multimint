"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchTrendingCoins, TrendingCoin } from "@/lib/trending";
import { useAppNetwork } from "@/components/NetworkProvider";
import { RefreshCw, ExternalLink } from "lucide-react";

function formatUsd(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(4)}`;
}

function formatAge(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${hours.toFixed(1)}h`;
}

export default function TrendingCoins() {
  const { network, config } = useAppNetwork();
  const [coins, setCoins] = useState<TrendingCoin[]>([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(
    (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      setExpandedId(null);
      fetchTrendingCoins(network)
        .then((res) => {
          setCoins(res.coins);
          setSource(res.source);
        })
        .catch((err) => setError(err.message))
        .finally(() => {
          setLoading(false);
          setRefreshing(false);
        });
    },
    [network]
  );

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <p className="text-center text-gray-400 py-8">Loading trending memecoins…</p>;
  }

  if (error) {
    return <p className="text-center text-red-400 py-8">Error: {error}</p>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {coins.length} memecoins · {source}
        </p>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {coins.length === 0 && (
        <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-gray-400">
          Nothing to show for {config.label} right now.
        </p>
      )}

      <div className="space-y-3">
        {coins.map((coin) => (
          <div
            key={coin.tokenAddress}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {coin.logoUri && (
                  <img
                    src={coin.logoUri}
                    alt={coin.symbol}
                    className="h-10 w-10 rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold">{coin.name}</p>
                  <p className="text-sm text-gray-400">
                    ${coin.symbol} · {formatAge(coin.ageHours)} old
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatUsd(coin.priceUsd)}</p>
                <p className="text-xs text-gray-500">Vol {formatUsd(coin.volume24h)}</p>
              </div>
            </div>

            <button
              onClick={() =>
                setExpandedId(expandedId === coin.tokenAddress ? null : coin.tokenAddress)
              }
              className="mt-3 text-sm text-purple-400 hover:text-purple-300"
            >
              {expandedId === coin.tokenAddress ? "Hide details ▲" : "View details ▼"}
            </button>

            {expandedId === coin.tokenAddress && (
              <div className="mt-3 space-y-2 border-t border-white/10 pt-3 text-sm">
                <div className="grid grid-cols-2 gap-2 text-gray-400">
                  <p>Liquidity: <span className="text-foreground">{formatUsd(coin.liquidityUsd)}</span></p>
                  <p>Age: <span className="text-foreground">{formatAge(coin.ageHours)}</span></p>
                  {coin.priceChange24h !== undefined && (
                    <p>24h change: <span className="text-foreground">{coin.priceChange24h.toFixed(2)}%</span></p>
                  )}
                  {coin.priceMin !== undefined && (
                    <p>24h low: <span className="text-foreground">{formatUsd(coin.priceMin)}</span></p>
                  )}
                  {coin.priceMax !== undefined && (
                    <p>24h high: <span className="text-foreground">{formatUsd(coin.priceMax)}</span></p>
                  )}
                </div>
                <p className="break-all text-xs text-gray-500">{coin.tokenAddress}</p>
                <div className="flex gap-2 pt-1">
                  <a
                    href={coin.dexscreenerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg bg-purple-600/20 px-3 py-1.5 text-xs text-purple-300 hover:bg-purple-600/30"
                  >
                    DexScreener <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href={coin.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/20"
                  >
                    {config.explorerName} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
