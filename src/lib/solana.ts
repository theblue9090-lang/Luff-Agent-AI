// Minimal Solana helpers — read a wallet's on-chain token holdings via JSON-RPC
// and connect Phantom directly through the injected provider (no heavy deps).

export const WSOL_MINT = 'So11111111111111111111111111111111111111112'
const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'

export interface RawBalance {
  mint: string
  amount: number
}

async function rpc(method: string, params: unknown[], endpoint: string): Promise<any> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  if (!res.ok) throw new Error(`RPC ${res.status}`)
  const j = await res.json()
  if (j.error) throw new Error(j.error.message || 'RPC error')
  return j.result
}

/** Read native SOL + all SPL (and Token-2022) balances for an address. */
export async function getWalletHoldings(address: string, endpoint: string): Promise<RawBalance[]> {
  const [sol, tok, tok22] = await Promise.all([
    rpc('getBalance', [address], endpoint).catch(() => null),
    rpc(
      'getTokenAccountsByOwner',
      [address, { programId: TOKEN_PROGRAM_ID }, { encoding: 'jsonParsed' }],
      endpoint,
    ).catch(() => null),
    rpc(
      'getTokenAccountsByOwner',
      [address, { programId: TOKEN_2022_PROGRAM_ID }, { encoding: 'jsonParsed' }],
      endpoint,
    ).catch(() => null),
  ])

  const merged = new Map<string, number>()
  const add = (mint: string, amount: number) => {
    if (!mint || !(amount > 0)) return
    merged.set(mint, (merged.get(mint) || 0) + amount)
  }

  const lamports = typeof sol?.value === 'number' ? sol.value : 0
  add(WSOL_MINT, lamports / 1e9)

  const parseAccounts = (r: any) => {
    const arr: any[] = r?.value ?? []
    for (const it of arr) {
      const info = it?.account?.data?.parsed?.info
      add(info?.mint, Number(info?.tokenAmount?.uiAmount) || 0)
    }
  }
  parseAccounts(tok)
  parseAccounts(tok22)

  return [...merged.entries()].map(([mint, amount]) => ({ mint, amount }))
}

interface PhantomProvider {
  isPhantom?: boolean
  connect: () => Promise<{ publicKey: { toString: () => string } }>
}

/** Connect the injected Phantom wallet and return the public key. */
export async function connectPhantom(): Promise<string> {
  const w = window as unknown as { phantom?: { solana?: PhantomProvider }; solana?: PhantomProvider }
  const provider = w.phantom?.solana ?? w.solana
  if (!provider?.isPhantom) {
    throw new Error('Phantom wallet not found. Install it from phantom.app')
  }
  const resp = await provider.connect()
  return resp.publicKey.toString()
}

const B58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
export function isValidSolAddress(addr: string): boolean {
  return B58_RE.test(addr.trim())
}

export function shortMint(mint: string): string {
  return `${mint.slice(0, 4)}…${mint.slice(-4)}`
}
