"use client";

import { cn } from "@/lib/utils";

export interface Step {
  key: string;
  label: string;
}

export const MINT_STEPS: Step[] = [
  { key: "wallet", label: "Confirming transaction" },
  { key: "logo", label: "Uploading logo" },
  { key: "metadata", label: "Uploading metadata" },
  { key: "deploy", label: "Deploying token contract" },
  { key: "supply", label: "Minting supply to recipient" },
  { key: "ownership", label: "Renouncing ownership" },
  { key: "complete", label: "Token deployed — sent to your wallet" },
];

export default function ProgressSteps({
  steps,
  currentIndex,
  failedIndex,
}: {
  steps: Step[];
  currentIndex: number;
  failedIndex?: number | null;
}) {
  const total = steps.length;
  const isFailed = typeof failedIndex === "number" && failedIndex >= 0;
  const clampedIndex = Math.max(0, Math.min(currentIndex, total));
  const percent = Math.round((clampedIndex / total) * 100);
  const activeIndex = isFailed ? (failedIndex as number) : Math.min(currentIndex, total - 1);

  const headerLabel = isFailed
    ? steps[activeIndex]?.label
    : currentIndex >= total
    ? "Complete"
    : `${steps[Math.max(0, activeIndex)]?.label}…`;

  const doneSteps = steps.slice(0, Math.max(0, activeIndex));
  const upcomingSteps = steps.slice(activeIndex + 1);

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <p
          className={cn(
            "text-sm font-semibold",
            isFailed ? "text-destructive" : "text-foreground"
          )}
        >
          {headerLabel}
        </p>
        <span
          className={cn(
            "font-mono text-sm font-semibold",
            isFailed ? "text-destructive" : "text-accent"
          )}
        >
          {percent}%
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/60">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            isFailed ? "bg-destructive" : "animated-gradient"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-3 space-y-1 text-xs">
        {doneSteps.map((step) => (
          <p key={step.key} className="text-accent">
            {step.label} ✓
          </p>
        ))}

        {!isFailed && currentIndex < total && (
          <p className="text-foreground">{steps[activeIndex]?.label}…</p>
        )}

        {isFailed && (
          <p className="text-destructive">{steps[activeIndex]?.label} — failed</p>
        )}

        {upcomingSteps.length > 0 && (
          <p className="text-muted-foreground">
            Steps continue: {upcomingSteps.map((s) => s.label).join(" → ")}
            {currentIndex < total ? " → Complete" : ""}
          </p>
        )}
      </div>
    </div>
  );
}
