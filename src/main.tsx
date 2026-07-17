import { Buffer } from 'buffer'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// @solana/web3.js expects a global Buffer in the browser
if (!(globalThis as unknown as { Buffer?: unknown }).Buffer) {
  ;(globalThis as unknown as { Buffer: typeof Buffer }).Buffer = Buffer
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
