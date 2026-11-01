"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Coins, Lock, PenOff, ShieldOff, Snowflake } from "lucide-react";
import type { ChainFamily } from "@/lib/network";

// One state object covers both chain families; each family only shows and
// uses its own fields.
export interface Authorities {
  // Solana (SPL): the three authorities that can each be revoked.
  revokeMint: boolean;
  revokeFreeze: boolean;
  revokeUpdate: boolean;
  // EVM (BEP-20 / ERC-20): contract-level choices made at deployment.
  mintable: boolean;
  renounceOwnership: boolean;
}

export const defaultAuthorities: Authorities = {
  revokeMint: true,
  revokeFreeze: true,
  revokeUpdate: true,
  mintable: false,
  renounceOwnership: true,
};

type SolanaKey = "revokeMint" | "revokeFreeze" | "revokeUpdate";

const solanaItems: {
  key: SolanaKey;
  icon: typeof Lock;
  title: string;
  before: string;
  after: string;
}[] = [
  {
    key: "revokeMint",
    icon: Lock,
    title: "Revoke Mint Authority",
    before: "You (or anyone holding this authority) can mint more tokens later.",
    after: "No one can ever mint more tokens. Total supply is fixed forever.",
  },
  {
    key: "revokeFreeze",
    icon: Snowflake,
    title: "Revoke Freeze Authority",
    before: "The holder of this authority can freeze any wallet's token account.",
    after: "No one can freeze holders. Every wallet keeps full control of its balance.",
  },
  {
    key: "revokeUpdate",
    icon: PenOff,
    title: "Revoke Update Authority",
    before: "The name, symbol, image, and links can still be edited later.",
    after: "Metadata becomes immutable \u2014 it can never be changed by anyone.",
  },
];

const FreeBadge = () => (
  <span className="ml-auto rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[11px] font-medium text-accent">
    Free
  </span>
);

export default function AuthorityOptions({
  family,
  value,
  onChange,
}: {
  family: ChainFamily;
  value: Authorities;
  onChange: (next: Authorities) => void;
}) {
  if (family === "solana") {
    return (
      <div className="flex flex-col gap-3">
        {solanaItems.map((item) => {
          const checked = value[item.key];
          return (
            <div
              key={item.key}
              className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-4"
            >
              <Checkbox
                id={item.key}
                checked={checked}
                onCheckedChange={(v) => onChange({ ...value, [item.key]: Boolean(v) })}
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label htmlFor={item.key} className="flex items-center gap-2 text-sm font-semibold">
                  <item.icon className="h-3.5 w-3.5 text-accent" />
                  {item.title}
                  <FreeBadge />
                </Label>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/80">If revoked: </span>
                  {item.after}
                </p>
                {!checked && (
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    Currently kept: {item.before}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        <p className="text-xs text-muted-foreground">
          Revoking an authority is permanent and cannot be undone once confirmed on-chain.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-4">
        <Checkbox
          id="mintable"
          checked={value.mintable}
          onCheckedChange={(v) => onChange({ ...value, mintable: Boolean(v) })}
          className="mt-0.5"
        />
        <div className="flex-1">
          <Label htmlFor="mintable" className="flex items-center gap-2 text-sm font-semibold">
            <Coins className="h-3.5 w-3.5 text-accent" />
            Mintable
            <FreeBadge />
          </Label>
          <p className="mt-1.5 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">If enabled: </span>
            the contract owner can mint additional supply later. This is a permanent,
            structural choice made at deployment &mdash; it cannot be turned on afterwards if
            left off here. Leave it off for a fixed supply, like most established meme coins.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-4">
        <Checkbox
          id="renounceOwnership"
          checked={value.renounceOwnership}
          onCheckedChange={(v) => onChange({ ...value, renounceOwnership: Boolean(v) })}
          className="mt-0.5"
        />
        <div className="flex-1">
          <Label htmlFor="renounceOwnership" className="flex items-center gap-2 text-sm font-semibold">
            <ShieldOff className="h-3.5 w-3.5 text-accent" />
            Renounce ownership immediately
            <FreeBadge />
          </Label>
          <p className="mt-1.5 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">If enabled: </span>
            in the same deployment transaction, ownership is transferred to the zero
            address forever. No one &mdash; including you &mdash; will ever be able to mint more
            supply or change the token&apos;s metadata again. This is often a strong
            trust signal for holders.
          </p>
          {!value.renounceOwnership && (
            <p className="mt-1 text-xs text-muted-foreground/70">
              Currently kept: you (the deployer) can still mint (if mintable) and update
              the token&apos;s metadata link.
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Renouncing ownership is permanent and cannot be undone once confirmed on-chain.
        There is no owner-side freeze, pause, or blacklist function in this contract &mdash;
        by design, it doesn&apos;t exist to renounce.
      </p>
    </div>
  );
}
