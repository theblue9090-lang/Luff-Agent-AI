import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PumpToken } from './usePumpFeed'

export interface SniperConfig {
  mode: 'new' | 'dev'
  devAddress: string
  buySol: number
  takeProfit: number // %
  stopLoss: number // %
  trailing: boolean
  maxSlippage: number // %
  priorityFee: number // SOL
  minMcapSol: number
  maxMcapSol: number
  autoSell: boolean
  live: boolean
}

export const defaultConfig: SniperConfig = {
  mode: 'new',
  devAddress: '',
  buySol: 0.5,
  takeProfit: 60,
  stopLoss: 25,
  trailing: false,
  maxSlippage: 15,
  priorityFee: 0.001,
  minMcapSol: 0,
  maxMcapSol: 500,
  autoSell: true,
  live: false,
}

export type ExitReason = 'TP' | 'SL' | 'Trail' | 'Manual'

export interface Position {
  id: string
  mint: string
  symbol: string
  name: string
  amountSol: number
  entry: number
  price: number
  peak: number
  openedAt: number
  status: 'open' | 'closed'
  exitReason?: ExitReason
  pnlPct?: number
  pnlSol?: number
  closedAt?: number
}

export interface LogEntry {
  id: string
  ts: number
  kind: 'buy' | 'sell' | 'skip' | 'info'
  text: string
}

let counter = 0
const uid = () => `${Date.now().toString(36)}-${counter++}`
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const randAddr = () => Array.from({ length: 44 }, () => B58[Math.floor(Math.random() * B58.length)]).join('')
const SYMS = ['PEPE', 'DOGE', 'WIF', 'BONK', 'SLERF', 'MOON', 'CHAD', 'WOJAK', 'FLOKI', 'MEW', 'POPCAT', 'GIGA', 'SIGMA', 'APU', 'PYRE', 'BLAZE', 'RONIN', 'MAGMA', 'EMBER', 'SCRLT']
const NAMES = ['Pepe', 'Doge', 'Wif', 'Bonk', 'Moon', 'Chad', 'Cat', 'Giga', 'Sigma', 'Rocket', 'Ember', 'Blaze', 'Pyre', 'Scarlet', 'Crimson', 'Ronin', 'Magma', 'Inferno', 'Phoenix', 'Vermilion']
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)]

/**
 * Real-time sniper engine. When running, it snipes matching launches from the
 * live pump.fun feed (and, in simulation, from synthetic launches) — opening
 * positions automatically and closing them on TP / SL / trailing rules with no
 * manual step. Outcomes are simulated so strategies can be battle-tested safely.
 */
export function useSniperBot(running: boolean, config: SniperConfig, feedTokens: PumpToken[]) {
  const [positions, setPositions] = useState<Position[]>([])
  const [log, setLog] = useState<LogEntry[]>([])

  const cfg = useRef(config)
  cfg.current = config
  const isRunning = useRef(running)
  isRunning.current = running
  const processed = useRef<Set<string>>(new Set())
  const startedAt = useRef(0)

  const addLog = useCallback((kind: LogEntry['kind'], text: string) => {
    setLog((prev) => [{ id: uid(), ts: Date.now(), kind, text }, ...prev].slice(0, 80))
  }, [])

  const tryBuy = useCallback(
    (t: { mint: string; symbol: string; name: string; marketCapSol: number; creator?: string }) => {
      const c = cfg.current
      if (!isRunning.current || processed.current.has(t.mint)) return

      if (c.mode === 'dev' && (!c.devAddress || t.creator !== c.devAddress)) return

      if (t.marketCapSol < c.minMcapSol || t.marketCapSol > c.maxMcapSol) {
        processed.current.add(t.mint)
        addLog('skip', `Skipped ${t.symbol} — ${t.marketCapSol.toFixed(1)} SOL mcap out of range`)
        return
      }

      processed.current.add(t.mint)
      const pos: Position = {
        id: uid(),
        mint: t.mint,
        symbol: t.symbol,
        name: t.name,
        amountSol: c.buySol,
        entry: 1,
        price: 1,
        peak: 1,
        openedAt: Date.now(),
        status: 'open',
      }
      setPositions((prev) => [pos, ...prev].slice(0, 50))
      addLog(
        'buy',
        `${c.mode === 'dev' ? 'Dev-sniped' : 'Sniped'} ${t.symbol} — bought ${c.buySol} SOL @ ${t.marketCapSol.toFixed(1)} SOL mcap`,
      )
    },
    [addLog],
  )

  // snapshot the start time so we only snipe launches that arrive after "Start"
  useEffect(() => {
    if (running) {
      startedAt.current = Date.now()
      addLog('info', 'Bot armed — watching for launches…')
    } else if (startedAt.current) {
      addLog('info', 'Bot stopped.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  // react to the real pump.fun feed
  useEffect(() => {
    if (!running) return
    for (const t of feedTokens) {
      if (t.createdAt < startedAt.current) continue
      tryBuy({ mint: t.mint, symbol: t.symbol, name: t.name, marketCapSol: t.marketCapSol, creator: t.creator })
    }
  }, [running, feedTokens, tryBuy])

  // simulated launches so the engine is always demonstrable (sim mode only)
  useEffect(() => {
    if (!running || config.live) return
    const spawn = setInterval(() => {
      const c = cfg.current
      const symbol = pick(SYMS) + (Math.floor(Math.random() * 90) + 10)
      const creator =
        c.mode === 'dev' && c.devAddress && Math.random() < 0.6 ? c.devAddress : randAddr()
      tryBuy({
        mint: `sim-${uid()}`,
        symbol,
        name: `${pick(NAMES)} ${pick(NAMES)}`,
        marketCapSol: +(Math.random() * 90 + 3).toFixed(1),
        creator,
      })
    }, 3500)
    return () => clearInterval(spawn)
  }, [running, config.live, tryBuy])

  // price engine — evolves open positions and auto-closes on TP / SL / trailing
  useEffect(() => {
    if (!running) return
    const tick = setInterval(() => {
      const c = cfg.current
      setPositions((prev) => {
        const closed: Position[] = []
        const next = prev.map((p) => {
          if (p.status !== 'open') return p
          const drift = (Math.random() < 0.52 ? 1 : -1) * 0.012
          const price = Math.max(0.02, p.price * (1 + drift + (Math.random() - 0.5) * 0.1))
          const peak = Math.max(p.peak, price)
          const pct = (price / p.entry - 1) * 100
          const trailPct = (price / peak - 1) * 100

          let reason: ExitReason | null = null
          if (c.autoSell && pct >= c.takeProfit) reason = 'TP'
          else if (c.autoSell && c.trailing && peak > p.entry * 1.05 && trailPct <= -c.stopLoss) reason = 'Trail'
          else if (c.autoSell && pct <= -c.stopLoss) reason = 'SL'

          if (reason) {
            const pnlPct = pct
            const done: Position = {
              ...p,
              price,
              peak,
              status: 'closed',
              exitReason: reason,
              pnlPct,
              pnlSol: (p.amountSol * pnlPct) / 100,
              closedAt: Date.now(),
            }
            closed.push(done)
            return done
          }
          return { ...p, price, peak }
        })
        if (closed.length) {
          queueMicrotask(() =>
            closed.forEach((p) =>
              addLog(
                'sell',
                `${p.exitReason} ${p.symbol} — ${p.pnlPct! >= 0 ? '+' : ''}${p.pnlPct!.toFixed(1)}% (${p.pnlSol! >= 0 ? '+' : ''}${p.pnlSol!.toFixed(3)} SOL)`,
              ),
            ),
          )
        }
        return next
      })
    }, 1100)
    return () => clearInterval(tick)
  }, [running, addLog])

  const sellOne = useCallback((id: string) => {
    setPositions((prev) =>
      prev.map((p) => {
        if (p.id !== id || p.status !== 'open') return p
        const pnlPct = (p.price / p.entry - 1) * 100
        return { ...p, status: 'closed', exitReason: 'Manual', pnlPct, pnlSol: (p.amountSol * pnlPct) / 100, closedAt: Date.now() }
      }),
    )
  }, [])

  const sellAll = useCallback(() => {
    setPositions((prev) =>
      prev.map((p) => {
        if (p.status !== 'open') return p
        const pnlPct = (p.price / p.entry - 1) * 100
        return { ...p, status: 'closed', exitReason: 'Manual', pnlPct, pnlSol: (p.amountSol * pnlPct) / 100, closedAt: Date.now() }
      }),
    )
  }, [])

  const reset = useCallback(() => {
    setPositions([])
    setLog([])
    processed.current.clear()
  }, [])

  const stats = useMemo(() => {
    const open = positions.filter((p) => p.status === 'open')
    const closed = positions.filter((p) => p.status === 'closed')
    const realized = closed.reduce((s, p) => s + (p.pnlSol || 0), 0)
    const unreal = open.reduce((s, p) => s + p.amountSol * (p.price / p.entry - 1), 0)
    const wins = closed.filter((p) => (p.pnlSol || 0) > 0).length
    const winRate = closed.length ? (wins / closed.length) * 100 : 0
    return { open, closed, realized, unreal, total: realized + unreal, winRate, snipes: positions.length }
  }, [positions])

  return { positions, log, stats, sellOne, sellAll, reset }
}
