import { Buffer } from 'buffer'
import { Component, StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { PrivyProvider } from '@privy-io/react-auth'
import './index.css'
import App from './App.tsx'
import { PRIVY_APP_ID, privyConfig } from './lib/privy'
import { WalletProvider } from './wallet/wallet'

// @solana/web3.js expects a global Buffer in the browser
if (!(globalThis as unknown as { Buffer?: unknown }).Buffer) {
  ;(globalThis as unknown as { Buffer: typeof Buffer }).Buffer = Buffer
}

// If Privy fails to initialize (e.g. a bad app ID), keep the site working
// without login instead of blanking the whole page.
class PrivyBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err: unknown) {
    console.error('Privy failed to initialize — running without login.', err)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

const withoutPrivy = (
  <WalletProvider forceDisabled>
    <App />
  </WalletProvider>
)

const root = PRIVY_APP_ID ? (
  <PrivyBoundary fallback={withoutPrivy}>
    <PrivyProvider appId={PRIVY_APP_ID} config={privyConfig}>
      <WalletProvider>
        <App />
      </WalletProvider>
    </PrivyProvider>
  </PrivyBoundary>
) : (
  withoutPrivy
)

createRoot(document.getElementById('root')!).render(<StrictMode>{root}</StrictMode>)
