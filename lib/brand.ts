// Single place to rename the product. Change BRAND_NAME and every page,
// metadata block, share text and Pinata file name follows.
export const BRAND_NAME = "MultiMint";
export const BRAND_FULL = `${BRAND_NAME} Launchpad`;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.length > 0
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://multimint-launch.vercel.app";

// localStorage keys. The "legacy" ones belong to the two original apps
// (SolMint / BnbMint) and are migrated automatically on first load.
export const STORAGE = {
  history: "multimint.history",
  network: "multimint.network",
  theme: "multimint.theme",
  legacyHistorySolana: "solmint.history",
  legacyHistoryBnb: "bnbmint.history",
  legacyNetwork: "bnbmint.network",
  legacyThemeSolana: "solmint.theme",
  legacyThemeBnb: "bnbmint.theme",
} as const;
