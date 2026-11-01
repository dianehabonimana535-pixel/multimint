"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, FlaskConical, Radio } from "lucide-react";
import { useAppNetwork } from "@/components/NetworkProvider";
import { NETWORKS, NETWORK_IDS, type NetworkId } from "@/lib/network";
import { cn } from "@/lib/utils";

const MAINNETS = NETWORK_IDS.filter((id) => !NETWORKS[id].isTestnet);
const TESTNETS = NETWORK_IDS.filter((id) => NETWORKS[id].isTestnet);

export default function NetworkSwitcher({ className }: { className?: string }) {
  const { network, config, setNetwork, isSwitching } = useAppNetwork();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside tap / Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (id: NetworkId) => {
    setOpen(false);
    setNetwork(id);
  };

  const TriggerIcon = config.isTestnet ? FlaskConical : Radio;

  const renderGroup = (title: string, ids: NetworkId[]) => (
    <div>
      <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {ids.map((id) => {
        const item = NETWORKS[id];
        const active = id === network;
        const Icon = item.isTestnet ? FlaskConical : Radio;
        return (
          <button
            key={id}
            type="button"
            role="option"
            aria-selected={active}
            onClick={() => choose(id)}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-secondary/60",
              active && "bg-secondary/40 font-medium"
            )}
          >
            <Icon className={cn("h-3.5 w-3.5", item.isTestnet ? "text-amber-400" : "text-accent")} />
            <span className="flex-1">{item.label}</span>
            {active && <Check className="h-4 w-4 text-accent" />}
          </button>
        );
      })}
    </div>
  );

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={isSwitching}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select network"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary/60 disabled:cursor-wait disabled:opacity-60",
          config.isTestnet ? "text-amber-400" : "text-accent"
        )}
      >
        <TriggerIcon className="h-3.5 w-3.5" />
        {config.label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-50 mt-2 min-w-[230px] overflow-hidden rounded-xl border border-border bg-background pb-1 shadow-xl"
        >
          {renderGroup("Mainnet", MAINNETS)}
          <div className="my-1 h-px bg-border" />
          {renderGroup("Testnet", TESTNETS)}
        </div>
      )}
    </div>
  );
}
