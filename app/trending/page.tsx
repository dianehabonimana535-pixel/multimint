import TrendingCoins from "@/components/TrendingCoins";
import TrendingHeader from "@/components/TrendingHeader";
import { BRAND_FULL } from "@/lib/brand";

export const metadata = {
  title: `Trending \u2014 ${BRAND_FULL}`,
  description: "Top memecoins by 24h trading volume on Solana and BNB Chain.",
};

export default function TrendingPage() {
  return (
    <main className="container py-10">
      <TrendingHeader />
      <TrendingCoins />
    </main>
  );
}
