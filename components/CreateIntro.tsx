"use client";

import { useAppNetwork } from "@/components/NetworkProvider";
import { BRAND_FULL } from "@/lib/brand";

export default function CreateIntro() {
  const { config } = useAppNetwork();
  const fees = config.family === "solana" ? "Solana's own network fees" : `${config.label}'s own gas fees`;

  return (
    <p className="mt-2 text-muted-foreground">
      Fill in the details below. You&apos;ll approve a single signature in your wallet, covering
      only {fees} &mdash; {BRAND_FULL} charges no platform fee.
    </p>
  );
}
