import { useState } from 'react'
import { Zap, ExternalLink, Radio } from 'lucide-react'
import { type PumpStatus, type PumpToken } from '../hooks/usePumpFeed'
import { formatAgo } from '../lib/format'
import CoinIcon from './CoinIcon'
import CoinTradeModal, { type TradeTarget } from './CoinTradeModal'

function pumpToTarget(t: PumpToken): TradeTarget {
  return { mint: t.mint, symbol: t.symbol, name: t.name, icon: t.image ?? null }
}

interface PumpLiveFeedProps {
  tokens: PumpToken[]
  status: PumpStatus
}

export default function PumpLiveFeed({ tokens, status }: PumpLiveFeedProps) {
  const [tradeTarget, setTradeTarget] = useState<TradeTarget | null>(null)

  return (
    <section id="launches" className="mx-auto max-w-7xl px-4 pb-2 sm:px-6">
      <div className="glass overflow-hidden rounded-2xl" data-reveal>
        {/* header */}
        <div className="flex items-center justify-between border-b border-luff-border px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-grad shadow-glow-sm">
              <Zap className="h-4 w-4 text-white" />
            </span>
            <div>
              <div className="flex items-center gap-2 font-semibold">
                pump.fun
                <span className="text-luff-muted">·</span>
                <span className="text-luff-text">Live Launches</span>
              </div>
              <div className="text-xs text-luff-muted">New coins stream in the instant they mint</div>
            </div>
          </div>
          <FeedStatus status={status} />
        </div>

        {/* stream */}
        {tokens.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-luff-muted">
            {status === 'error' ? (
              <>
                Live launch feed is unavailable here.
                <br />
                <span className="text-xs text-luff-muted/70">
                  It connects automatically to pump.fun (via PumpPortal) in your browser.
                </span>
              </>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Radio className="h-4 w-4 animate-pulse text-luff-red" />
                Waiting for the next launch…
              </span>
            )}
          </div>
        ) : (
          <ul className="max-h-[360px] divide-y divide-luff-border/60 overflow-y-auto">
            {tokens.map((t, i) => (
              <li
                key={t.mint}
                className={`flex items-center gap-3 px-4 py-3 sm:px-5 ${i === 0 ? 'flash-in' : ''}`}
              >
                <CoinIcon icon={t.image ?? null} symbol={t.symbol} size={38} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold">{t.symbol}</span>
                    <span className="truncate text-xs text-luff-muted">{t.name}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-luff-muted">
                    <span className="text-luff-up">● new</span>
                    <span>{formatAgo(t.createdAt)}</span>
                    {t.marketCapSol > 0 && (
                      <>
                        <span>·</span>
                        <span>{t.marketCapSol.toFixed(1)} SOL mcap</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => setTradeTarget(pumpToTarget(t))}
                    className="rounded-full bg-red-grad px-3 py-1 text-xs font-semibold text-white shadow-glow-sm transition-all hover:brightness-110 active:scale-95"
                  >
                    Trade
                  </button>
                  <a
                    href={`https://pump.fun/coin/${t.mint}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-luff-border px-2.5 py-1 text-xs text-luff-muted transition-colors hover:border-luff-red/50 hover:text-luff-red"
                  >
                    View
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <CoinTradeModal target={tradeTarget} onClose={() => setTradeTarget(null)} />
    </section>
  )
}

function FeedStatus({ status }: { status: PumpStatus }) {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-luff-red/40 bg-luff-red/10 px-2.5 py-1 text-xs font-medium text-luff-red">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-luff-red/70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-luff-red" />
        </span>
        LIVE
      </span>
    )
  }
  if (status === 'connecting') {
    return <span className="text-xs text-luff-muted">connecting…</span>
  }
  return (
    <span className="rounded-full border border-luff-ember/40 bg-luff-ember/10 px-2.5 py-1 text-xs font-medium text-luff-ember">
      offline
    </span>
  )
}
