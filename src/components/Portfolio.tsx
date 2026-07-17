import { useEffect, useMemo, useState } from 'react'
import {
  Wallet,
  TrendingUp,
  PieChart,
  RefreshCw,
  LogOut,
  Search,
  TriangleAlert,
} from 'lucide-react'
import { holdingsSeed, type Holding } from '../data/portfolio'
import { useWalletPortfolio } from '../hooks/useWalletPortfolio'
import { connectPhantom, isValidSolAddress } from '../lib/solana'
import { RPC_ENDPOINT } from '../lib/jupiter'
import { formatUSD, formatPrice, formatPct, formatNumber, formatAgo, shortAddress } from '../lib/format'
import CoinIcon from './CoinIcon'
import AgentAvatar from './AgentAvatar'

type Mode = 'connect' | 'live' | 'demo'

export default function Portfolio() {
  const [mode, setMode] = useState<Mode>('connect')
  const [address, setAddress] = useState<string | null>(null)
  const [addrInput, setAddrInput] = useState('')
  const [connectErr, setConnectErr] = useState<string | null>(null)

  const wallet = useWalletPortfolio(mode === 'live' ? address : null, RPC_ENDPOINT)

  const onPhantom = async () => {
    setConnectErr(null)
    try {
      const a = await connectPhantom()
      setAddress(a)
      setMode('live')
    } catch (e) {
      setConnectErr(e instanceof Error ? e.message : 'Could not connect Phantom')
    }
  }

  const onView = () => {
    const a = addrInput.trim()
    if (!isValidSolAddress(a)) {
      setConnectErr('Enter a valid Solana wallet address')
      return
    }
    setConnectErr(null)
    setAddress(a)
    setMode('live')
  }

  const disconnect = () => {
    setAddress(null)
    setAddrInput('')
    setConnectErr(null)
    setMode('connect')
  }

  return (
    <section id="portfolio" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3" data-reveal>
        <div>
          <div className="mb-1 inline-flex items-center gap-1.5 text-sm font-medium text-luff-red">
            <PieChart className="h-4 w-4" />
            Portfolio
          </div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Your assets, live</h2>
          <p className="mt-1 text-sm text-luff-muted">
            {mode === 'live'
              ? 'Live on-chain holdings, priced in real time.'
              : 'The coins and agents you hold, valued in real time.'}
          </p>
        </div>
        {mode !== 'connect' && (
          <div className="flex items-center gap-2">
            {mode === 'live' && (
              <>
                <span className="rounded-full border border-luff-border bg-white/[0.03] px-3 py-1.5 font-mono text-xs">
                  {address ? shortAddress(address) : ''}
                </span>
                <button onClick={wallet.refresh} className="btn-ghost flex items-center gap-1.5 text-sm" aria-label="Refresh">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </>
            )}
            <button onClick={disconnect} className="btn-ghost flex items-center gap-1.5 text-sm">
              <LogOut className="h-4 w-4" />
              {mode === 'live' ? 'Disconnect' : 'Exit demo'}
            </button>
          </div>
        )}
      </div>

      {mode === 'connect' && (
        <ConnectPanel
          addrInput={addrInput}
          onAddrInput={setAddrInput}
          onPhantom={onPhantom}
          onView={onView}
          onDemo={() => {
            setConnectErr(null)
            setMode('demo')
          }}
          error={connectErr}
        />
      )}

      {mode === 'live' && <LiveView wallet={wallet} />}
      {mode === 'demo' && <DemoView />}
    </section>
  )
}

/* ------------------------------- Connect ------------------------------- */

function ConnectPanel({
  addrInput,
  onAddrInput,
  onPhantom,
  onView,
  onDemo,
  error,
}: {
  addrInput: string
  onAddrInput: (v: string) => void
  onPhantom: () => void
  onView: () => void
  onDemo: () => void
  error: string | null
}) {
  return (
    <div className="glass mx-auto max-w-xl rounded-2xl px-6 py-10 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-luff-red/10 text-luff-red">
        <Wallet className="h-6 w-6" />
      </div>
      <h3 className="font-display text-lg font-bold">Track your Solana wallet</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-luff-muted">
        Connect Phantom or paste any address to see its live holdings and value.
      </p>

      <button onClick={onPhantom} className="btn-primary mx-auto mt-5 flex items-center gap-2">
        <Wallet className="h-4 w-4" />
        Connect Phantom
      </button>

      <div className="mx-auto mt-5 flex max-w-sm items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-luff-muted" />
          <input
            value={addrInput}
            onChange={(e) => onAddrInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onView()}
            placeholder="Paste a Solana address…"
            className="w-full rounded-full border border-luff-border bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-luff-red/50"
          />
        </div>
        <button onClick={onView} className="btn-ghost text-sm">
          View
        </button>
      </div>

      {error && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-luff-down">
          <TriangleAlert className="h-4 w-4" />
          {error}
        </p>
      )}

      <button onClick={onDemo} className="mt-6 text-xs text-luff-muted underline-offset-2 hover:text-luff-red hover:underline">
        or preview a demo portfolio
      </button>
    </div>
  )
}

/* -------------------------------- Live -------------------------------- */

function LiveView({ wallet }: { wallet: ReturnType<typeof useWalletPortfolio> }) {
  const { positions, status, updatedAt, error, totalValue, dayChange } = wallet
  const priced = positions.filter((p) => p.priced)
  const hiddenCount = positions.length - priced.length

  if (status === 'loading' && positions.length === 0) {
    return (
      <div className="glass flex flex-col items-center justify-center rounded-2xl py-16 text-center">
        <RefreshCw className="h-6 w-6 animate-spin text-luff-red" />
        <p className="mt-3 text-sm text-luff-muted">Loading wallet holdings…</p>
      </div>
    )
  }

  if (status === 'error' && positions.length === 0) {
    return (
      <div className="glass flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
        <TriangleAlert className="h-6 w-6 text-luff-ember" />
        <p className="mt-3 text-sm text-luff-muted">Couldn’t load this wallet.</p>
        <p className="mt-1 max-w-md text-xs text-luff-muted/70">
          {error} — set a dedicated RPC via VITE_SOLANA_RPC for reliable reads.
        </p>
        <button onClick={wallet.refresh} className="btn-ghost mt-4 text-sm">
          Retry
        </button>
      </div>
    )
  }

  if (status === 'empty') {
    return (
      <div className="glass flex flex-col items-center justify-center rounded-2xl py-16 text-center">
        <PieChart className="h-6 w-6 text-luff-muted" />
        <p className="mt-3 text-sm text-luff-muted">No tokens found in this wallet.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Total Value" value={formatUSD(totalValue)} />
        <Tile label="24h Change" value={formatPct(dayChange)} positive={dayChange >= 0} />
        <Tile label="Tokens" value={`${priced.length}`} />
        <Tile label="Updated" value={updatedAt ? formatAgo(updatedAt) : '—'} />
      </div>

      {priced.length > 0 && totalValue > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs text-luff-muted">
            <TrendingUp className="h-3.5 w-3.5" /> Allocation
          </div>
          <div className="flex h-3 overflow-hidden rounded-full border border-luff-border">
            {priced.slice(0, 12).map((p) => (
              <div
                key={p.mint}
                title={`${p.symbol} · ${((p.value / totalValue) * 100).toFixed(1)}%`}
                style={{ width: `${(p.value / totalValue) * 100}%`, background: gradientFor(p.symbol) }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 overflow-hidden rounded-2xl border border-luff-border bg-white/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-luff-border text-left text-xs text-luff-muted">
                <th className="px-4 py-3 font-medium">Asset</th>
                <th className="px-4 py-3 text-right font-medium">Balance</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="hidden px-4 py-3 text-right font-medium sm:table-cell">24h</th>
                <th className="px-4 py-3 text-right font-medium">Value</th>
                <th className="hidden px-4 py-3 text-right font-medium sm:table-cell">Share</th>
              </tr>
            </thead>
            <tbody>
              {priced.map((p) => {
                const up = p.change24h >= 0
                return (
                  <tr key={p.mint} className="border-b border-luff-border/60 transition-colors last:border-0 hover:bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <CoinIcon icon={p.icon} symbol={p.symbol} size={36} />
                        <div className="min-w-0">
                          <div className="font-semibold">{p.symbol}</div>
                          <div className="max-w-[160px] truncate text-xs text-luff-muted">{p.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatNumber(p.amount)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatPrice(p.price)}</td>
                    <td className={`hidden px-4 py-3 text-right font-medium tabular-nums sm:table-cell ${up ? 'text-luff-up' : 'text-luff-down'}`}>
                      {formatPct(p.change24h)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatUSD(p.value)}</td>
                    <td className="hidden px-4 py-3 text-right tabular-nums text-luff-muted sm:table-cell">
                      {totalValue > 0 ? `${((p.value / totalValue) * 100).toFixed(1)}%` : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {priced.length === 0 && (
        <p className="mt-4 text-center text-sm text-luff-muted">
          Holdings found, but none have a market price on DexScreener.
        </p>
      )}
      {hiddenCount > 0 && (
        <p className="mt-3 text-center text-xs text-luff-muted/70">
          +{hiddenCount} token{hiddenCount > 1 ? 's' : ''} with no market price hidden.
        </p>
      )}
    </>
  )
}

/* -------------------------------- Demo -------------------------------- */

function DemoView() {
  const [holdings, setHoldings] = useState<Holding[]>(holdingsSeed)

  useEffect(() => {
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
  }, [])

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
    () => [...holdings].map((h) => ({ ...h, value: h.amount * h.price })).sort((a, b) => b.value - a.value),
    [holdings],
  )

  return (
    <>
      <div className="mb-4 rounded-xl border border-luff-ember/40 bg-luff-ember/10 px-4 py-2.5 text-center text-xs text-luff-ember">
        Demo — simulated holdings with live-updating prices. Connect a wallet above for real data.
      </div>

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
    </>
  )
}

/* ------------------------------- Shared ------------------------------- */

const GRADS = [
  'linear-gradient(135deg,#FF2E3E,#FF6A3D)',
  'linear-gradient(135deg,#FF3B6B,#FF2E3E)',
  'linear-gradient(135deg,#C81E3A,#FF3B6B)',
  'linear-gradient(135deg,#FF6A3D,#FFB03A)',
  'linear-gradient(135deg,#9945FF,#14F195)',
  'linear-gradient(135deg,#E01029,#FF6A3D)',
]
function gradientFor(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 997
  return GRADS[h % GRADS.length]
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
