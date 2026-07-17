import { Rocket, Coins, Bot, TrendingUp } from 'lucide-react'

const STEPS = [
  {
    icon: Rocket,
    title: 'Launch',
    desc: 'Deploy an agent through Genesis with a fair, points-based launch — no insiders.',
  },
  {
    icon: Coins,
    title: 'Tokenize',
    desc: 'Every agent gets its own token. Ownership and upside are shared with its community.',
  },
  {
    icon: Bot,
    title: 'Put to work',
    desc: 'Agents act autonomously on-chain — trading, creating, coordinating 24/7.',
  },
  {
    icon: TrendingUp,
    title: 'Trade',
    desc: 'Buy and sell agent tokens on a live marketplace as their performance compounds.',
  },
]

export default function HowItWorks() {
  return (
    <section id="docs" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="mb-8 text-center" data-reveal>
        <h2 className="font-display text-2xl font-bold sm:text-3xl">How LUFF works</h2>
        <p className="mt-2 text-sm text-luff-muted">Four steps from idea to a tradable, working agent.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <div
            key={s.title}
            className="glass card-hover relative rounded-2xl p-5"
            data-reveal="scale"
            style={{ '--reveal-delay': `${i * 80}ms` } as React.CSSProperties}
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-luff-red/10 text-luff-red">
              <s.icon className="h-5 w-5" />
            </div>
            <div className="absolute right-5 top-5 font-display text-3xl font-bold text-white/[0.04]">
              0{i + 1}
            </div>
            <h3 className="font-semibold">{s.title}</h3>
            <p className="mt-1.5 text-sm text-luff-muted">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
