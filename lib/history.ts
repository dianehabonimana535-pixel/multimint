import { STORAGE } from "./brand";
import { LEGACY_EVM_NETWORK, isNetworkId, type NetworkId } from "./network";

export interface TokenHistoryEntry {
  name: string;
  symbol: string;
  /** Token address: SPL mint on Solana, contract address on EVM chains. */
  address: string;
  /** Transaction id: signature on Solana, hash on EVM chains. */
  txId: string;
  createdAt: string; // ISO date
  imageUri?: string;
  /** Which network this token was actually created on. */
  network: NetworkId;
  /** Solana: how many of the 3 authorities (mint/freeze/update) were revoked. */
  revokedCount?: number;
  /** EVM: whether ownership was renounced in the deployment transaction. */
  ownershipRenounced?: boolean;
}

function readRaw(key: string): unknown[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Entries written by the two original apps use different field names:
//   SolMint: { mintAddress, signature, revokedCount }
//   BnbMint: { contractAddress, txHash, ownershipRenounced, network? }
function normalize(item: any, fallbackNetwork: NetworkId): TokenHistoryEntry | null {
  if (!item || typeof item !== "object") return null;
  const address = item.address ?? item.mintAddress ?? item.contractAddress;
  const txId = item.txId ?? item.signature ?? item.txHash;
  if (typeof address !== "string" || typeof txId !== "string") return null;

  const network: NetworkId = isNetworkId(item.network) ? item.network : fallbackNetwork;

  return {
    name: String(item.name ?? ""),
    symbol: String(item.symbol ?? ""),
    address,
    txId,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date(0).toISOString(),
    imageUri: typeof item.imageUri === "string" ? item.imageUri : undefined,
    network,
    revokedCount: typeof item.revokedCount === "number" ? item.revokedCount : undefined,
    ownershipRenounced:
      typeof item.ownershipRenounced === "boolean" ? item.ownershipRenounced : undefined,
  };
}

function migrateLegacy(): TokenHistoryEntry[] {
  const solana = readRaw(STORAGE.legacyHistorySolana)
    .map((e) => normalize(e, "solana"))
    .filter((e): e is TokenHistoryEntry => e !== null);
  const bnb = readRaw(STORAGE.legacyHistoryBnb)
    .map((e) => normalize(e, LEGACY_EVM_NETWORK))
    .filter((e): e is TokenHistoryEntry => e !== null);

  return [...solana, ...bnb].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getHistory(): TokenHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const hasNew = window.localStorage.getItem(STORAGE.history) !== null;
    if (hasNew) {
      return readRaw(STORAGE.history)
        .map((e) => normalize(e, "solana"))
        .filter((e): e is TokenHistoryEntry => e !== null);
    }

    // First load of the merged app: pull in history from the old apps.
    // The legacy keys are left untouched on purpose so nothing is lost if
    // the user still has the old sites open.
    const migrated = migrateLegacy();
    if (migrated.length > 0) {
      window.localStorage.setItem(STORAGE.history, JSON.stringify(migrated.slice(0, 200)));
    }
    return migrated;
  } catch {
    return [];
  }
}

export function addHistoryEntry(entry: TokenHistoryEntry): void {
  if (typeof window === "undefined") return;
  const current = getHistory();
  current.unshift(entry);
  window.localStorage.setItem(STORAGE.history, JSON.stringify(current.slice(0, 200)));
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE.history);
  // Also clear the legacy keys, otherwise "Clear" would be undone by the
  // automatic migration on the next page load.
  window.localStorage.removeItem(STORAGE.legacyHistorySolana);
  window.localStorage.removeItem(STORAGE.legacyHistoryBnb);
}
