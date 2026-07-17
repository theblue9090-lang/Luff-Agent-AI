import { useState } from 'react'
import { Search, Menu, X, Wallet, Zap, ChevronDown } from 'lucide-react'
import type { Network } from '../data/networks'
import NetworkSwitcher from './NetworkSwitcher'

interface NavbarProps {
  query: string
  onQuery: (q: string) => void
  onConnect: () => void
  connected: string | null
  network: Network
  onNetwork: (n: Network) => void
}

const NAV = ['Markets', 'Sniper', 'Portfolio', 'Launches', 'Agents', 'Genesis']

export default function Navbar({
  query,
  onQuery,
  onConnect,
  connected,
  network,
  onNetwork,
}: NavbarProps) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-luff-border bg-luff-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        {/* Logo */}
        <a href="#top" className="flex shrink-0 items-center gap-2.5">
          <img src="/logo.svg" alt="LUFF AGENT" className="h-9 w-9" />
          <div className="leading-none">
            <span className="font-display text-lg font-bold tracking-tight">LUFF</span>
            <span className="ml-1 font-display text-lg font-bold tracking-tight text-gradient">AGENT</span>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="rounded-full px-3 py-2 text-sm font-medium text-luff-muted transition-colors hover:bg-white/5 hover:text-luff-text"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Search */}
        <div className="relative ml-auto hidden max-w-xs flex-1 items-center md:flex">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-luff-muted" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search agents, tickers…"
            className="w-full rounded-full border border-luff-border bg-white/[0.03] py-2 pl-9 pr-3 text-sm text-luff-text placeholder:text-luff-muted/70 outline-none transition-colors focus:border-luff-red/50"
          />
        </div>

        {/* Network switcher */}
        <NetworkSwitcher network={network} onChange={onNetwork} className="hidden sm:block" />

        {/* Points pill */}
        <button className="hidden items-center gap-1.5 rounded-full border border-luff-border bg-white/[0.03] px-3 py-2 text-sm font-medium text-luff-text transition-colors hover:border-luff-red/40 lg:flex">
          <Zap className="h-4 w-4 text-luff-ember" />
          2,480
        </button>

        {/* Connect wallet */}
        <button onClick={onConnect} className="btn-primary hidden items-center gap-2 sm:flex">
          {connected ? (
            <span className="h-2 w-2 rounded-full" style={{ background: network.color }} />
          ) : (
            <Wallet className="h-4 w-4" />
          )}
          {connected ? connected : 'Connect'}
          {connected && <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-lg border border-luff-border p-2 lg:hidden"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-luff-border bg-luff-surface px-4 py-4 lg:hidden">
          <div className="relative mb-3 flex items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-luff-muted" />
            <input
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search agents…"
              className="w-full rounded-full border border-luff-border bg-white/[0.03] py-2 pl-9 pr-3 text-sm outline-none focus:border-luff-red/50"
            />
          </div>
          <nav className="grid gap-1">
            {NAV.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-luff-muted hover:bg-white/5 hover:text-luff-text"
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex items-center justify-between rounded-xl border border-luff-border bg-white/[0.03] px-3 py-2">
            <span className="text-sm text-luff-muted">Network</span>
            <NetworkSwitcher network={network} onChange={onNetwork} />
          </div>
          <button onClick={onConnect} className="btn-primary mt-3 flex w-full items-center justify-center gap-2">
            {connected ? (
              <span className="h-2 w-2 rounded-full" style={{ background: network.color }} />
            ) : (
              <Wallet className="h-4 w-4" />
            )}
            {connected ? connected : 'Connect Wallet'}
          </button>
        </div>
      )}
    </header>
  )
}
