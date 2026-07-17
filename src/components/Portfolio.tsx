import { useEffect, useMemo, useState } from 'react'
import { Wallet, TrendingUp, PieChart, Lock } from 'lucide-react'
import { holdingsSeed, type Holding } from '../data/portfolio'
import { formatUSD, formatPrice, formatPct, formatNumber } from '../lib/format'
import AgentAvatar from './AgentAvatar'

interface PortfolioProps {
  connected: string | null
  onConnect: () => void
}

export default function Portfolio({ connected, onConnect }: PortfolioProps) {
  const [holdings, setHoldings] = useState<Holding[]>(holdingsSeed)

  // Live price simulation — makes the portfolio value tick in real time.
  useEffect(() => {
    if (!connected) return
    const t = setInterval(() => {
      setHoldings((prev) =>
        prev.map((h) => {
          const w = (Math.random() - 0.48) * 0.01
          const price = Math.max(0.000001, h.price * (1 + w))
          return { ...h, price, change24h: +(h.change24h + w * 100).toFixed(2) }
        }),
      )
    }, 2500)
    return () => clearInterval(t)
  }, [connected])

  const totals = useMemo(() => {
    const value = holdings.reduce((s, h) => s + h.amount * h.price, 0)
    const cost = holdings.reduce((s, h) => s + h.amount * h.avgPrice, 0)
    const pnl = value - cost
    const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0
    const dayValue = holdings.reduce((s, h) => s + h.amount * h.price * (h.change24h / 100), 0)
    const dayPct = value > 0 ? (dayValue / value) * 100 : 0
    return { value, pnl, pnlPct, dayPct }
  }, [holdings])

  const rows = useMemo(
    () =>
      [...holdings]
        .map((h) => ({ ...h, value: h.amount * h.price }))
        .sort((a, b) => b.value - a.value),
    [holdings],
  )

  return (
    <section id="portfolio" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="mb-6">
        <div className="mb-1 inline-flex items-center gap-1.5 text-sm font-medium text-luff-red">
          <PieChart className="h-4 w-4" />
          Portfolio
        </div>
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Your assets, live</h2>
        <p className="mt-1 text-sm text-luff-muted">
          The coins and agents you hold, valued in real time.
        </p>
      </div>

      {!connected ? (
        <div className="glass flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-luff-red/10 text-luff-red">
            <Lock className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-bold">Connect your wallet</h3>
          <p className="mt-1 max-w-sm text-sm text-luff-muted">
            Connect to see the assets and coins you hold and track their value in real time.
          </p>
          <button onClick={onConnect} className="btn-primary mt-5 flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </button>
        </div>
      ) : (
        <>
          {/* Summary tiles */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Tile label="Total Value" value={formatUSD(totals.value)} />
            <Tile
              label="All-time P&L"
              value={`${totals.pnl >= 0 ? '+' : '-'}${formatUSD(Math.abs(totals.pnl))}`}
              sub={formatPct(totals.pnlPct)}
              positive={totals.pnl >= 0}
            />
            <Tile label="24h Change" value={formatPct(totals.dayPct)} positive={totals.dayPct >= 0} />
            <Tile label="Assets" value={`${holdings.length}`} />
          </div>

          {/* Allocation bar */}
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-1.5 text-xs text-luff-muted">
              <TrendingUp className="h-3.5 w-3.5" /> Allocation
            </div>
            <div className="flex h-3 overflow-hidden rounded-full border border-luff-border">
              {rows.map((h) => (
                <div
                  key={h.id}
                  title={`${h.symbol} · ${((h.value / totals.value) * 100).toFixed(1)}%`}
                  style={{ width: `${(h.value / totals.value) * 100}%`, background: h.gradient }}
                />
              ))}
            </div>
          </div>

          {/* Holdings table */}
          <div className="mt-5 overflow-hidden rounded-2xl border border-luff-border bg-white/[0.02]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-luff-border text-left text-xs text-luff-muted">
                    <th className="px-4 py-3 font-medium">Asset</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                    <th className="hidden px-4 py-3 text-right font-medium sm:table-cell">Avg Cost</th>
                    <th className="px-4 py-3 text-right font-medium">Price</th>
                    <th className="px-4 py-3 text-right font-medium">24h</th>
                    <th className="px-4 py-3 text-right font-medium">Value</th>
                    <th className="px-4 py-3 text-right font-medium">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((h) => {
                    const value = h.amount * h.price
                    const cost = h.amount * h.avgPrice
                    const pnl = value - cost
                    const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0
                    const up = h.change24h >= 0
                    return (
                      <tr key={h.id} className="border-b border-luff-border/60 transition-colors last:border-0 hover:bg-white/[0.03]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <AgentAvatar gradient={h.gradient} glyph={h.glyph} size={38} />
                            <div>
                              <div className="font-semibold">{h.symbol}</div>
                              <div className="text-xs text-luff-muted">{h.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">{formatNumber(h.amount)}</td>
                        <td className="hidden px-4 py-3 text-right tabular-nums sm:table-cell">{formatPrice(h.avgPrice)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{formatPrice(h.price)}</td>
                        <td className={`px-4 py-3 text-right font-medium tabular-nums ${up ? 'text-luff-up' : 'text-luff-down'}`}>
                          {formatPct(h.change24h)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatUSD(value)}</td>
                        <td className={`px-4 py-3 text-right font-semibold tabular-nums ${pnl >= 0 ? 'text-luff-up' : 'text-luff-down'}`}>
                          {pnl >= 0 ? '+' : '-'}
                          {formatUSD(Math.abs(pnl))}
                          <div className="text-xs font-normal opacity-80">{formatPct(pnlPct)}</div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-luff-muted/70">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-luff-up/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-luff-up" />
            </span>
            Live demo portfolio — prices update in real time. Connect a real wallet on-chain to track
            your actual holdings.
          </p>
        </>
      )}
    </section>
  )
}

function Tile({
  label,
  value,
  sub,
  positive,
}: {
  label: string
  value: string
  sub?: string
  positive?: boolean
}) {
  const color = positive === undefined ? '' : positive ? 'text-luff-up' : 'text-luff-down'
  return (
    <div className="rounded-2xl border border-luff-border bg-white/[0.02] p-4">
      <div className="text-xs text-luff-muted">{label}</div>
      <div className={`mt-1 font-display text-xl font-bold ${color}`}>{value}</div>
      {sub && <div className={`text-xs font-medium ${color}`}>{sub}</div>}
    </div>
  )
}
