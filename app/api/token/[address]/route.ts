import { NextResponse } from "next/server";
import { resolveNetworkForAddress, NETWORKS } from "@/lib/network";
import { TokenLookupError, getSolanaTokenDetails } from "@/lib/server/solanaToken";
import { getEvmTokenDetails } from "@/lib/server/evmToken";

export const revalidate = 30;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;
  const network = resolveNetworkForAddress(address, new URL(req.url).searchParams.get("network"));

  try {
    const details =
      NETWORKS[network].family === "solana"
        ? await getSolanaTokenDetails(address, network)
        : await getEvmTokenDetails(address, network);

    return NextResponse.json(details);
  } catch (err) {
    if (err instanceof TokenLookupError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
