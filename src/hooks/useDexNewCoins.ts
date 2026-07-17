import { useEffect, useState } from 'react'
import { fetchMarkets } from '../lib/marketApi'
import type { LaunchCandidate } from '../lib/sniperExecutor'

/**
 * Polls DexScreener and surfaces recently-created Solana pairs as sniper
 * candidates (best-effort "new on DexScreener" signal).
 */
export function useDexNewCoins(enabled: boolean, pollMs = 30_000, maxAgeMin = 45) {
  const [coins, setCoins] = useState<LaunchCandidate[]>([])

  useEffect(() => {
    if (!enabled) {
      setCoins([])
      return
    }
    let alive = true
    const load = async () => {
      try {
        const data = await fetchMarkets()
        if (!alive) return
        const cutoff = Date.now() - maxAgeMin * 60_000
        setCoins(
          data
            .filter((c) => c.pairCreatedAt && c.pairCreatedAt >= cutoff)
            .map((c) => ({
              mint: c.key,
              symbol: c.symbol,
              name: c.name,
              marketCapSol: 0,
              source: 'dexscreener' as const,
            })),
        )
      } catch {
        /* offline / rate-limited — ignore */
      }
    }
    load()
    const t = setInterval(load, pollMs)
    return () => {
      alive = false
      clearInterval(t)
    }
  }, [enabled, pollMs, maxAgeMin])

  return coins
}
