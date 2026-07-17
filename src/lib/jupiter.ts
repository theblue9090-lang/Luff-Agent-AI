// Loads the Jupiter Plugin (formerly Terminal) — an embeddable, self-contained
// swap widget for Solana. It handles wallet connection (Phantom, Solflare, …),
// routing and on-chain execution, so users can buy/sell real tokens on our site.
// Docs: https://station.jup.ag/docs/tool-kits/jupiter-plugin

declare global {
  interface Window {
    Jupiter?: {
      init: (opts: Record<string, unknown>) => void
      close?: () => void
      resume?: () => void
    }
  }
}

const PLUGIN_SRC = 'https://plugin.jup.ag/plugin-v1.js'

export const SOL_MINT = 'So11111111111111111111111111111111111111112'

// A dedicated RPC is strongly recommended for reliable swaps. Set VITE_SOLANA_RPC
// (e.g. a Helius / QuickNode / Triton URL). Falls back to the public endpoint.
export const RPC_ENDPOINT =
  (import.meta.env.VITE_SOLANA_RPC as string | undefined) || 'https://api.mainnet-beta.solana.com'

let loader: Promise<void> | null = null

export function loadJupiter(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if (window.Jupiter) return Promise.resolve()
  if (loader) return loader

  loader = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${PLUGIN_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Jupiter failed to load')))
      return
    }
    const s = document.createElement('script')
    s.src = PLUGIN_SRC
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => {
      loader = null
      reject(new Error('Jupiter failed to load'))
    }
    document.head.appendChild(s)
  })

  return loader
}

export {}
