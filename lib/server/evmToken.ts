import { createPublicClient, http, isAddress } from "viem";
import { BEP20_ABI } from "@/lib/contracts/BEP20Token";
import { NETWORKS, explorerTokenUrl, getEvmChain, type NetworkId } from "@/lib/network";
import { TokenLookupError } from "@/lib/server/solanaToken";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

interface DexscreenerPair {
  pairAddress: string;
  priceUsd?: string;
  priceChange?: { h24?: number };
  volume?: { h24?: number };
  liquidity?: { usd?: number };
}

export async function getEvmTokenDetails(address: string, network: NetworkId) {
  const config = NETWORKS[network];

  if (config.family !== "evm") {
    throw new TokenLookupError("This network is not an EVM network", 400);
  }
  if (!isAddress(address)) {
    throw new TokenLookupError("Invalid token address", 400);
  }

  const client = createPublicClient({ chain: getEvmChain(network), transport: http(config.rpcUrl) });

  const [name, symbol, decimals, totalSupply, owner, mintable, tokenURI] = await Promise.all([
    client.readContract({ address, abi: BEP20_ABI, functionName: "name" }) as Promise<string>,
    client.readContract({ address, abi: BEP20_ABI, functionName: "symbol" }) as Promise<string>,
    client.readContract({ address, abi: BEP20_ABI, functionName: "decimals" }) as Promise<number>,
    client.readContract({ address, abi: BEP20_ABI, functionName: "totalSupply" }) as Promise<bigint>,
    client.readContract({ address, abi: BEP20_ABI, functionName: "owner" }) as Promise<string>,
    client.readContract({ address, abi: BEP20_ABI, functionName: "mintable" }) as Promise<boolean>,
    client.readContract({ address, abi: BEP20_ABI, functionName: "tokenURI" }) as Promise<string>,
  ]).catch(() => {
    throw new TokenLookupError(
      "Address is not a token contract created by this launchpad on this network",
      404
    );
  });

  let offChainImage: string | null = null;
  let description: string | null = null;
  if (tokenURI) {
    try {
      const res = await fetch(tokenURI, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const json = await res.json();
        offChainImage = json.image ?? null;
        description = json.description ?? null;
      }
    } catch {
      // best effort
    }
  }

  let market: {
    priceUsd: number;
    volume24h: number;
    liquidityUsd: number;
    priceChange24h: number;
    dexscreenerUrl: string;
  } | null = null;

  // Dexscreener only indexes pairs with real, live liquidity - which here only
  // exists on BNB Smart Chain mainnet. Skip the lookup for every other network.
  if (config.hasLiveMarket && config.dexscreenerChain) {
    try {
      const dexRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`, {
        signal: AbortSignal.timeout(4000),
      });
      if (dexRes.ok) {
        const json = await dexRes.json();
        const pairs: DexscreenerPair[] = json?.pairs ?? [];
        const best = pairs.reduce<DexscreenerPair | null>((acc, p) => {
          const liq = p.liquidity?.usd ?? 0;
          if (!acc || liq > (acc.liquidity?.usd ?? 0)) return p;
          return acc;
        }, null);
        if (best) {
          market = {
            priceUsd: Number(best.priceUsd ?? 0),
            volume24h: best.volume?.h24 ?? 0,
            liquidityUsd: best.liquidity?.usd ?? 0,
            priceChange24h: best.priceChange?.h24 ?? 0,
            dexscreenerUrl: `https://dexscreener.com/${config.dexscreenerChain}/${best.pairAddress}`,
          };
        }
      }
    } catch {
      // best effort
    }
  }

  return {
    family: "evm" as const,
    network,
    tokenAddress: address,
    name,
    symbol,
    logoUri: offChainImage,
    description,
    supply: totalSupply.toString(),
    decimals,
    mintable,
    ownershipRenounced: owner.toLowerCase() === ZERO_ADDRESS,
    market,
    explorerUrl: explorerTokenUrl(address, network),
  };
}
