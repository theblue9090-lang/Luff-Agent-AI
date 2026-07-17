import {
  Connection,
  Keypair,
  PublicKey,
  VersionedTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import bs58 from 'bs58'

export const WSOL_MINT = 'So11111111111111111111111111111111111111112'

export type Source = 'pump' | 'dexscreener'

export interface LaunchCandidate {
  mint: string
  symbol: string
  name: string
  marketCapSol: number
  creator?: string
  source: Source
  pool?: string
}

export interface TradeOpt {
  slippage: number // percent
  priorityFee: number // SOL
}

export interface BuyResult {
  ok: boolean
  sig?: string
  error?: string
  tokenAmount?: number // raw units held after buy
  entryValueSol?: number
}
export interface SellResult {
  ok: boolean
  sig?: string
  error?: string
  exitValueSol?: number
}

export interface Executor {
  live: boolean
  buy(c: LaunchCandidate, amountSol: number, opt: TradeOpt): Promise<BuyResult>
  value(mint: string, tokenAmount: number): Promise<number | null>
  sell(mint: string, tokenAmount: number, source: Source, opt: TradeOpt): Promise<SellResult>
}

/* ------------------------------ keypair ------------------------------ */

export function parseKeypair(secret: string): Keypair {
  const s = secret.trim()
  if (s.startsWith('[')) {
    const arr = JSON.parse(s) as number[]
    return Keypair.fromSecretKey(Uint8Array.from(arr))
  }
  return Keypair.fromSecretKey(bs58.decode(s))
}

/**
 * A signer abstraction so the executor can be driven by either a raw burner
 * keypair or a managed embedded wallet (Privy) that signs without exposing keys.
 */
export interface WalletSigner {
  publicKey: string
  signAndSend(tx: VersionedTransaction, connection: Connection): Promise<string>
}

export function keypairSigner(keypair: Keypair): WalletSigner {
  return {
    publicKey: keypair.publicKey.toBase58(),
    async signAndSend(tx, connection) {
      tx.sign([keypair])
      return connection.sendTransaction(tx, { skipPreflight: true, maxRetries: 3 })
    },
  }
}

export async function getSolBalance(connection: Connection, pubkey: PublicKey): Promise<number> {
  const lamports = await connection.getBalance(pubkey)
  return lamports / LAMPORTS_PER_SOL
}

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

/* --------------------------- simulation ----------------------------- */

/** Paper executor — simulates fills and price action, no funds at risk. */
export function createSimExecutor(): Executor {
  const price = new Map<string, number>()
  return {
    live: false,
    async buy(c, amountSol) {
      price.set(c.mint, 1)
      return { ok: true, tokenAmount: amountSol, entryValueSol: amountSol }
    },
    async value(mint, tokenAmount) {
      const p0 = price.get(mint) ?? 1
      const drift = (Math.random() < 0.52 ? 1 : -1) * 0.012
      const p = Math.max(0.02, p0 * (1 + drift + (Math.random() - 0.5) * 0.1))
      price.set(mint, p)
      return tokenAmount * p
    },
    async sell(mint, tokenAmount) {
      const p = price.get(mint) ?? 1
      return { ok: true, exitValueSol: tokenAmount * p }
    },
  }
}

/* ------------------------------- live -------------------------------- */

const JUP = 'https://lite-api.jup.ag/swap/v1'
const PUMP_TRADE = 'https://pumpportal.fun/api/trade-local'

/**
 * Live executor — signs with a burner keypair and submits real mainnet
 * transactions (PumpPortal for bonding-curve pump.fun coins, Jupiter for
 * routable/graduated tokens). USE A DEDICATED BURNER WITH MINIMAL FUNDS.
 */
export function createLiveExecutor(signer: WalletSigner, connection: Connection): Executor {
  const owner = new PublicKey(signer.publicKey)

  const tokenRaw = async (mint: string): Promise<number> => {
    try {
      const res = await connection.getParsedTokenAccountsByOwner(owner, { mint: new PublicKey(mint) })
      let amount = 0
      for (const acc of res.value) {
        amount += Number(acc.account.data.parsed.info.tokenAmount.amount)
      }
      return amount
    } catch {
      return 0
    }
  }

  const send = (tx: VersionedTransaction): Promise<string> => signer.signAndSend(tx, connection)

  const pumpTrade = async (
    mint: string,
    action: 'buy' | 'sell',
    amount: number | string,
    denominatedInSol: boolean,
    opt: TradeOpt,
    pool = 'auto',
  ): Promise<string> => {
    const res = await fetch(PUMP_TRADE, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        publicKey: owner.toBase58(),
        action,
        mint,
        amount,
        denominatedInSol: String(denominatedInSol),
        slippage: opt.slippage,
        priorityFee: opt.priorityFee,
        pool,
      }),
    })
    if (!res.ok) throw new Error(`PumpPortal ${res.status}`)
    const tx = VersionedTransaction.deserialize(new Uint8Array(await res.arrayBuffer()))
    return send(tx)
  }

  const jupSwap = async (
    inputMint: string,
    outputMint: string,
    amountRaw: number,
    opt: TradeOpt,
  ): Promise<string> => {
    const slippageBps = Math.max(1, Math.round(opt.slippage * 100))
    const qUrl = `${JUP}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${Math.floor(
      amountRaw,
    )}&slippageBps=${slippageBps}&restrictIntermediateTokens=true`
    const q = await fetch(qUrl)
    if (!q.ok) throw new Error(`Jupiter quote ${q.status}`)
    const quote = await q.json()
    const s = await fetch(`${JUP}/swap`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey: owner.toBase58(),
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: Math.round(opt.priorityFee * LAMPORTS_PER_SOL),
      }),
    })
    if (!s.ok) throw new Error(`Jupiter swap ${s.status}`)
    const { swapTransaction } = await s.json()
    const tx = VersionedTransaction.deserialize(b64ToBytes(swapTransaction))
    return send(tx)
  }

  const jupQuoteOut = async (inputMint: string, outputMint: string, amountRaw: number): Promise<number> => {
    const q = await fetch(
      `${JUP}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${Math.floor(amountRaw)}&slippageBps=500`,
    )
    if (!q.ok) throw new Error(`quote ${q.status}`)
    const quote = await q.json()
    return Number(quote.outAmount) || 0
  }

  return {
    live: true,

    async buy(c, amountSol, opt) {
      try {
        let sig: string
        if (c.source === 'pump') {
          sig = await pumpTrade(c.mint, 'buy', amountSol, true, opt, c.pool || 'auto')
        } else {
          sig = await jupSwap(WSOL_MINT, c.mint, Math.floor(amountSol * LAMPORTS_PER_SOL), opt)
        }
        // best-effort: read the resulting token balance
        let held = 0
        for (let i = 0; i < 6 && held === 0; i++) {
          await new Promise((r) => setTimeout(r, 1500))
          held = await tokenRaw(c.mint)
        }
        return { ok: true, sig, tokenAmount: held || 1, entryValueSol: amountSol }
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : 'buy failed' }
      }
    },

    async value(mint, tokenAmount) {
      try {
        const outLamports = await jupQuoteOut(mint, WSOL_MINT, tokenAmount)
        if (!outLamports) return null
        return outLamports / LAMPORTS_PER_SOL
      } catch {
        return null // not routable yet (e.g. still on the bonding curve)
      }
    },

    async sell(mint, _tokenAmount, source, opt) {
      try {
        const held = await tokenRaw(mint)
        if (!held) return { ok: false, error: 'no balance' }
        let sig: string
        if (source === 'pump') {
          sig = await pumpTrade(mint, 'sell', '100%', false, opt, 'auto')
        } else {
          sig = await jupSwap(mint, WSOL_MINT, held, opt)
        }
        return { ok: true, sig }
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : 'sell failed' }
      }
    },
  }
}
