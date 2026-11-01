"use client";

import { FlaskConical, Radio } from "lucide-react";
import { useAppNetwork } from "@/components/NetworkProvider";
import { NETWORKS, NETWORK_IDS } from "@/lib/network";
import { cn } from "@/lib/utils";

export default function NetworkSwitcher({ className }: { className?: string }) {
  const { network, setNetwork, isSwitching } = useAppNetwork();

  return (
    <div
      role="group"
      aria-label="Select network"
      className={cn(
        "flex max-w-full flex-wrap items-center gap-0.5 rounded-md border border-border bg-secondary/40 p-0.5",
        className
      )}
    >
      {NETWORK_IDS.map((id) => {
        const active = network === id;
        const config = NETWORKS[id];
        const Icon = config.isTestnet ? FlaskConical : Radio;

        return (
          <button
            key={id}
            type="button"
            disabled={isSwitching}
            aria-pressed={active}
            title={config.label}
            onClick={() => setNetwork(id)}
            className={cn(
              "flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors disabled:cursor-wait disabled:opacity-60",
              active
                ? config.isTestnet
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-accent/20 text-accent"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-3 w-3" />
            {config.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
