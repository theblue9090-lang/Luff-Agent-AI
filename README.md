# LUFF AGENT

A launchpad and marketplace for tokenized AI agents, inspired by the Virtuals app
experience and rebuilt with a full red theme and the LUFF brand.

![LUFF AGENT](public/logo.svg)

## Features / Tools

- **Live coin markets (DexScreener)** — a real-time board of coins with tabs for
  **New, Top, Top Gainers, Losers, Movers (volume)** and **Trending**, showing price,
  1h / 24h change, 24h volume and market cap across chains. Auto-refreshes on an
  interval; a manual **Refresh** button is also provided.
- **pump.fun Live Launches** — a real-time stream that connects to pump.fun (via the
  free PumpPortal WebSocket) and prepends **every brand-new coin the instant it mints**,
  with a highlight animation on the newest entry and its logo pulled from on-chain metadata.
- **Sniper Bot (mainnet or simulation)** — an auto-executing sniper that watches the live
  pump.fun feed and DexScreener for **new coins** (or only coins from a specific **dev
  address**) and buys matching launches with **no manual step**. Set the **buy amount in
  SOL** and manage risk with **Take Profit / Stop Loss / trailing stop**, slippage,
  priority fee and market-cap filters. It opens positions automatically and closes them on
  triggers, with a live positions table, activity log and P&L / win-rate stats.
  - **Live (mainnet):** connect a **burner** wallet (private key held only in the tab) and
    the bot signs and submits real transactions — **PumpPortal** for bonding-curve pump.fun
    coins, **Jupiter** for routable/graduated tokens. TP/SL value positions via Jupiter and
    auto-sell on trigger.
  - **Simulation (default):** identical flow with simulated fills — battle-test strategies
    risk-free.
  - Files: `src/lib/sniperExecutor.ts` (executors), `src/hooks/useSniperBot.ts` (engine),
    `src/hooks/useDexNewCoins.ts`, `src/components/SniperBot.tsx`.
  - ⚠️ **Live mode moves real funds and is unaudited.** Use a dedicated burner with minimal
    SOL, set a reliable `VITE_SOLANA_RPC`, and test with a tiny amount first. Sniping is
    high-risk (rugs, honeypots, MEV). Browser wallets can't auto-sign, hence the burner
    model; for hardened custody run a backend executor instead.
- **Trade directly on-site + live chart** — every coin (and every new launch) has a
  **Trade** button that opens a modal with a **live DexScreener chart** and an embedded
  **Jupiter** swap so users can **buy/sell real Solana tokens** with their own wallet,
  without leaving the site. Buy/Sell toggle flips the swap direction (SOL ↔ token).
- **Portfolio (real wallet)** — connect Phantom or paste any Solana address to load its
  **real on-chain holdings** (native SOL + all SPL / Token-2022 tokens) read via RPC and
  priced live from DexScreener: total value, 24h change, allocation bar and a per-asset
  breakdown, auto-refreshing on an interval. A "preview demo portfolio" (with simulated
  P&L) is available as a fallback. See `src/lib/solana.ts`,
  `src/hooks/useWalletPortfolio.ts` and `src/components/Portfolio.tsx`.
- **Info pages** — standalone **About**, **Docs** and **Agent SDK** pages (in `public/`)
  that open in a new tab, styled to match the app.
- **Agent marketplace** — live grid of agent tokens with price, 24h change, market cap,
  volume, holders and animated sparkline charts.
- **Live prices** — prices, market caps and 24h change drift in real time to feel like a
  live trading terminal.
- **Filters & sort** — segmented `All / Sentient / Prototype` control, category chips
  (DeFAI, Trading, Gaming, …) and a sort menu (Trending, Market Cap, Top Gainers, Newest).
- **Search** — instant filtering by name, ticker or category.
- **Agent detail** — click any agent for a modal with full stats, chart and Buy/Sell actions.
- **LUFF Genesis launchpad** — live agent launches with funding progress bars, countdowns
  and a pledge flow.
- **Launch an Agent** — a multi-step form to fair-launch your own agent through Genesis.
- **Connect Wallet** — wallet selection modal (MetaMask, Coinbase, WalletConnect, Rabby)
  with a mock connected state.
- **Watchlist** — star agents to add them to your list.
- **Points** — LUFF Points balance and an earn CTA.
- **Fully responsive** — mobile drawer nav, adaptive grid, bottom-sheet modals on mobile.

> Wallet connections and trades are simulated (no real funds move), but the coin
> **market data and pump.fun launch feed are real and live** — fetched directly from
> public APIs in the browser, no backend or API key required.

## Live data sources

The live sections work entirely client-side:

- **DexScreener API** (`https://api.dexscreener.com`) — public, free, CORS-enabled.
  We pull trending / boosted / newly-profiled tokens, hydrate them with full pair
  data, and derive the New / Top / Gainers / Losers / Movers / Trending lists.
  See `src/lib/marketApi.ts` and `src/hooks/useLiveMarkets.ts`.
- **pump.fun via PumpPortal** (`wss://pumpportal.fun/api/data`) — a free WebSocket
  that broadcasts every new pump.fun token creation. We subscribe with
  `subscribeNewToken` and stream launches in as they happen.
  See `src/hooks/usePumpFeed.ts`.
- **Jupiter Plugin** (`https://plugin.jup.ag/plugin-v1.js`) — the embedded swap widget
  that powers real on-site buy/sell. It manages its own Solana wallet connection and
  on-chain execution. See `src/lib/jupiter.ts` and `src/components/CoinTradeModal.tsx`.
- **DexScreener chart embed** (`<pair-url>?embed=1&theme=dark`) — the live price chart
  shown inside the trade modal.

### Real trading — what you need to know

- Swaps are **real** and execute on-chain via Jupiter using the visitor's own Solana
  wallet (Phantom, Solflare, …) — the demo Connect button in the navbar is separate.
- Set **`VITE_SOLANA_RPC`** (copy `.env.example` → `.env`) to a dedicated RPC for
  reliable swaps; the public endpoint is rate-limited. See `.env.example`.
- Brand-new pump.fun coins may not be routable/chartable until they have DEX liquidity;
  the modal falls back to "Trade on Jupiter" / "DexScreener" links in that case.

If a feed can't be reached (e.g. offline, or inside a sandboxed preview whose
network egress is restricted), the board shows clearly-labelled **sample data** and
the launch feed shows an **offline** state — both switch to live automatically in a
normal browser.

## Tech stack

- [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 5](https://vite.dev)
- [Tailwind CSS 3](https://tailwindcss.com)
- [lucide-react](https://lucide.dev) icons

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build to /dist
npm run preview  # preview the production build
```

## Changing the logo

The logo lives at `public/logo.svg` and is referenced from the navbar, footer and favicon.
To use your own image:

1. Drop your file into `public/` (e.g. `public/logo.png`).
2. In `index.html`, `src/components/Navbar.tsx` and `src/components/Footer.tsx`,
   change `src="/logo.svg"` to `src="/logo.png"`.

That's it — the brand mark updates everywhere.

## Project structure

```
src/
├── App.tsx                # app shell + state (filters, modals, wallet, toasts)
├── data/agents.ts         # agent + Genesis mock data, sparkline generator
├── hooks/useLivePrices.ts # live price simulation
├── lib/format.ts          # USD / number / percent formatters
└── components/            # Navbar, Hero, StatsBar, FilterBar, AgentCard,
                           # GenesisSection, HowItWorks, modals, Footer, …
```
