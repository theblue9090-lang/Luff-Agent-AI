import { useEffect, useRef, useState } from 'react'

export type PumpStatus = 'connecting' | 'live' | 'error'

export interface PumpToken {
  mint: string
  name: string
  symbol: string
  createdAt: number
  marketCapSol: number
  creator?: string
  uri?: string
  pool?: string
  image?: string
}

const WS_URL = 'wss://pumpportal.fun/api/data'

/** Turn ipfs:// (and bare CID) URIs into an HTTP gateway URL. */
function ipfsToHttp(u: string): string {
  if (!u) return u
  if (u.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${u.slice(7)}`
  return u
}

/**
 * pump.fun stores each token's off-chain metadata JSON at `uri`; the logo is
 * its `image` field. Fetch it (with a timeout) so the launch feed shows logos.
 */
async function resolveImage(uri: string, signal: AbortSignal): Promise<string | undefined> {
  try {
    const res = await fetch(ipfsToHttp(uri), { signal })
    if (!res.ok) return undefined
    const meta = await res.json()
    return meta?.image ? ipfsToHttp(String(meta.image)) : undefined
  } catch {
    return undefined
  }
}

/**
 * Streams brand-new pump.fun token launches in real time via PumpPortal's
 * free WebSocket. Every new mint is prepended instantly — so a coin that
 * launches on pump.fun shows up on our site the moment it's created.
 */
export function usePumpFeed(max = 24) {
  const [tokens, setTokens] = useState<PumpToken[]>([])
  const [status, setStatus] = useState<PumpStatus>('connecting')
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    let closed = false
    let retry: ReturnType<typeof setTimeout> | undefined
    const controller = new AbortController()

    const hydrateImage = async (mint: string, uri: string) => {
      const image = await resolveImage(uri, controller.signal)
      if (!image || closed) return
      setTokens((prev) => prev.map((t) => (t.mint === mint ? { ...t, image } : t)))
    }

    const connect = () => {
      let ws: WebSocket
      try {
        ws = new WebSocket(WS_URL)
      } catch {
        setStatus('error')
        return
      }
      wsRef.current = ws

      ws.onopen = () => {
        setStatus('live')
        ws.send(JSON.stringify({ method: 'subscribeNewToken' }))
      }

      ws.onmessage = (ev) => {
        try {
          const d = JSON.parse(ev.data)
          if ((d.txType === 'create' || d.method === 'newToken') && d.mint) {
            const token: PumpToken = {
              mint: d.mint,
              name: d.name || 'Unknown',
              symbol: d.symbol || '?',
              createdAt: Date.now(),
              marketCapSol: Number(d.marketCapSol) || 0,
              creator: d.traderPublicKey,
              uri: d.uri,
              pool: d.pool,
            }
            setTokens((prev) => {
              if (prev.some((t) => t.mint === token.mint)) return prev
              return [token, ...prev].slice(0, max)
            })
            if (token.uri) hydrateImage(token.mint, token.uri)
          }
        } catch {
          /* ignore keep-alive / non-JSON frames */
        }
      }

      ws.onerror = () => setStatus('error')

      ws.onclose = () => {
        if (closed) return
        setStatus('error')
        retry = setTimeout(connect, 4000)
      }
    }

    connect()
    return () => {
      closed = true
      if (retry) clearTimeout(retry)
      controller.abort()
      wsRef.current?.close()
    }
  }, [max])

  return { tokens, status }
}
