// Live market data from the free, public DexScreener API.
// Docs: https://docs.dexscreener.com/api/reference
// The API sends permissive CORS headers, so these calls work directly from
// the browser — no backend or API key required.

const BASE = 'https://api.dexscreener.com'

export interface Coin {
  key: string
  chainId: string
  name: string
  symbol: string
  priceUsd: number
  change1h: number
  change6h: number
  change24h: number
  volume24h: number
  liquidity: number
  marketCap: number
  pairCreatedAt: number
  url: string
  icon: string | null
  dexId: string
  trending: boolean
  buys24h: number
  sells24h: number
}

interface AddrMeta {
  addr: string
  chainId: string
  icon?: string
  trending: boolean
}

function num(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

async function getJSON(url: string): Promise<any> {
  const res = await fetch(url, { headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

/** Collect trending / freshly promoted token addresses across chains. */
async function fetchTrendingAddresses(): Promise<AddrMeta[]> {
  const [top, latest, profiles] = await Promise.allSettled([
    getJSON(`${BASE}/token-boosts/top/v1`),
    getJSON(`${BASE}/token-boosts/latest/v1`),
    getJSON(`${BASE}/token-profiles/latest/v1`),
  ])

  const out = new Map<string, AddrMeta>()
  const add = (arr: any, trending: boolean) => {
    if (!Array.isArray(arr)) return
    for (const t of arr) {
      const addr = t?.tokenAddress
      if (!addr) continue
      const prev = out.get(addr)
      out.set(addr, {
        addr,
        chainId: t.chainId ?? prev?.chainId ?? '',
        icon: t.icon ?? prev?.icon,
        trending: trending || !!prev?.trending,
      })
    }
  }

  if (top.status === 'fulfilled') add(top.value, true)
  if (latest.status === 'fulfilled') add(latest.value, false)
  if (profiles.status === 'fulfilled') add(profiles.value, false)

  return [...out.values()]
}

function normalize(p: any, meta?: AddrMeta): Coin {
  return {
    key: p.baseToken?.address ?? p.pairAddress,
    chainId: p.chainId ?? meta?.chainId ?? '',
    name: p.baseToken?.name || p.baseToken?.symbol || 'Unknown',
    symbol: p.baseToken?.symbol || '?',
    priceUsd: num(p.priceUsd),
    change1h: num(p.priceChange?.h1),
    change6h: num(p.priceChange?.h6),
    change24h: num(p.priceChange?.h24),
    volume24h: num(p.volume?.h24),
    liquidity: num(p.liquidity?.usd),
    marketCap: num(p.marketCap ?? p.fdv),
    pairCreatedAt: num(p.pairCreatedAt),
    url: p.url ?? '#',
    icon: p.info?.imageUrl || meta?.icon || null,
    dexId: p.dexId ?? '',
    trending: !!meta?.trending,
    buys24h: num(p.txns?.h24?.buys),
    sells24h: num(p.txns?.h24?.sells),
  }
}

/** Hydrate token addresses into full market data (batched, 30 per request). */
async function hydrate(addresses: AddrMeta[]): Promise<Coin[]> {
  const metaByAddr = new Map(addresses.map((a) => [a.addr.toLowerCase(), a]))
  const chunks: AddrMeta[][] = []
  for (let i = 0; i < addresses.length; i += 30) chunks.push(addresses.slice(i, i + 30))

  const responses = await Promise.allSettled(
    chunks.map((c) => getJSON(`${BASE}/latest/dex/tokens/${c.map((x) => x.addr).join(',')}`)),
  )

  // keep the most-liquid pair per token
  const byToken = new Map<string, Coin>()
  for (const res of responses) {
    if (res.status !== 'fulfilled') continue
    const pairs: any[] = res.value?.pairs ?? []
    for (const p of pairs) {
      const addr = p.baseToken?.address
      if (!addr) continue
      const meta = metaByAddr.get(addr.toLowerCase())
      const coin = normalize(p, meta)
      const prev = byToken.get(coin.key)
      if (!prev || coin.liquidity > prev.liquidity) byToken.set(coin.key, coin)
    }
  }
  return [...byToken.values()].filter((c) => c.priceUsd > 0)
}

/** Fetch the full live market set. Throws if the network is unavailable. */
export async function fetchMarkets(): Promise<Coin[]> {
  const addresses = await fetchTrendingAddresses()
  if (!addresses.length) return []
  return hydrate(addresses)
}
