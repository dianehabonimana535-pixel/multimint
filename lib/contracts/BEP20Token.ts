import artifact from "./BEP20Token.json";
import type { Abi } from "viem";

export const BEP20_ABI = artifact.abi as Abi;
export const BEP20_BYTECODE = artifact.bytecode as `0x${string}`;

/**
 * True once scripts/compile-contract.js has produced real bytecode.
 * Stays false only if the "postinstall" compile step never ran or failed
 * (e.g. a from-source install without `npm install`, or a build log worth
 * checking on Vercel).
 */
export const CONTRACT_READY = BEP20_BYTECODE.length > 2;
