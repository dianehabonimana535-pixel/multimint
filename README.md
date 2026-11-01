# MultiMint Launchpad

Un seul projet Next.js pour lancer des memecoins sur **Solana**, **BNB Smart Chain** et **Robinhood Chain** (mainnet + testnet), sans frais de plateforme. Il remplace les deux projets séparés (LUNA / SolMint et BNB-launch / BnbMint).

| Réseau (sélecteur en haut) | Famille | Création du token | Wallet |
| --- | --- | --- | --- |
| Solana / Sol Dev (devnet) | `solana` | SPL + Metaplex, une seule transaction (`lib/mint.ts`) | Phantom, Solflare, etc. (Wallet Standard) |
| BNB / BNB Test | `evm` | Contrat `BEP20Token.sol` déployé depuis le wallet (`lib/deploy.ts`) | RainbowKit (MetaMask, Trust, WalletConnect) |
| Robinhood / RH Test | `evm` | Même contrat, chaînes 4663 / 46630 | RainbowKit |

Le bouton de connexion, les options (authorities vs ownership), les frais, la FAQ, le trending et les liens d'explorateur suivent automatiquement le réseau choisi.

## Structure

```
app/
  api/token/[address]/   détail d'un token (Solana ou EVM, choisi par ?network= ou par le format de l'adresse)
  api/trending/          Raydium pour Solana, Dexscreener pour BNB (?network=)
  api/upload/            upload logo + metadata vers Pinata/IPFS
  token/[address]/       dashboard d'un token
  create, history, trending
components/
  Web3Provider.tsx       monte wagmi/RainbowKit ET le wallet adapter Solana
  NetworkProvider.tsx    réseau sélectionné (persisté), changement de chaîne du wallet EVM
  ConnectWalletButton    bouton Solana ou EVM selon le réseau
  TokenCreatorForm.tsx   un seul formulaire, deux flux de création
lib/
  brand.ts               nom du produit, URL, clés localStorage  (changer BRAND_NAME ici)
  network.ts             config des 5 réseaux, explorateurs, liens DEX, partage sur X
  fees.ts                estimation des frais (rent Solana / gas EVM)
  mint.ts                création Solana        deploy.ts   déploiement EVM
  history.ts             historique unifié + migration automatique des anciens historiques
  server/                lecture on-chain côté serveur (solanaToken.ts, evmToken.ts)
contracts/BEP20Token.sol compilé au `postinstall` (scripts/compile-contract.js)
```

## Lancer

```bash
cp .env.example .env.local   # renseigner PINATA_JWT au minimum
npm install                  # compile aussi le contrat Solidity
npm run dev
```

Variables : voir `.env.example` (Pinata, RPC Solana / BSC / Robinhood, WalletConnect, URL du site). Un RPC Solana dédié (Helius, QuickNode...) est fortement conseillé en production.

## Compatibilité avec les anciens projets

- Les liens `/token/<adresse>` existants continuent de marcher : une adresse `0x...` sans `?network=` est lue comme BNB mainnet, une adresse base58 comme Solana.
- Les ids `mainnet` / `testnet` (BNB) sont conservés, donc les liens `?network=testnet` restent valides.
- Au premier chargement, les historiques `solmint.history` et `bnbmint.history` du navigateur sont fusionnés dans `multimint.history` (les anciennes clés ne sont pas supprimées, sauf via le bouton « Clear »). Même chose pour le thème et le réseau choisi.
- Le contrat `BEP20Token.sol`, la logique de `mint.ts` et celle de `deploy.ts` n'ont pas été modifiés.

## À savoir

- Les ids de chaîne et RPC de Robinhood Chain (4663 / 46630) viennent du projet BNB-launch tel quel : à re-vérifier avant un déploiement mainnet.
- Sur Solana Devnet, mets aussi ton wallet en Devnet (Phantom : mode testnet). Les liens Solscan utilisent `?cluster=devnet`, et les anciens liens `/token/<mint>` sans `?network=` sont lus comme mainnet.
- Aucun marché indexé pour les testnets et Robinhood : trending vide et pas de bouton « Create Liquidity Pool » sur ces réseaux.
- Les deux piles wallet sont chargées ensemble, la page `/create` est donc plus lourde (~500 kB de JS au premier chargement).
