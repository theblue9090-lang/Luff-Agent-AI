import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { usePrivy, useLoginWithOAuth } from '@privy-io/react-auth'
import { useSolanaWallets } from '@privy-io/react-auth/solana'
import { Connection, PublicKey, type VersionedTransaction } from '@solana/web3.js'
import type { WalletSigner } from '../lib/sniperExecutor'
import { RPC_ENDPOINT } from '../lib/jupiter'
import { PRIVY_ENABLED } from '../lib/privy'

export type OAuthProvider = 'google' | 'twitter'

export interface LuffWallet {
  enabled: boolean
  ready: boolean
  authenticated: boolean
  address: string | null
  balance: number | null
  connection: Connection
  signer: WalletSigner | null
  userLabel: string | null
  login: () => void
  loginWith: (p: OAuthProvider) => void
  logout: () => void
  refresh: () => Promise<void>
}

const sharedConnection = new Connection(RPC_ENDPOINT, 'confirmed')

const disabledWallet: LuffWallet = {
  enabled: false,
  ready: true,
  authenticated: false,
  address: null,
  balance: null,
  connection: sharedConnection,
  signer: null,
  userLabel: null,
  login: () => undefined,
  loginWith: () => undefined,
  logout: () => undefined,
  refresh: async () => undefined,
}

const WalletCtx = createContext<LuffWallet>(disabledWallet)

export function useLuffWallet(): LuffWallet {
  return useContext(WalletCtx)
}

export function WalletProvider({ children }: { children: ReactNode }) {
  return PRIVY_ENABLED ? (
    <PrivyBridge>{children}</PrivyBridge>
  ) : (
    <WalletCtx.Provider value={disabledWallet}>{children}</WalletCtx.Provider>
  )
}

function PrivyBridge({ children }: { children: ReactNode }) {
  const { ready, authenticated, user, login, logout } = usePrivy()
  const { initOAuth } = useLoginWithOAuth()
  const { wallets, createWallet, ready: walletsReady } = useSolanaWallets()

  const [balance, setBalance] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)

  const wallet = wallets[0]
  const address = wallet?.address ?? null

  // give every logged-in user a Solana embedded wallet
  useEffect(() => {
    if (authenticated && walletsReady && wallets.length === 0 && !creating) {
      setCreating(true)
      Promise.resolve(createWallet())
        .catch(() => undefined)
        .finally(() => setCreating(false))
    }
  }, [authenticated, walletsReady, wallets.length, creating, createWallet])

  const signer = useMemo<WalletSigner | null>(() => {
    if (!wallet || !address) return null
    return {
      publicKey: address,
      async signAndSend(tx: VersionedTransaction, conn: Connection) {
        return wallet.sendTransaction(tx, conn, { skipPreflight: true })
      },
    }
  }, [wallet, address])

  const refresh = useCallback(async () => {
    if (!address) {
      setBalance(null)
      return
    }
    try {
      setBalance((await sharedConnection.getBalance(new PublicKey(address))) / 1e9)
    } catch {
      setBalance(null)
    }
  }, [address])

  useEffect(() => {
    void refresh()
    if (!address) return
    const t = setInterval(refresh, 15_000)
    return () => clearInterval(t)
  }, [refresh, address])

  const userLabel = useMemo(() => {
    if (!user) return null
    const tw = user.twitter?.username ? `@${user.twitter.username}` : user.twitter?.name
    return user.google?.name || user.google?.email || tw || user.email?.address || 'Account'
  }, [user])

  const value = useMemo<LuffWallet>(
    () => ({
      enabled: true,
      ready,
      authenticated,
      address,
      balance,
      connection: sharedConnection,
      signer,
      userLabel: userLabel ?? null,
      login: () => login(),
      loginWith: (p: OAuthProvider) => {
        initOAuth({ provider: p }).catch(() => undefined)
      },
      logout: () => logout(),
      refresh,
    }),
    [ready, authenticated, address, balance, signer, userLabel, login, logout, initOAuth, refresh],
  )

  return <WalletCtx.Provider value={value}>{children}</WalletCtx.Provider>
}
