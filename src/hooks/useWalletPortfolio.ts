import { useCallback, useEffect, useMemo, useState } from 'react'
import { getWalletHoldings, WSOL_MINT, shortMint } from '../lib/solana'
import { fetchTokenPrices } from '../lib/marketApi'

export type PortfolioStatus = 'idle' | 'loading' | 'ready' | 'error' | 'empty'

export interface Position {
  mint: string
  symbol: string
  name: string
  icon: string | null
  amount: number
  price: number
  change24h: number
  value: number
  priced: boolean
}

/**
 * Loads a real Solana wallet's holdings (via RPC) and prices them live (via
 * DexScreener), refreshing on an interval. Pass `address = null` to stay idle.
 */
export function useWalletPortfolio(address: string | null, endpoint: string, pollMs = 30_000) {
  const [positions, setPositions] = useState<Position[]>([])
  const [status, setStatus] = useState<PortfolioStatus>('idle')
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!address) return
    setStatus((s) => (s === 'ready' ? 'ready' : 'loading'))
    setError(null)
    try {
      const balances = await getWalletHoldings(address, endpoint)
      if (!balances.length) {
        setPositions([])
        setStatus('empty')
        return
      }
      const prices = await fetchTokenPrices(balances.map((b) => b.mint))
      const pos: Position[] = balances
        .map((b) => {
          const isSol = b.mint === WSOL_MINT
          const pr = prices.get(b.mint)
          const price = pr?.priceUsd ?? 0
          return {
            mint: b.mint,
            symbol: isSol ? 'SOL' : pr?.symbol ?? shortMint(b.mint),
            name: isSol ? 'Solana' : pr?.name ?? 'Unknown token',
            icon: pr?.icon ?? null,
            amount: b.amount,
            price,
            change24h: pr?.change24h ?? 0,
            value: b.amount * price,
            priced: price > 0,
          }
        })
        .sort((a, b) => b.value - a.value)
      setPositions(pos)
      setStatus('ready')
      setUpdatedAt(Date.now())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load wallet')
      setStatus((s) => (s === 'ready' ? 'ready' : 'error'))
    }
  }, [address, endpoint])

  useEffect(() => {
    if (!address) {
      setPositions([])
      setStatus('idle')
      setError(null)
      return
    }
    load()
    const t = setInterval(load, pollMs)
    return () => clearInterval(t)
  }, [address, load, pollMs])

  const { totalValue, dayChange } = useMemo(() => {
    const total = positions.reduce((s, p) => s + p.value, 0)
    const day =
      total > 0
        ? (positions.reduce((s, p) => s + p.value * (p.change24h / 100), 0) / total) * 100
        : 0
    return { totalValue: total, dayChange: day }
  }, [positions])

  return { positions, status, updatedAt, error, totalValue, dayChange, refresh: load }
}
