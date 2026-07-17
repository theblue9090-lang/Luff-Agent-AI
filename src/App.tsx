import { useMemo, useState } from 'react'
import { agents as seedAgents, type Agent } from './data/agents'
import { useLivePrices } from './hooks/useLivePrices'
import { formatUSD, formatNumber, shortAddress } from './lib/format'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import StatsBar from './components/StatsBar'
import FilterBar, { type TypeFilter, type SortKey } from './components/FilterBar'
import AgentCard from './components/AgentCard'
import GenesisSection from './components/GenesisSection'
import HowItWorks from './components/HowItWorks'
import Footer from './components/Footer'
import AgentModal from './components/AgentModal'
import WalletModal from './components/WalletModal'
import LaunchModal from './components/LaunchModal'
import Toast from './components/Toast'

export default function App() {
  const liveAgents = useLivePrices(seedAgents)

  // UI state
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState<SortKey>('trending')
  const [starred, setStarred] = useState<Set<string>>(new Set(['luffy']))
  const [selected, setSelected] = useState<Agent | null>(null)
  const [walletOpen, setWalletOpen] = useState(false)
  const [launchOpen, setLaunchOpen] = useState(false)
  const [connected, setConnected] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const toggleStar = (id: string) =>
    setStarred((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  // Derived: filter + sort
  const visible = useMemo(() => {
    let list = liveAgents.filter((a) => {
      const matchesType = typeFilter === 'All' || a.type === typeFilter
      const matchesCat = category === 'All' || a.category === category
      const q = query.trim().toLowerCase()
      const matchesQuery =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.ticker.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      return matchesType && matchesCat && matchesQuery
    })

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'marketCap':
          return b.marketCap - a.marketCap
        case 'gainers':
          return b.change24h - a.change24h
        case 'new':
          return a.createdDaysAgo - b.createdDaysAgo
        default: // trending = volume weighted
          return b.volume24h - a.volume24h
      }
    })
    return list
  }, [liveAgents, typeFilter, category, query, sort])

  // Aggregate stats
  const stats = useMemo(() => {
    const mcap = liveAgents.reduce((s, a) => s + a.marketCap, 0)
    const vol = liveAgents.reduce((s, a) => s + a.volume24h, 0)
    const holders = liveAgents.reduce((s, a) => s + a.holders, 0)
    return {
      mcap: formatUSD(mcap),
      vol: formatUSD(vol),
      holders: formatNumber(holders),
    }
  }, [liveAgents])

  // Handlers
  const handleWalletSelect = (wallet: string) => {
    const addr = '0x' + Math.random().toString(16).slice(2, 10) + '9a4f'
    setConnected(shortAddress(addr))
    setWalletOpen(false)
    setToast(`${wallet} connected · ${shortAddress(addr)}`)
  }

  const handleConnect = () => {
    if (connected) {
      setConnected(null)
      setToast('Wallet disconnected')
    } else {
      setWalletOpen(true)
    }
  }

  const handleTrade = (side: 'buy' | 'sell', agent: Agent) => {
    if (!connected) {
      setSelected(null)
      setWalletOpen(true)
      setToast('Connect a wallet to trade')
      return
    }
    setSelected(null)
    setToast(`${side === 'buy' ? 'Bought' : 'Sold'} $${agent.ticker} · order simulated`)
  }

  return (
    <div className="min-h-screen">
      <Navbar query={query} onQuery={setQuery} onConnect={handleConnect} connected={connected} />

      <main>
        <Hero onLaunch={() => setLaunchOpen(true)} />
        <StatsBar
          totalMcap={stats.mcap}
          totalVolume={stats.vol}
          agentCount={liveAgents.length}
          holders={stats.holders}
        />

        {/* Marketplace */}
        <section id="agents" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="trending" className="font-display text-2xl font-bold sm:text-3xl">
                Agent marketplace
              </h2>
              <p className="mt-1 text-sm text-luff-muted">
                {visible.length} agent{visible.length !== 1 && 's'} · live prices
                <span className="ml-2 inline-flex items-center gap-1.5 align-middle">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-luff-up/70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-luff-up" />
                  </span>
                </span>
              </p>
            </div>
          </div>

          <FilterBar
            typeFilter={typeFilter}
            onType={setTypeFilter}
            category={category}
            onCategory={setCategory}
            sort={sort}
            onSort={setSort}
          />

          {visible.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((a) => (
                <AgentCard
                  key={a.id}
                  agent={a}
                  starred={starred.has(a.id)}
                  onStar={toggleStar}
                  onOpen={setSelected}
                />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-luff-border bg-white/[0.02] py-16 text-center">
              <div className="text-4xl">🔍</div>
              <p className="mt-3 font-semibold">No agents match your filters</p>
              <p className="mt-1 text-sm text-luff-muted">Try a different category or search term.</p>
              <button
                onClick={() => {
                  setQuery('')
                  setCategory('All')
                  setTypeFilter('All')
                }}
                className="btn-ghost mt-5"
              >
                Reset filters
              </button>
            </div>
          )}
        </section>

        <GenesisSection onPledge={(name) => setToast(`Pledged 500 points to ${name} 🔥`)} />
        <HowItWorks />

        {/* Leaderboard CTA */}
        <section id="points" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-luff-red/30 bg-gradient-to-br from-luff-red/15 via-luff-crimson/10 to-transparent p-8 sm:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-luff-red/25 blur-3xl" />
            <div className="relative max-w-lg">
              <h2 className="font-display text-2xl font-bold sm:text-3xl">Earn LUFF Points</h2>
              <p className="mt-2 text-luff-muted">
                Trade agents, pledge to Genesis launches and refer friends to climb the leaderboard.
                Points convert to allocation in every future launch.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => setLaunchOpen(true)} className="btn-primary">
                  Start earning
                </button>
                <button onClick={handleConnect} className="btn-ghost">
                  {connected ? 'Wallet connected' : 'Connect wallet'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Overlays */}
      <AgentModal agent={selected} onClose={() => setSelected(null)} onTrade={handleTrade} />
      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} onSelect={handleWalletSelect} />
      <LaunchModal open={launchOpen} onClose={() => setLaunchOpen(false)} />
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  )
}
