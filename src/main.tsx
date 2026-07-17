import { Buffer } from 'buffer'
import { StrictMode } from 'react'
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

const tree = (
  <WalletProvider>
    <App />
  </WalletProvider>
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {PRIVY_APP_ID ? (
      <PrivyProvider appId={PRIVY_APP_ID} config={privyConfig}>
        {tree}
      </PrivyProvider>
    ) : (
      tree
    )}
  </StrictMode>,
)
