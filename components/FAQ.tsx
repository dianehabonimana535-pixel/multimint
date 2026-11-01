"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_FULL, BRAND_NAME } from "@/lib/brand";
import { useAppNetwork } from "@/components/NetworkProvider";
import type { NetworkId } from "@/lib/network";

interface FaqItem {
  q: string;
  a: string;
}

const solanaFaqs: FaqItem[] = [
  {
    q: `Does ${BRAND_FULL} charge a fee?`,
    a: `No. ${BRAND_FULL} is free to use \u2014 there is no platform fee for creating a token or for revoking an authority. You only pay the Solana network's own transaction fees and the one-time rent-exemption deposit for the accounts your token needs. The exact total is always shown before you sign.`,
  },
  {
    q: "Do you ever ask for my seed phrase or private key?",
    a: `Never. ${BRAND_FULL} only connects through your wallet's adapter (Phantom, Solflare, Backpack, Glow, Trust Wallet). Every transaction is built here, then signed locally inside your own wallet. We never see, store, or request your keys.`,
  },
  {
    q: "What does revoking mint authority do?",
    a: "It permanently removes the ability for anyone \u2014 including you \u2014 to mint additional supply. Total supply becomes fixed forever, which is often a signal of trust for holders.",
  },
  {
    q: "What does revoking freeze authority do?",
    a: "It removes the ability to freeze any holder's token account, guaranteeing no one can ever lock a holder out of their balance.",
  },
  {
    q: "What does revoking update authority do?",
    a: "It makes your token's on-chain metadata (name, symbol, image, links) permanently immutable \u2014 it can never be changed again by anyone.",
  },
  {
    q: "Which network does this run on?",
    a: "Solana mainnet-beta. Tokens you create here are real, live SPL tokens immediately tradable by anyone holding SOL. Use the network switcher in the top navigation to move to BNB Chain or Robinhood Chain.",
  },
  {
    q: "Can I undo a revoked authority?",
    a: "No. Revoking an authority is permanent and irreversible by design \u2014 that's what makes the guarantee meaningful to holders. Review your choices carefully before confirming.",
  },
];

const evmFaqsBefore: FaqItem[] = [
  {
    q: `Does ${BRAND_FULL} charge a fee?`,
    a: `No. ${BRAND_FULL} is free to use \u2014 there is no platform fee for creating a token or for renouncing ownership. You only pay the network's own gas fees. The exact total is always shown in your wallet before you sign.`,
  },
  {
    q: "Do you ever ask for my seed phrase or private key?",
    a: `Never. ${BRAND_FULL} only connects through your wallet (MetaMask, Trust Wallet, Binance Wallet, or any WalletConnect-compatible wallet). The deployment transaction is built here, then signed locally inside your own wallet. We never see, store, or request your keys.`,
  },
  {
    q: 'What does "Mintable" mean?',
    a: "It's a permanent, structural choice made at deployment: if you leave it off, your contract has no working mint() function at all \u2014 total supply is fixed forever, no matter what. If you turn it on, the contract owner (you, until renounced) can mint additional supply later.",
  },
  {
    q: "What does renouncing ownership do?",
    a: "It permanently removes every owner-only privilege from your contract \u2014 no more minting (even if mintable was enabled) and no more updating the token's off-chain metadata (logo/links). This can be done atomically in the same transaction that deploys your token, or at any later time \u2014 but it can never be undone.",
  },
  {
    q: "Does the contract have a freeze, pause, or blacklist function?",
    a: `No, and it never will. Unlike some token templates, ${BRAND_NAME}'s contract intentionally has no owner-side ability to freeze, pause trading, or blacklist wallets \u2014 a common rug-pull vector. What you see in the source is the entire privilege surface.`,
  },
];

const evmFaqsAfter: FaqItem[] = [
  {
    q: "Can I undo a renounced ownership?",
    a: "No. Renouncing ownership is permanent and irreversible by design \u2014 that's what makes the guarantee meaningful to holders. Review your choices carefully before confirming.",
  },
];

const networkAnswers: Record<Exclude<NetworkId, "solana">, string> = {
  "solana-devnet":
    "Solana Devnet, selected via the switcher in the top navigation. Tokens created here use free test SOL (get some at faucet.solana.com) and have no real market value \u2014 great for trying the whole flow risk-free. Your wallet must be set to Devnet too. Switch to Solana to create a real, live SPL token.",
  mainnet:
    "BNB Smart Chain (BSC) mainnet, selected via the switcher in the top navigation. Tokens you create here are real, live BEP-20 tokens immediately tradable by anyone holding BNB. You can flip the switcher to a testnet at any time to try the flow first with free test coins.",
  testnet:
    "The switcher in the top navigation is currently set to BNB Smart Chain Testnet. Tokens created here use free test BNB and have no real market value \u2014 great for trying the whole flow risk-free. Switch to BNB Smart Chain to deploy a real, live BEP-20 token.",
  robinhood:
    "Robinhood Chain mainnet (an Ethereum Layer 2 built on Arbitrum Orbit, chain ID 4663). Gas is paid in ETH. Tokens you create here are real, live ERC-20 tokens. Try Robinhood Chain Testnet first if you want to rehearse for free.",
  "robinhood-testnet":
    "Robinhood Chain Testnet (chain ID 46630). Gas is paid in free test ETH from the Robinhood Chain faucet. Tokens created here have no real value \u2014 a safe way to try the whole flow before going to Robinhood Chain mainnet.",
};

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const { network } = useAppNetwork();

  const faqs: FaqItem[] =
    network === "solana" || network === "solana-devnet"
      ? network === "solana-devnet"
        ? solanaFaqs.map((item) =>
            item.q === "Which network does this run on?"
              ? { ...item, a: networkAnswers["solana-devnet"] }
              : item
          )
        : solanaFaqs
      : [
          ...evmFaqsBefore,
          { q: "Which network does this run on?", a: networkAnswers[network] },
          ...evmFaqsAfter,
        ];

  return (
    <section id="faq" className="container py-24">
      <div className="mx-auto mb-12 max-w-xl text-center">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Frequently asked</h2>
        <p className="mt-3 text-muted-foreground">
          Everything you need to know before you strike your first coin.
        </p>
      </div>

      <div className="mx-auto max-w-2xl divide-y divide-border/60 rounded-2xl border border-border/60">
        {faqs.map((item, i) => (
          <div key={item.q}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium sm:text-base"
              aria-expanded={open === i}
            >
              {item.q}
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                  open === i && "rotate-180"
                )}
              />
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm text-muted-foreground">{item.a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
