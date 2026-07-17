import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { networks, type Network } from '../data/networks'

interface NetworkSwitcherProps {
  network: Network
  onChange: (n: Network) => void
  className?: string
}

export default function NetworkSwitcher({ network, onChange, className = '' }: NetworkSwitcherProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-luff-border bg-white/[0.03] px-3 py-2 text-sm font-medium transition-colors hover:border-luff-red/40"
      >
        <span
          className="flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-bold text-white"
          style={{ background: network.gradient }}
        >
          {network.glyph}
        </span>
        <span className="hidden md:inline">{network.name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-luff-muted" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-luff-border bg-luff-surface p-1.5 shadow-card">
            <div className="px-2.5 py-1.5 text-xs font-medium text-luff-muted">Select network</div>
            {networks.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  onChange(n)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors hover:bg-white/5"
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
                  style={{ background: n.gradient }}
                >
                  {n.glyph}
                </span>
                <span className="flex-1 text-left">
                  <span className="block font-medium">{n.name}</span>
                  <span className="block text-[11px] text-luff-muted">{n.symbol}</span>
                </span>
                {n.id === network.id && <Check className="h-4 w-4 text-luff-red" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
