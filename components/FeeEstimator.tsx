"use client";

import { estimateFees } from "@/lib/fees";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import { useAppNetwork } from "@/components/NetworkProvider";
import { BRAND_FULL } from "@/lib/brand";

export default function FeeEstimator({
  gasPriceGwei,
  authoritiesToRevokeCount,
}: {
  gasPriceGwei?: number;
  authoritiesToRevokeCount?: number;
}) {
  const { config, network } = useAppNetwork();
  const fees = estimateFees(network, { gasPriceGwei, authoritiesToRevokeCount });
  const isSolana = config.family === "solana";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Estimated cost</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {fees.lines.map((line) => (
          <div key={line.label} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{line.label}</span>
            <span className="font-mono">{line.value}</span>
          </div>
        ))}
        <div className="my-2 h-px bg-border" />
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>Total</span>
          <span className="font-mono gradient-text">
            ~{fees.total.toFixed(fees.precision)} {fees.nativeSymbol}
          </span>
        </div>
        <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3 w-3 shrink-0" />
          {isSolana
            ? `This is a rough estimate. It only includes Solana's own rent and network fees \u2014 ${BRAND_FULL} charges no platform fee. Your wallet shows the exact final amount before you sign.`
            : `This is a rough estimate based on typical ${config.label} gas prices. ${BRAND_FULL} charges no platform fee \u2014 your wallet shows the exact final gas cost before you sign.`}
        </p>
      </CardContent>
    </Card>
  );
}
