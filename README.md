# LUFF AGENT

**The agentic economy — powered red.** A launchpad and marketplace for tokenized AI agents,
inspired by the Virtuals app experience and rebuilt with a full red theme and the LUFF brand.

![LUFF AGENT](public/logo.svg)

## Features / Tools

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

> This is a front-end demo — wallet connections and trades are simulated, no real funds move.

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
