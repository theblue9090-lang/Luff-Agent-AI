import type { CSSProperties } from 'react'
import { Star, BadgeCheck, ArrowUpRight } from 'lucide-react'
import type { Agent } from '../data/agents'
import { sparkFor } from '../data/agents'
import { formatUSD, formatPrice, formatPct, formatNumber } from '../lib/format'
import Sparkline from './Sparkline'
import AgentAvatar from './AgentAvatar'

interface AgentCardProps {
  agent: Agent
  starred: boolean
  onStar: (id: string) => void
  onOpen: (agent: Agent) => void
  index?: number
}

export default function AgentCard({ agent, starred, onStar, onOpen, index = 0 }: AgentCardProps) {
  const up = agent.change24h >= 0
  const spark = sparkFor(agent.id, agent.change24h)

  return (
    <button
      onClick={() => onOpen(agent)}
      data-reveal="scale"
      style={{ '--reveal-delay': `${(index % 4) * 70}ms` } as CSSProperties}
      className="group card-hover glass relative flex flex-col rounded-2xl p-4 text-left"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <AgentAvatar gradient={agent.gradient} glyph={agent.glyph} size={46} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-semibold">{agent.name}</h3>
            {agent.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-luff-red" />}
          </div>
          <div className="flex items-center gap-2 text-xs text-luff-muted">
            <span className="font-mono">${agent.ticker}</span>
            <span className="h-1 w-1 rounded-full bg-luff-muted/50" />
            <span>{agent.category}</span>
          </div>
        </div>
        <span
          onClick={(e) => {
            e.stopPropagation()
            onStar(agent.id)
          }}
          className="rounded-lg p-1 text-luff-muted transition-colors hover:text-luff-ember"
          role="button"
          aria-label="Watchlist"
        >
          <Star className={`h-4 w-4 ${starred ? 'fill-luff-ember text-luff-ember' : ''}`} />
        </span>
      </div>

      {/* Type badge */}
      <div className="mt-3 flex items-center gap-2">
        <span
          className={`chip ${
            agent.type === 'Sentient'
              ? 'border-luff-red/40 bg-luff-red/10 text-luff-red'
              : 'border-luff-ember/40 bg-luff-ember/10 text-luff-ember'
          }`}
        >
          {agent.type}
        </span>
        <span className="chip border-luff-border bg-white/[0.02] text-luff-muted">
          {formatNumber(agent.holders)} holders
        </span>
      </div>

      {/* Chart */}
      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="font-display text-xl font-bold">{formatPrice(agent.price)}</div>
          <div className={`mt-0.5 text-sm font-semibold ${up ? 'text-luff-up' : 'text-luff-down'}`}>
            {formatPct(agent.change24h)}
          </div>
        </div>
        <Sparkline data={spark} positive={up} />
      </div>

      {/* Footer stats */}
      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-luff-border pt-3 text-xs">
        <div>
          <div className="text-luff-muted">Market Cap</div>
          <div className="font-semibold">{formatUSD(agent.marketCap)}</div>
        </div>
        <div>
          <div className="text-luff-muted">24h Vol</div>
          <div className="font-semibold">{formatUSD(agent.volume24h)}</div>
        </div>
      </div>

      <span className="pointer-events-none absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
        <ArrowUpRight className="h-4 w-4 text-luff-red" />
      </span>
    </button>
  )
}
