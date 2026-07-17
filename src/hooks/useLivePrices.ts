import { useEffect, useState } from 'react'
import type { Agent } from '../data/agents'

/**
 * Simulates a live market: every tick, prices, market caps and 24h changes
 * drift slightly so the UI feels alive — like a real trading terminal.
 */
export function useLivePrices(initial: Agent[], intervalMs = 2600) {
  const [live, setLive] = useState<Agent[]>(initial)

  useEffect(() => {
    const timer = setInterval(() => {
      setLive((prev) =>
        prev.map((a) => {
          if (a.status === 'Genesis') return a
          const wobble = (Math.random() - 0.48) * 0.012
          const nextPrice = Math.max(0.0001, a.price * (1 + wobble))
          const ratio = nextPrice / a.price
          return {
            ...a,
            price: nextPrice,
            marketCap: a.marketCap * ratio,
            change24h: +(a.change24h + wobble * 100).toFixed(2),
          }
        }),
      )
    }, intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])

  return live
}
