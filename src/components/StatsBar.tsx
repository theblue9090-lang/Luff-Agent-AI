import { TrendingUp, Users, Boxes, DollarSign } from 'lucide-react'

interface Stat {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}

interface StatsBarProps {
  totalMcap: string
  totalVolume: string
  agentCount: number
  holders: string
}

export default function StatsBar({ totalMcap, totalVolume, agentCount, holders }: StatsBarProps) {
  const stats: Stat[] = [
    { label: 'Total Market Cap', value: totalMcap, icon: DollarSign },
    { label: '24h Volume', value: totalVolume, icon: TrendingUp },
    { label: 'Active Agents', value: `${agentCount}`, icon: Boxes },
    { label: 'Total Holders', value: holders, icon: Users },
  ]

  return (
    <section className="mx-auto -mt-2 max-w-7xl px-4 sm:px-6">
      <div
        className="grid grid-cols-2 gap-3 rounded-2xl border border-luff-border bg-white/[0.02] p-3 backdrop-blur-xl sm:grid-cols-4 sm:gap-4 sm:p-4"
        data-reveal
      >
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-transform duration-300 hover:-translate-y-0.5"
            data-reveal
            style={{ '--reveal-delay': `${i * 80}ms` } as React.CSSProperties}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-luff-red/10 text-luff-red">
              <s.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate font-display text-lg font-bold sm:text-xl">{s.value}</div>
              <div className="truncate text-xs text-luff-muted">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
