"use client";

import { useAppNetwork } from "@/components/NetworkProvider";

export default function TrendingHeader() {
  const { config } = useAppNetwork();

  const title =
    config.id === "solana"
      ? "Trending on Raydium"
      : config.hasLiveMarket
      ? `Trending on ${config.label}`
      : "Trending";

  const subtitle =
    config.id === "solana"
      ? "Real on-chain data, sorted by 24h trading volume. No paid boosting, no bots."
      : "Real on-chain market data via Dexscreener, sorted by 24h trading volume.";

  return (
    <div className="mb-8">
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-muted-foreground">{subtitle}</p>
    </div>
  );
}
