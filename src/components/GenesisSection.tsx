import { Clock, Flame, BadgeCheck } from 'lucide-react'
import { genesisAgents } from '../data/agents'
import { formatUSD, formatNumber } from '../lib/format'
import AgentAvatar from './AgentAvatar'

interface GenesisSectionProps {
  onPledge: (name: string) => void
}

export default function GenesisSection({ onPledge }: GenesisSectionProps) {
  return (
    <section id="genesis" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="mb-6 flex items-end justify-between" data-reveal>
        <div>
          <div className="mb-1 inline-flex items-center gap-1.5 text-sm font-medium text-luff-ember">
            <Flame className="h-4 w-4" />
            LUFF Genesis
          </div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Live agent launches</h2>
          <p className="mt-1 text-sm text-luff-muted">
            Pledge points to fair-launch the next generation of agents.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {genesisAgents.map((a, i) => (
          <div
            key={a.id}
            className="glass card-hover rounded-2xl p-5"
            data-reveal="scale"
            style={{ '--reveal-delay': `${i * 90}ms` } as React.CSSProperties}
          >
            <div className="flex items-center gap-3">
              <AgentAvatar gradient={a.gradient} glyph={a.glyph} size={48} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate font-semibold">{a.name}</h3>
                  {a.verified && <BadgeCheck className="h-4 w-4 text-luff-red" />}
                </div>
                <div className="text-xs text-luff-muted">
                  ${a.ticker} · {a.type}
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-full border border-luff-ember/40 bg-luff-ember/10 px-2.5 py-1 text-xs font-medium text-luff-ember">
                <Clock className="h-3.5 w-3.5" />
                {a.endsInHours}h left
              </div>
            </div>

            <p className="mt-3 line-clamp-2 text-sm text-luff-muted">{a.description}</p>

            {/* Progress */}
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-luff-muted">Pledged</span>
                <span className="font-semibold">
                  {formatUSD(a.genesisPledged ?? 0)}{' '}
                  <span className="text-luff-muted">/ {formatUSD(a.genesisTarget ?? 0)}</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-red-grad shadow-glow-sm transition-all"
                  style={{ width: `${a.genesisProgress}%` }}
                />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-xs text-luff-muted">
                <span>{a.genesisProgress}% funded</span>
                <span>{formatNumber(a.holders)} backers</span>
              </div>
            </div>

            <button onClick={() => onPledge(a.name)} className="btn-primary mt-4 w-full">
              Pledge Points
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
