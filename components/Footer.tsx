"use client";

import Link from "next/link";
import { Coins } from "lucide-react";
import { useAppNetwork } from "@/components/NetworkProvider";
import { NETWORKS } from "@/lib/network";
import { BRAND_FULL } from "@/lib/brand";

export default function Footer() {
  const { network } = useAppNetwork();
  const config = NETWORKS[network];

  return (
    <footer className="border-t border-border/60">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 sm:flex-row">
        <div className="flex items-center gap-2 font-display text-sm font-semibold">
          <Coins className="h-4 w-4 text-accent" />
          {BRAND_FULL}
        </div>
        <p className="text-center text-xs text-muted-foreground sm:text-left">
          Non-custodial. Free to use — no platform fee. Built for {config.label}. Not
          financial advice — creating a token carries risk; do your own research.
        </p>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <Link href="/create" className="hover:text-foreground">Create</Link>
          <Link href="/history" className="hover:text-foreground">History</Link>
          <a href={config.explorerBase} target="_blank" rel="noreferrer" className="hover:text-foreground">
            Explorer
          </a>
        </div>
      </div>
    </footer>
  );
}
