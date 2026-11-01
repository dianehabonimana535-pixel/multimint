import { NETWORKS, DEFAULT_NETWORK, type NetworkId } from "./network";

export interface FeeLine {
  label: string;
  value: string;
}

export interface FeeEstimate {
  network: NetworkId;
  /** Gas / rent token symbol for the selected network (SOL, BNB, ETH...). */
  nativeSymbol: string;
  /** Network cost only (gas, or rent + base fee on Solana). */
  networkFee: number;
  platformCreationFee: number;
  total: number;
  /** Itemized rows for the cost card. */
  lines: FeeLine[];
  /** How many decimals to show for the total. */
  precision: number;
}

// Neither chain family charges a platform fee in this app.
export const PLATFORM_CREATION_FEE = 0;
export const PLATFORM_REVOKE_FEE = 0;

// --- Solana -----------------------------------------------------------------
// Rent-exemption deposits for the three accounts a new token needs, plus the
// base transaction fee.
const MINT_ACCOUNT_RENT = 0.00203928;
const METADATA_ACCOUNT_RENT = 0.00561672;
const TOKEN_ACCOUNT_RENT = 0.00203928;
const BASE_NETWORK_FEE = 0.00001;

// --- EVM --------------------------------------------------------------------
// Rough gas budget for deploying BEP20Token.sol (ERC20 + Burnable + Ownable,
// with the constructor mint and optional immediate renounce). Real gas usage
// varies slightly with string lengths (name/symbol/tokenURI) and whether
// renounceOwnershipImmediately is set. On Robinhood Chain (an Arbitrum Orbit
// L2) the gas figure also folds in the L1 data cost, so treat it as a very
// rough guide: the wallet always shows the exact, final estimate before the
// user signs.
const DEPLOY_GAS_ESTIMATE = 1_600_000n;

export function estimateFees(
  network: NetworkId = DEFAULT_NETWORK,
  options: { gasPriceGwei?: number; authoritiesToRevokeCount?: number } = {}
): FeeEstimate {
  const config = NETWORKS[network];

  if (config.family === "solana") {
    const platformFee =
      PLATFORM_CREATION_FEE + (options.authoritiesToRevokeCount ?? 0) * PLATFORM_REVOKE_FEE;
    const networkFee =
      MINT_ACCOUNT_RENT + METADATA_ACCOUNT_RENT + TOKEN_ACCOUNT_RENT + BASE_NETWORK_FEE;

    return {
      network,
      nativeSymbol: config.nativeSymbol,
      networkFee,
      platformCreationFee: platformFee,
      total: networkFee + platformFee,
      precision: 6,
      lines: [
        { label: "Mint account rent", value: `${MINT_ACCOUNT_RENT} SOL` },
        { label: "Metadata account rent", value: `${METADATA_ACCOUNT_RENT} SOL` },
        { label: "Token account rent", value: `${TOKEN_ACCOUNT_RENT} SOL` },
        { label: "Network fee", value: `${BASE_NETWORK_FEE} SOL` },
      ],
    };
  }

  const price = options.gasPriceGwei ?? config.fallbackGasPriceGwei;
  const networkFee = (Number(DEPLOY_GAS_ESTIMATE) * price) / 1_000_000_000;

  return {
    network,
    nativeSymbol: config.nativeSymbol,
    networkFee,
    platformCreationFee: PLATFORM_CREATION_FEE,
    total: networkFee + PLATFORM_CREATION_FEE,
    precision: 6,
    lines: [
      { label: "Est. deploy gas", value: `${DEPLOY_GAS_ESTIMATE.toLocaleString()} units` },
      { label: "Gas price (fallback)", value: `${price} gwei` },
    ],
  };
}
