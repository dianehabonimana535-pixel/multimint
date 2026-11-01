import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Web3Provider from "@/components/Web3Provider";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import { BRAND_FULL, SITE_URL } from "@/lib/brand";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${BRAND_FULL} \u2014 Create Meme Coins on Solana, BNB Chain and Robinhood Chain`,
  description:
    "Launch your own meme coin on Solana, BNB Smart Chain or Robinhood Chain in minutes. No code required \u2014 no platform fee, just the network's own costs.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: BRAND_FULL,
    description: "Create meme coins on Solana, BNB Chain and Robinhood Chain. Free, no platform fee.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}>
        <Web3Provider>
          <div className="relative min-h-screen overflow-x-hidden">
            <div className="press-bed pointer-events-none absolute inset-0 h-[640px]" />
            <div className="bg-grid-glow pointer-events-none absolute inset-0" />
            <div className="relative">
              <Navbar />
              {children}
            </div>
          </div>
          <Toaster theme="dark" position="bottom-right" richColors />
        </Web3Provider>
      </body>
    </html>
  );
}
