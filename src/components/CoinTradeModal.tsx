import { useEffect, useState } from 'react'
import { ExternalLink, ArrowLeftRight, TriangleAlert } from 'lucide-react'
import Modal from './Modal'
import CoinIcon from './CoinIcon'
import { loadJupiter, SOL_MINT, RPC_ENDPOINT } from '../lib/jupiter'
import { formatPrice, formatPct } from '../lib/format'

export interface TradeTarget {
  mint: string
  symbol: string
  name: string
  icon: string | null
  priceUsd?: number
  change24h?: number
  pairUrl?: string
}

interface CoinTradeModalProps {
  target: TradeTarget | null
  onClose: () => void
}

const JUP_ID = 'luff-jup-terminal'
type Side = 'buy' | 'sell'
type JupState = 'loading' | 'ready' | 'error'

export default function CoinTradeModal({ target, onClose }: CoinTradeModalProps) {
  const [side, setSide] = useState<Side>('buy')
  const [jup, setJup] = useState<JupState>('loading')

  useEffect(() => {
    if (!target) return
    let cancelled = false
    setJup('loading')

    loadJupiter()
      .then(() => {
        if (cancelled || !window.Jupiter) return
        try {
          window.Jupiter.close?.()
        } catch {
          /* ignore */
        }
        window.Jupiter.init({
          displayMode: 'integrated',
          integratedTargetId: JUP_ID,
          endpoint: RPC_ENDPOINT,
          strictTokenList: false,
          defaultExplorer: 'Solscan',
          formProps: {
            initialInputMint: side === 'buy' ? SOL_MINT : target.mint,
            initialOutputMint: side === 'buy' ? target.mint : SOL_MINT,
          },
        })
        setJup('ready')
      })
      .catch(() => {
        if (!cancelled) setJup('error')
      })

    return () => {
      cancelled = true
      try {
        window.Jupiter?.close?.()
      } catch {
        /* ignore */
      }
    }
  }, [target, side])

  if (!target) return null

  const up = (target.change24h ?? 0) >= 0
  const chartSrc = target.pairUrl
    ? `${target.pairUrl}?embed=1&theme=dark&trades=0&info=0`
    : null
  const jupSwapUrl =
    side === 'buy'
      ? `https://jup.ag/swap/SOL-${target.mint}`
      : `https://jup.ag/swap/${target.mint}-SOL`

  return (
    <Modal open={!!target} onClose={onClose} maxWidth="max-w-4xl">
      <div className="max-h-[82vh] overflow-y-auto pr-0.5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <CoinIcon icon={target.icon} symbol={target.symbol} size={48} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold">{target.symbol}</h2>
              <span className="chip border-luff-red/40 bg-luff-red/10 text-luff-red">◎ Solana</span>
            </div>
            <div className="truncate text-sm text-luff-muted">{target.name}</div>
          </div>
          {target.priceUsd != null && (
            <div className="ml-auto mr-8 text-right">
              <div className="font-display text-lg font-bold">{formatPrice(target.priceUsd)}</div>
              {target.change24h != null && (
                <div className={`text-sm font-semibold ${up ? 'text-luff-up' : 'text-luff-down'}`}>
                  {formatPct(target.change24h)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Body: chart + trade */}
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          {/* Live chart */}
          <div className="h-[300px] overflow-hidden rounded-2xl border border-luff-border bg-luff-bg lg:h-[520px]">
            {chartSrc ? (
              <iframe
                title={`${target.symbol} chart`}
                src={chartSrc}
                className="h-full w-full"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-sm text-luff-muted">
                <TriangleAlert className="h-6 w-6 text-luff-ember" />
                Live chart appears once this coin has a DEX trading pair.
              </div>
            )}
          </div>

          {/* Trade panel */}
          <div className="flex flex-col">
            {/* Buy / Sell toggle */}
            <div className="mb-3 inline-flex rounded-full border border-luff-border bg-white/[0.03] p-1">
              <button
                onClick={() => setSide('buy')}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  side === 'buy' ? 'bg-luff-up/90 text-black' : 'text-luff-muted hover:text-luff-text'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setSide('sell')}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  side === 'sell' ? 'bg-luff-down text-white' : 'text-luff-muted hover:text-luff-text'
                }`}
              >
                Sell
              </button>
            </div>

            {/* Jupiter terminal */}
            <div className="relative min-h-[420px] flex-1 overflow-hidden rounded-2xl border border-luff-border bg-white/[0.02]">
              <div id={JUP_ID} className="h-full min-h-[420px] w-full" />
              {jup !== 'ready' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                  {jup === 'loading' ? (
                    <>
                      <ArrowLeftRight className="h-6 w-6 animate-pulse text-luff-red" />
                      <p className="text-sm text-luff-muted">Loading Jupiter swap…</p>
                    </>
                  ) : (
                    <>
                      <TriangleAlert className="h-6 w-6 text-luff-ember" />
                      <p className="text-sm text-luff-muted">
                        In-page swap couldn’t load here.
                        <br />
                        Use the button below to trade on Jupiter.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Fallback / external actions */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <a href={jupSwapUrl} target="_blank" rel="noreferrer" className="btn-primary flex items-center justify-center gap-1.5 text-sm">
                Trade on Jupiter
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <a
                href={target.pairUrl || `https://dexscreener.com/solana/${target.mint}`}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost flex items-center justify-center gap-1.5 text-sm"
              >
                DexScreener
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <p className="mt-3 text-center text-[11px] leading-relaxed text-luff-muted/70">
              Swaps execute on-chain via Jupiter using your own Solana wallet. Set a dedicated RPC
              (VITE_SOLANA_RPC) for best reliability. Always verify the token mint before trading.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  )
}
