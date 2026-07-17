import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useSolanaWallets } from '@privy-io/react-auth/solana'
import { Connection, PublicKey, type VersionedTransaction } from '@solana/web3.js'
import { LogIn, LogOut, Copy, Check, RefreshCw, ShieldCheck } from 'lucide-react'
import type { WalletSigner } from '../lib/sniperExecutor'

interface PrivySniperWalletProps {
  connection: Connection
  onSigner: (s: WalletSigner | null) => void
}

export default function PrivySniperWallet({ connection, onSigner }: PrivySniperWalletProps) {
  const { ready, authenticated, login, logout } = usePrivy()
  const { wallets, createWallet, ready: walletsReady } = useSolanaWallets()
  const [balance, setBalance] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [creating, setCreating] = useState(false)

  const wallet = wallets[0]
  const address = wallet?.address ?? null

  // auto-create the user's embedded Solana wallet after login
  useEffect(() => {
    if (authenticated && walletsReady && wallets.length === 0 && !creating) {
      setCreating(true)
      Promise.resolve(createWallet())
        .catch(() => undefined)
        .finally(() => setCreating(false))
    }
  }, [authenticated, walletsReady, wallets.length, creating, createWallet])

  // expose a signer that auto-signs (no popup, thanks to showWalletUIs: false)
  const signer = useMemo<WalletSigner | null>(() => {
    if (!wallet || !address) return null
    return {
      publicKey: address,
      async signAndSend(tx: VersionedTransaction, conn: Connection) {
        return wallet.sendTransaction(tx, conn, { skipPreflight: true })
      },
    }
  }, [wallet, address])

  useEffect(() => {
    onSigner(signer)
    return () => onSigner(null)
  }, [signer, onSigner])

  const refreshBalance = useCallback(async () => {
    if (!address) return setBalance(null)
    try {
      setBalance((await connection.getBalance(new PublicKey(address))) / 1e9)
    } catch {
      setBalance(null)
    }
  }, [address, connection])

  useEffect(() => {
    void refreshBalance()
  }, [refreshBalance])

  const copy = () => {
    if (!address) return
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  if (!ready) {
    return <p className="py-2 text-center text-xs text-luff-muted">Loading Privy…</p>
  }

  if (!authenticated) {
    return (
      <div className="text-center">
        <p className="mb-2 text-xs text-luff-muted">
          Sign in to get your own managed sniper wallet — no seed phrase, no key to paste.
        </p>
        <button onClick={login} className="btn-primary mx-auto flex items-center gap-2 text-sm">
          <LogIn className="h-4 w-4" /> Sign in to get wallet
        </button>
      </div>
    )
  }

  if (!address) {
    return (
      <p className="flex items-center justify-center gap-2 py-2 text-xs text-luff-muted">
        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Creating your wallet…
      </p>
    )
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1.5 text-xs text-luff-up">
        <ShieldCheck className="h-3.5 w-3.5" />
        Managed wallet ready — auto-signs snipes, no popups.
      </div>

      {/* Address + deposit */}
      <div className="rounded-lg border border-luff-border bg-white/[0.03] p-2.5">
        <div className="mb-1 text-[11px] text-luff-muted">Your sniper wallet — deposit SOL here</div>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-mono text-xs">{address}</span>
          <button onClick={copy} className="shrink-0 rounded-md p-1 text-luff-muted hover:text-luff-red" aria-label="Copy">
            {copied ? <Check className="h-4 w-4 text-luff-up" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-luff-muted">
          Balance: <span className="font-semibold text-luff-text">{balance != null ? `${balance.toFixed(4)} SOL` : '—'}</span>
        </span>
        <div className="flex items-center gap-2">
          <button onClick={refreshBalance} className="inline-flex items-center gap-1 text-luff-muted hover:text-luff-red">
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
          <button onClick={logout} className="inline-flex items-center gap-1 text-luff-muted hover:text-luff-down">
            <LogOut className="h-3 w-3" /> Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
