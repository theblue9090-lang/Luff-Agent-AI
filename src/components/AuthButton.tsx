import { useState } from 'react'
import { LogIn, LogOut, Copy, Check, ChevronDown, Wallet, PieChart, RefreshCw } from 'lucide-react'
import { useLuffWallet } from '../wallet/wallet'
import { shortAddress } from '../lib/format'

export default function AuthButton({ full = false }: { full?: boolean }) {
  const w = useLuffWallet()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const copy = () => {
    if (!w.address) return
    navigator.clipboard.writeText(w.address).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  if (!w.authenticated) {
    return (
      <button
        onClick={w.login}
        className={`btn-primary flex items-center justify-center gap-2 ${full ? 'w-full' : ''}`}
      >
        <LogIn className="h-4 w-4" />
        Log in
      </button>
    )
  }

  return (
    <div className={`relative ${full ? 'w-full' : ''}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-full border border-luff-border bg-white/[0.04] px-3 py-2 text-sm font-medium transition-colors hover:border-luff-red/40 ${full ? 'w-full justify-between' : ''}`}
      >
        <span className="flex items-center gap-1.5">
          <Wallet className="h-4 w-4 text-luff-red" />
          {w.balance != null ? `${w.balance.toFixed(2)} SOL` : '…'}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-luff-muted" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className={`absolute z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-luff-border bg-luff-surface p-3 shadow-card ${full ? 'left-0 right-0 w-auto' : 'right-0'}`}>
            {w.userLabel && <div className="mb-2 truncate px-1 text-sm font-semibold">{w.userLabel}</div>}

            <div className="rounded-xl border border-luff-border bg-white/[0.03] p-3">
              <div className="mb-1 text-[11px] text-luff-muted">Your wallet — deposit SOL here</div>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-mono text-xs">{w.address ? shortAddress(w.address) : '—'}</span>
                <button onClick={copy} className="shrink-0 rounded-md p-1 text-luff-muted hover:text-luff-red" aria-label="Copy address">
                  {copied ? <Check className="h-4 w-4 text-luff-up" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-luff-muted">
                  Balance <span className="font-semibold text-luff-text">{w.balance != null ? `${w.balance.toFixed(4)} SOL` : '—'}</span>
                </span>
                <button onClick={w.refresh} className="inline-flex items-center gap-1 text-luff-muted hover:text-luff-red">
                  <RefreshCw className="h-3 w-3" /> Refresh
                </button>
              </div>
            </div>

            <a
              href="#portfolio"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-luff-text transition-colors hover:bg-white/5"
            >
              <PieChart className="h-4 w-4 text-luff-red" /> View portfolio
            </a>
            <button
              onClick={() => {
                w.logout()
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-luff-muted transition-colors hover:bg-white/5 hover:text-luff-down"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
