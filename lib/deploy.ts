import type { Address, PublicClient, WalletClient } from "viem";
import { parseUnits } from "viem";
import { BEP20_ABI, BEP20_BYTECODE, CONTRACT_READY } from "./contracts/BEP20Token";

export interface CreateTokenParams {
  walletClient: WalletClient;
  publicClient: PublicClient;
  account: Address;
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
  metadataUri: string;
  recipient: Address;
  mintable: boolean;
  renounceOwnership: boolean;
  onStep?: (step: MintStep) => void;
}

// These reflect the real, distinct asynchronous boundaries of the single
// on-chain deployment transaction: building it, waiting on the wallet to
// sign & broadcast it, having obtained the hash, and confirming it. The
// contract's constructor mints the full supply to the recipient and,
// optionally, renounces ownership -- all atomically in this one transaction.
export type MintStep =
  | "building"
  | "awaiting-signature"
  | "signed"
  | "sent"
  | "confirmed"
  | "complete";

export interface CreateTokenResult {
  tokenAddress: string;
  txHash: string;
}

export async function createToken(params: CreateTokenParams): Promise<CreateTokenResult> {
  const {
    walletClient,
    publicClient,
    account,
    name,
    symbol,
    decimals,
    supply,
    metadataUri,
    recipient,
    mintable,
    renounceOwnership,
    onStep,
  } = params;

  if (!CONTRACT_READY) {
    throw new Error(
      "The token contract hasn't been compiled yet. Run `npm install` (which runs the postinstall compile step) or `npm run compile:contract`, then try again."
    );
  }

  const initialSupply = parseUnits(supply.toString(), decimals);

  onStep?.("building");

  // Step 1: ask the wallet (MetaMask, Trust Wallet, etc.) to sign & send the
  // deployment transaction. This is the ONLY moment the wallet's own popup
  // appears. Our own custom progress popup must not be shown before this
  // call resolves.
  onStep?.("awaiting-signature");
  const txHash = await walletClient.deployContract({
    abi: BEP20_ABI,
    bytecode: BEP20_BYTECODE,
    account,
    chain: walletClient.chain,
    args: [name, symbol, decimals, initialSupply, recipient, mintable, metadataUri, renounceOwnership],
  });

  // The wallet has returned a transaction hash: it has been signed and
  // broadcast together (this is how EOA wallets send transactions). From
  // this point on it is safe to show our own progress popup.
  onStep?.("signed");
  onStep?.("sent");

  // Step 2: wait for the network to confirm it and give us the deployed
  // contract's address.
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  if (receipt.status !== "success" || !receipt.contractAddress) {
    throw new Error(
      "Transaction failed to confirm on-chain. Check BscScan with the transaction hash above for details."
    );
  }

  onStep?.("confirmed");
  onStep?.("complete");

  return { tokenAddress: receipt.contractAddress, txHash };
}
