import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Executor, LaunchCandidate, Source } from '../lib/sniperExecutor'

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
  sources: { pump: boolean; dex: boolean }
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
  sources: { pump: true, dex: true },
}

export type ExitReason = 'TP' | 'SL' | 'Trail' | 'Manual'

export interface Position {
  id: string
  mint: string
  symbol: string
  name: string
  source: Source
  amountSol: number
  tokenAmount: number
  entryValueSol: number
  valueSol: number
  peakSol: number
  openedAt: number
  status: 'open' | 'closed'
  exitReason?: ExitReason
  pnlPct?: number
  pnlSol?: number
  closedAt?: number
  buySig?: string
  sellSig?: string
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
const NAMES = ['Pepe', 'Doge', 'Wif', 'Bonk', 'Moon', 'Chad', 'Cat', 'Giga', 'Rocket', 'Ember', 'Blaze', 'Pyre', 'Scarlet', 'Crimson', 'Ronin', 'Magma', 'Inferno', 'Phoenix']
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)]

/**
 * Auto-executing sniper engine. Consumes a stream of launch candidates
 * (pump.fun / DexScreener / dev address) and, when running, buys matching
 * launches through the injected executor (simulation or live mainnet), then
 * manages each position with TP / SL / trailing — all with no manual step.
 */
export function useSniperBot(
  running: boolean,
  config: SniperConfig,
  candidates: LaunchCandidate[],
  executor: Executor,
) {
  const [positions, setPositions] = useState<Position[]>([])
  const [log, setLog] = useState<LogEntry[]>([])

  const cfg = useRef(config)
  cfg.current = config
  const isRunning = useRef(running)
  isRunning.current = running
  const exec = useRef(executor)
  exec.current = executor
  const posRef = useRef<Position[]>([])
  posRef.current = positions

  const processed = useRef<Set<string>>(new Set())
  const buying = useRef<Set<string>>(new Set())
  const selling = useRef<Set<string>>(new Set())
  const armed = useRef(false)

  const addLog = useCallback((kind: LogEntry['kind'], text: string) => {
    setLog((prev) => [{ id: uid(), ts: Date.now(), kind, text }, ...prev].slice(0, 80))
  }, [])

  const passesFilter = useCallback((c: LaunchCandidate): boolean => {
    const co = cfg.current
    if (co.mode === 'dev') return !!co.devAddress && c.creator === co.devAddress
    if (c.source === 'pump' && !co.sources.pump) return false
    if (c.source === 'dexscreener' && !co.sources.dex) return false
    return true
  }, [])

  const consider = useCallback(
    async (c: LaunchCandidate) => {
      const co = cfg.current
      if (!isRunning.current || processed.current.has(c.mint) || buying.current.has(c.mint)) return
      if (!passesFilter(c)) return
      if (c.source === 'pump' && (c.marketCapSol < co.minMcapSol || c.marketCapSol > co.maxMcapSol)) {
        processed.current.add(c.mint)
        addLog('skip', `Skipped ${c.symbol} — ${c.marketCapSol.toFixed(1)} SOL mcap out of range`)
        return
      }

      processed.current.add(c.mint)
      buying.current.add(c.mint)
      addLog('info', `${co.mode === 'dev' ? 'Dev match' : 'Target'} ${c.symbol} — buying ${co.buySol} SOL…`)

      const res = await exec.current.buy(c, co.buySol, {
        slippage: co.maxSlippage,
        priorityFee: co.priorityFee,
      })
      buying.current.delete(c.mint)

      if (!res.ok) {
        addLog('skip', `Buy failed ${c.symbol} — ${res.error || 'unknown'}`)
        return
      }
      const entry = res.entryValueSol ?? co.buySol
      const pos: Position = {
        id: uid(),
        mint: c.mint,
        symbol: c.symbol,
        name: c.name,
        source: c.source,
        amountSol: co.buySol,
        tokenAmount: res.tokenAmount ?? co.buySol,
        entryValueSol: entry,
        valueSol: entry,
        peakSol: entry,
        openedAt: Date.now(),
        status: 'open',
        buySig: res.sig,
      }
      setPositions((prev) => [pos, ...prev].slice(0, 50))
      addLog('buy', `Bought ${c.symbol} — ${co.buySol} SOL${res.sig ? ` · ${res.sig.slice(0, 8)}…` : ''}`)
    },
    [addLog, passesFilter],
  )

  const closePosition = useCallback(
    async (p: Position, reason: ExitReason) => {
      if (selling.current.has(p.id)) return
      selling.current.add(p.id)
      const co = cfg.current
      const res = await exec.current.sell(p.mint, p.tokenAmount, p.source, {
        slippage: co.maxSlippage,
        priorityFee: co.priorityFee,
      })
      selling.current.delete(p.id)

      const exitVal = res.ok ? res.exitValueSol ?? p.valueSol : p.valueSol
      const pnlSol = exitVal - p.entryValueSol
      const pnlPct = (exitVal / p.entryValueSol - 1) * 100
      setPositions((prev) =>
        prev.map((x) =>
          x.id === p.id && x.status === 'open'
            ? { ...x, status: 'closed', exitReason: reason, valueSol: exitVal, pnlSol, pnlPct, closedAt: Date.now(), sellSig: res.sig }
            : x,
        ),
      )
      if (res.ok) {
        addLog('sell', `${reason} ${p.symbol} — ${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(1)}% (${pnlSol >= 0 ? '+' : ''}${pnlSol.toFixed(3)} SOL)`)
      } else {
        addLog('skip', `Sell error ${p.symbol} — ${res.error || 'unknown'}`)
      }
    },
    [addLog],
  )

  // arm on start (skip backlog) then process new candidates
  useEffect(() => {
    if (!running) {
      armed.current = false
      return
    }
    if (!armed.current) {
      candidates.forEach((c) => processed.current.add(c.mint))
      armed.current = true
      addLog('info', 'Bot armed — watching for launches…')
      return
    }
    candidates.forEach((c) => void consider(c))
  }, [running, candidates, consider, addLog])

  // simulated launches so the engine is demonstrable when not live
  useEffect(() => {
    if (!running || exec.current.live) return
    const spawn = setInterval(() => {
      const co = cfg.current
      const creator =
        co.mode === 'dev' && co.devAddress && Math.random() < 0.6 ? co.devAddress : randAddr()
      void consider({
        mint: `sim-${uid()}`,
        symbol: pick(SYMS) + (Math.floor(Math.random() * 90) + 10),
        name: `${pick(NAMES)} ${pick(NAMES)}`,
        marketCapSol: +(Math.random() * 90 + 3).toFixed(1),
        creator,
        source: Math.random() < 0.5 || !co.sources.dex ? 'pump' : 'dexscreener',
      })
    }, 3500)
    return () => clearInterval(spawn)
  }, [running, consider])

  // valuation + TP/SL loop
  useEffect(() => {
    if (!running) return
    let ticking = false
    const tick = async () => {
      if (ticking) return
      ticking = true
      try {
        const co = cfg.current
        for (const p of posRef.current) {
          if (p.status !== 'open' || selling.current.has(p.id)) continue
          const v = await exec.current.value(p.mint, p.tokenAmount)
          if (v == null) continue
          const peak = Math.max(p.peakSol, v)
          const pct = (v / p.entryValueSol - 1) * 100
          const trailPct = (v / peak - 1) * 100
          setPositions((prev) =>
            prev.map((x) => (x.id === p.id && x.status === 'open' ? { ...x, valueSol: v, peakSol: peak } : x)),
          )
          if (!co.autoSell) continue
          if (pct >= co.takeProfit) void closePosition(p, 'TP')
          else if (co.trailing && peak > p.entryValueSol * 1.05 && trailPct <= -co.stopLoss) void closePosition(p, 'Trail')
          else if (pct <= -co.stopLoss) void closePosition(p, 'SL')
        }
      } finally {
        ticking = false
      }
    }
    const iv = setInterval(tick, exec.current.live ? 4000 : 1100)
    return () => clearInterval(iv)
  }, [running, closePosition])

  const sellOne = useCallback((id: string) => {
    const p = posRef.current.find((x) => x.id === id && x.status === 'open')
    if (p) void closePosition(p, 'Manual')
  }, [closePosition])

  const sellAll = useCallback(() => {
    posRef.current.filter((x) => x.status === 'open').forEach((p) => void closePosition(p, 'Manual'))
  }, [closePosition])

  const reset = useCallback(() => {
    setPositions([])
    setLog([])
    processed.current.clear()
  }, [])

  const stats = useMemo(() => {
    const open = positions.filter((p) => p.status === 'open')
    const closed = positions.filter((p) => p.status === 'closed')
    const realized = closed.reduce((s, p) => s + (p.pnlSol || 0), 0)
    const unreal = open.reduce((s, p) => s + (p.valueSol - p.entryValueSol), 0)
    const wins = closed.filter((p) => (p.pnlSol || 0) > 0).length
    const winRate = closed.length ? (wins / closed.length) * 100 : 0
    return { open, closed, realized, unreal, total: realized + unreal, winRate, snipes: positions.length }
  }, [positions])

  return { positions, log, stats, sellOne, sellAll, reset }
}
