import { useMemo, useState } from 'react'
import { RefreshCw, ExternalLink, TrendingUp } from 'lucide-react'
import { useLiveMarkets } from '../hooks/useLiveMarkets'
import type { Coin } from '../lib/marketApi'
import { FALLBACK_COINS } from '../data/fallbackCoins'
import { formatUSD, formatPrice, formatPct, formatAgo } from '../lib/format'
import CoinIcon from './CoinIcon'
import CoinTradeModal, { type TradeTarget } from './CoinTradeModal'

function coinToTarget(c: Coin): TradeTarget {
  return {
    mint: c.key,
    symbol: c.symbol,
    name: c.name,
    icon: c.icon,
    priceUsd: c.priceUsd,
    change24h: c.change24h,
    pairUrl: c.url,
  }
}

type Tab = 'new' | 'top' | 'gainers' | 'losers' | 'volume' | 'trending'

const TABS: { key: Tab; label: string }[] = [
  { key: 'new', label: 'New' },
  { key: 'top', label: 'Top' },
  { key: 'gainers', label: 'Top Gainers' },
  { key: 'losers', label: 'Losers' },
  { key: 'volume', label: 'Movers' },
  { key: 'trending', label: 'Trending' },
]

function sortFor(tab: Tab, coins: Coin[]): Coin[] {
  const c = [...coins]
  switch (tab) {
    case 'new':
      return c.sort((a, b) => b.pairCreatedAt - a.pairCreatedAt)
    case 'top':
      return c.sort((a, b) => b.marketCap - a.marketCap)
    case 'gainers':
      return c.filter((x) => x.change24h > 0).sort((a, b) => b.change24h - a.change24h)
    case 'losers':
      return c.filter((x) => x.change24h < 0).sort((a, b) => a.change24h - b.change24h)
    case 'volume':
      return c.sort((a, b) => b.volume24h - a.volume24h)
    case 'trending':
      return c.filter((x) => x.trending).sort((a, b) => b.volume24h - a.volume24h)
  }
}

export default function LiveMarkets() {
  const { coins, status, updatedAt, refresh } = useLiveMarkets()
  const [tab, setTab] = useState<Tab>('trending')
  const [tradeTarget, setTradeTarget] = useState<TradeTarget | null>(null)

  const isLive = status === 'live' && coins.length > 0
  const rows = useMemo(() => {
    const source = (isLive ? coins : FALLBACK_COINS).filter((c) => c.chainId === 'solana')
    return sortFor(tab, source).slice(0, 20)
  }, [tab, isLive, coins])

  return (
    <section id="markets" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-1 inline-flex items-center gap-1.5 text-sm font-medium text-luff-red">
            <TrendingUp className="h-4 w-4" />
            Live Markets
          </div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Real-time coin data</h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-luff-muted">
            Powered by
            <span className="font-medium text-luff-text">DexScreener</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-luff-border bg-white/[0.03] px-2 py-0.5 text-xs font-medium text-luff-text">
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded text-[9px] font-bold text-white" style={{ background: 'linear-gradient(135deg,#9945FF,#14F195)' }}>
                ◎
              </span>
              Solana
            </span>
            <StatusPill status={status} isLive={isLive} updatedAt={updatedAt} />
          </p>
        </div>
        <button
          onClick={refresh}
          className="btn-ghost flex items-center gap-2 text-sm"
          aria-label="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`chip transition-all ${
              tab === t.key
                ? 'border-luff-red/60 bg-luff-red/15 text-luff-text'
                : 'border-luff-border bg-white/[0.02] text-luff-muted hover:border-luff-red/30 hover:text-luff-text'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-luff-border bg-white/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-luff-border text-left text-xs text-luff-muted">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Token</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="hidden px-4 py-3 text-right font-medium sm:table-cell">1h</th>
                <th className="px-4 py-3 text-right font-medium">24h</th>
                <th className="hidden px-4 py-3 text-right font-medium md:table-cell">Volume 24h</th>
                <th className="px-4 py-3 text-right font-medium">
                  {tab === 'new' ? 'Age' : 'Market Cap'}
                </th>
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((c, i) => (
                <CoinRow
                  key={c.key}
                  coin={c}
                  rank={i + 1}
                  showAge={tab === 'new'}
                  onTrade={() => setTradeTarget(coinToTarget(c))}
                />
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-luff-muted">
                    No coins in this list right now.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!isLive && (
        <p className="mt-3 text-center text-xs text-luff-muted/70">
          Showing sample data — the live DexScreener feed loads automatically in your browser.
        </p>
      )}

      <CoinTradeModal target={tradeTarget} onClose={() => setTradeTarget(null)} />
    </section>
  )
}

function StatusPill({
  status,
  isLive,
  updatedAt,
}: {
  status: string
  isLive: boolean
  updatedAt: number | null
}) {
  if (isLive) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-luff-up/40 bg-luff-up/10 px-2 py-0.5 text-xs font-medium text-luff-up">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-luff-up/70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-luff-up" />
        </span>
        LIVE{updatedAt ? ` · ${formatAgo(updatedAt)}` : ''}
      </span>
    )
  }
  if (status === 'loading') {
    return <span className="text-xs text-luff-muted">connecting…</span>
  }
  return (
    <span className="rounded-full border border-luff-ember/40 bg-luff-ember/10 px-2 py-0.5 text-xs font-medium text-luff-ember">
      sample data
    </span>
  )
}

function CoinRow({
  coin,
  rank,
  showAge,
  onTrade,
}: {
  coin: Coin
  rank: number
  showAge: boolean
  onTrade: () => void
}) {
  const up = coin.change24h >= 0
  const up1h = coin.change1h >= 0
  return (
    <tr className="border-b border-luff-border/60 transition-colors last:border-0 hover:bg-white/[0.03]">
      <td className="px-4 py-3 text-luff-muted">{rank}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <CoinIcon icon={coin.icon} symbol={coin.symbol} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold">{coin.symbol}</span>
              {coin.trending && <span className="text-xs">🔥</span>}
            </div>
            <div className="max-w-[160px] truncate text-xs text-luff-muted">{coin.name}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-right font-medium tabular-nums">{formatPrice(coin.priceUsd)}</td>
      <td
        className={`hidden px-4 py-3 text-right font-medium tabular-nums sm:table-cell ${
          up1h ? 'text-luff-up' : 'text-luff-down'
        }`}
      >
        {formatPct(coin.change1h)}
      </td>
      <td className={`px-4 py-3 text-right font-semibold tabular-nums ${up ? 'text-luff-up' : 'text-luff-down'}`}>
        {formatPct(coin.change24h)}
      </td>
      <td className="hidden px-4 py-3 text-right tabular-nums md:table-cell">{formatUSD(coin.volume24h)}</td>
      <td className="px-4 py-3 text-right tabular-nums">
        {showAge ? (coin.pairCreatedAt ? formatAgo(coin.pairCreatedAt) : '—') : formatUSD(coin.marketCap)}
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={onTrade}
            className="rounded-full bg-red-grad px-3.5 py-1.5 text-xs font-semibold text-white shadow-glow-sm transition-all hover:brightness-110 active:scale-95"
          >
            Trade
          </button>
          <a
            href={coin.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-lg p-1.5 text-luff-muted transition-colors hover:text-luff-red"
            aria-label="Open on DexScreener"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </td>
    </tr>
  )
}
