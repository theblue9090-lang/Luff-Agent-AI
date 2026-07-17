import { BadgeCheck, TrendingUp } from 'lucide-react'
import type { Agent } from '../data/agents'
import { sparkFor } from '../data/agents'
import { formatUSD, formatPrice, formatPct, formatNumber } from '../lib/format'
import Modal from './Modal'
import Sparkline from './Sparkline'
import AgentAvatar from './AgentAvatar'

interface AgentModalProps {
  agent: Agent | null
  onClose: () => void
  onTrade: (side: 'buy' | 'sell', agent: Agent) => void
}

export default function AgentModal({ agent, onClose, onTrade }: AgentModalProps) {
  if (!agent) return null
  const up = agent.change24h >= 0
  const spark = sparkFor(agent.id, agent.change24h)

  const stats = [
    { label: 'Market Cap', value: formatUSD(agent.marketCap) },
    { label: '24h Volume', value: formatUSD(agent.volume24h) },
    { label: 'Holders', value: formatNumber(agent.holders) },
    { label: 'Age', value: `${agent.createdDaysAgo}d` },
  ]

  return (
    <Modal open={!!agent} onClose={onClose} maxWidth="max-w-xl">
      <div className="flex items-center gap-3">
        <AgentAvatar gradient={agent.gradient} glyph={agent.glyph} size={56} />
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="font-display text-xl font-bold">{agent.name}</h2>
            {agent.verified && <BadgeCheck className="h-5 w-5 text-luff-red" />}
          </div>
          <div className="flex items-center gap-2 text-sm text-luff-muted">
            <span className="font-mono">${agent.ticker}</span>
            <span className="chip border-luff-red/40 bg-luff-red/10 text-luff-red">{agent.type}</span>
            <span>{agent.category}</span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-luff-muted">{agent.description}</p>

      {/* Price + chart */}
      <div className="mt-5 flex items-end justify-between rounded-2xl border border-luff-border bg-white/[0.02] p-4">
        <div>
          <div className="text-xs text-luff-muted">Price</div>
          <div className="font-display text-2xl font-bold">{formatPrice(agent.price)}</div>
          <div className={`flex items-center gap-1 text-sm font-semibold ${up ? 'text-luff-up' : 'text-luff-down'}`}>
            <TrendingUp className={`h-4 w-4 ${up ? '' : 'rotate-180'}`} />
            {formatPct(agent.change24h)} (24h)
          </div>
        </div>
        <Sparkline data={spark} positive={up} width={180} height={64} />
      </div>

      {/* Stat grid */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-luff-border bg-white/[0.02] p-3 text-center">
            <div className="font-display text-base font-bold">{s.value}</div>
            <div className="mt-0.5 text-[11px] text-luff-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Trade buttons */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={() => onTrade('buy', agent)}
          className="btn-primary flex items-center justify-center"
        >
          Buy ${agent.ticker}
        </button>
        <button
          onClick={() => onTrade('sell', agent)}
          className="btn-ghost flex items-center justify-center"
        >
          Sell
        </button>
      </div>
    </Modal>
  )
}
