import { LogIn, TrendingUp, PieChart, RefreshCw, TriangleAlert } from 'lucide-react'
import { useLuffWallet } from '../wallet/wallet'
import { useWalletPortfolio } from '../hooks/useWalletPortfolio'
import { formatUSD, formatPrice, formatPct, formatNumber } from '../lib/format'
import CoinIcon from './CoinIcon'

export default function Portfolio() {
  const w = useLuffWallet()
  const port = useWalletPortfolio(w.authenticated ? w.address : null, w.connection.rpcEndpoint)

  return (
    <section id="portfolio" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3" data-reveal>
        <div>
          <div className="mb-1 inline-flex items-center gap-1.5 text-sm font-medium text-luff-red">
            <PieChart className="h-4 w-4" />
            Portfolio
          </div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Your assets, live</h2>
          <p className="mt-1 text-sm text-luff-muted">Your SOL balance and the coins you hold, in real time.</p>
        </div>
        {w.authenticated && (
          <button
            onClick={() => {
              void w.refresh()
              void port.refresh()
            }}
            className="btn-ghost flex items-center gap-1.5 text-sm"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        )}
      </div>

      {!w.enabled ? (
        <Notice>
          Managed wallets are not configured. Set <code className="mx-1 rounded bg-white/10 px-1">VITE_PRIVY_APP_ID</code>
          to enable login and per-user wallets.
        </Notice>
      ) : !w.authenticated ? (
        <div className="glass flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-luff-red/10 text-luff-red">
            <PieChart className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-bold">Log in to see your portfolio</h3>
          <p className="mt-1 max-w-sm text-sm text-luff-muted">
            Sign in with Google or X to get your wallet and track your SOL and coins in real time.
          </p>
          <button onClick={w.login} className="btn-primary mt-5 flex items-center gap-2">
            <LogIn className="h-4 w-4" /> Log in
          </button>
        </div>
      ) : (
        <LiveView port={port} solBalance={w.balance} />
      )}
    </section>
  )
}

function LiveView({
  port,
  solBalance,
}: {
  port: ReturnType<typeof useWalletPortfolio>
  solBalance: number | null
}) {
  const { positions, status, totalValue, dayChange } = port
  const priced = positions.filter((p) => p.priced)
  const hiddenCount = positions.length - priced.length

  if (status === 'loading' && positions.length === 0) {
    return (
      <div className="glass flex flex-col items-center justify-center rounded-2xl py-16 text-center">
        <RefreshCw className="h-6 w-6 animate-spin text-luff-red" />
        <p className="mt-3 text-sm text-luff-muted">Loading your holdings…</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Total Value" value={formatUSD(totalValue)} />
        <Tile label="SOL Balance" value={solBalance != null ? `${solBalance.toFixed(3)} SOL` : '—'} />
        <Tile label="24h Change" value={formatPct(dayChange)} positive={dayChange >= 0} />
        <Tile label="Tokens" value={`${priced.length}`} />
      </div>

      {status === 'error' && positions.length === 0 && (
        <div className="mt-4 rounded-xl border border-luff-ember/40 bg-luff-ember/10 px-4 py-2.5 text-center text-xs text-luff-ember">
          Couldn’t reach the RPC to read holdings — set a dedicated VITE_SOLANA_RPC for reliable reads.
        </div>
      )}

      {status === 'empty' && (
        <div className="glass mt-4 flex flex-col items-center justify-center rounded-2xl py-14 text-center">
          <PieChart className="h-6 w-6 text-luff-muted" />
          <p className="mt-3 text-sm text-luff-muted">No coins yet — deposit SOL and start sniping.</p>
        </div>
      )}

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

      {priced.length > 0 && (
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
      )}

      {hiddenCount > 0 && (
        <p className="mt-3 text-center text-xs text-luff-muted/70">
          +{hiddenCount} token{hiddenCount > 1 ? 's' : ''} with no market price hidden.
        </p>
      )}
    </>
  )
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass flex items-center justify-center gap-2 rounded-2xl px-6 py-12 text-center text-sm text-luff-muted">
      <TriangleAlert className="h-4 w-4 shrink-0 text-luff-ember" />
      <span>{children}</span>
    </div>
  )
}

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

function Tile({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  const color = positive === undefined ? '' : positive ? 'text-luff-up' : 'text-luff-down'
  return (
    <div className="rounded-2xl border border-luff-border bg-white/[0.02] p-4">
      <div className="text-xs text-luff-muted">{label}</div>
      <div className={`mt-1 font-display text-xl font-bold ${color}`}>{value}</div>
    </div>
  )
}
