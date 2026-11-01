"use client";

import { useAppNetwork } from "@/components/NetworkProvider";

export default function Stats() {
  const { config } = useAppNetwork();
  const isSolana = config.family === "solana";

  const stats = [
    { value: "Free", label: "Platform fee" },
    { value: "1", label: isSolana ? "Wallet signature to mint" : "Wallet signature to deploy" },
    {
      value: isSolana ? "3" : "2",
      label: isSolana ? "Authorities you fully control" : "Ownership controls you fully control",
    },
    { value: "100%", label: "Supply sent to your wallet" },
  ];

  return (
    <section className="border-y border-border/60 bg-secondary/20">
      <div className="container grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-3xl font-bold gradient-text sm:text-4xl">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
