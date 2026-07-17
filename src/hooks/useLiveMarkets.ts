import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchMarkets, type Coin } from '../lib/marketApi'

export type MarketStatus = 'loading' | 'live' | 'error'

/**
 * Polls the DexScreener API on an interval so the board stays fresh.
 * Returns live coins plus a status the UI can reflect.
 */
export function useLiveMarkets(pollMs = 45_000) {
  const [coins, setCoins] = useState<Coin[]>([])
  const [status, setStatus] = useState<MarketStatus>('loading')
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)
  const alive = useRef(true)

  const load = useCallback(async () => {
    try {
      const data = await fetchMarkets()
      if (!alive.current) return
      if (data.length) {
        setCoins(data)
        setStatus('live')
        setUpdatedAt(Date.now())
      } else {
        setStatus((s) => (s === 'live' ? 'live' : 'error'))
      }
    } catch {
      if (alive.current) setStatus((s) => (s === 'live' ? 'live' : 'error'))
    }
  }, [])

  useEffect(() => {
    alive.current = true
    load()
    const t = setInterval(load, pollMs)
    return () => {
      alive.current = false
      clearInterval(t)
    }
  }, [load, pollMs])

  return { coins, status, updatedAt, refresh: load }
}
