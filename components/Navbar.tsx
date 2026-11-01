"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coins, Moon, Sun, History, Droplets } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getHistory } from "@/lib/history";
import { liquidityLandingUrl, liquidityUrl } from "@/lib/network";
import { BRAND_NAME, STORAGE } from "@/lib/brand";
import { useAppNetwork } from "@/components/NetworkProvider";
import NetworkSwitcher from "@/components/NetworkSwitcher";
import ConnectWalletButton from "@/components/ConnectWalletButton";

type NavLink = {
  href: string;
  label: string;
  external?: boolean;
};

const baseLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/create", label: "Create Token" },
  { href: "/trending", label: "Trending" },
  { href: "#faq", label: "How it works" },
  { href: "/history", label: "History" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { network } = useAppNetwork();
  const [isLight, setIsLight] = useState(false);
  const [lastTokenAddress, setLastTokenAddress] = useState<string | null>(null);

  useEffect(() => {
    const stored =
      window.localStorage.getItem(STORAGE.theme) ??
      window.localStorage.getItem(STORAGE.legacyThemeBnb) ??
      window.localStorage.getItem(STORAGE.legacyThemeSolana);
    const light = stored === "light";
    setIsLight(light);
    document.documentElement.classList.toggle("light", light);
    document.documentElement.classList.toggle("dark", !light);
  }, []);

  // Most recent token created on the selected network, used to pre-fill the
  // "Create Liquidity Pool" shortcut.
  useEffect(() => {
    const lastOnNetwork = getHistory().find((entry) => entry.network === network);
    setLastTokenAddress(lastOnNetwork ? lastOnNetwork.address : null);
  }, [pathname, network]);

  function toggleTheme() {
    const next = !isLight;
    setIsLight(next);
    document.documentElement.classList.toggle("light", next);
    document.documentElement.classList.toggle("dark", !next);
    window.localStorage.setItem(STORAGE.theme, next ? "light" : "dark");
  }

  // Real liquidity pools only exist on networks with a supported DEX (Raydium
  // on Solana, PancakeSwap on BNB mainnet), so the link is hidden elsewhere.
  const liquidityHref =
    (lastTokenAddress ? liquidityUrl(network, lastTokenAddress) : null) ??
    liquidityLandingUrl(network);

  const links: NavLink[] = [
    ...baseLinks.slice(0, 2),
    ...(liquidityHref
      ? [{ href: liquidityHref, label: "Create Liquidity Pool", external: true }]
      : []),
    ...baseLinks.slice(2),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-lg">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5 font-display text-sm font-bold">
          <span className="flex h-6 w-6 items-center justify-center rounded-md animated-gradient">
            <Coins className="h-3 w-3 text-white" />
          </span>
          {BRAND_NAME}
          <span className="gradient-text">Launchpad</span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
                pathname === link.href && "bg-secondary text-foreground"
              )}
            >
              {link.label === "History" ? (
                <span className="flex items-center gap-1">
                  <History className="h-3 w-3" /> {link.label}
                </span>
              ) : link.label === "Create Liquidity Pool" ? (
                <span className="flex items-center gap-1">
                  <Droplets className="h-3 w-3" /> {link.label}
                </span>
              ) : (
                link.label
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <NetworkSwitcher className="hidden sm:flex" />
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground"
          >
            {isLight ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
          </button>
          <ConnectWalletButton />
        </div>
      </div>

      <nav className="flex flex-col gap-2 border-t border-border/60 px-4 py-2 md:hidden">
        <NetworkSwitcher className="self-start sm:hidden" />
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
            className={cn(
              "block rounded-md px-2.5 py-1.5 text-xs text-muted-foreground",
              pathname === link.href && "bg-secondary text-foreground"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
