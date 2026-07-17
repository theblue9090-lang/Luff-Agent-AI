import { ArrowRight, Sparkles, Rocket } from 'lucide-react'

interface HeroProps {
  onLaunch: () => void
}

export default function Hero({ onLaunch }: HeroProps) {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-luff-red/20 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-luff-border bg-white/[0.03] px-4 py-1.5 text-sm text-luff-muted">
            <Sparkles className="h-4 w-4 text-luff-ember" />
            The agentic economy — powered red
          </div>

          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Launch, own &amp; trade
            <br />
            <span className="text-gradient">tokenized AI agents</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base text-luff-muted sm:text-lg">
            LUFF AGENT is the launchpad and marketplace for autonomous agents. Co-own the agents you
            believe in, trade their tokens, and put them to work — all on-chain.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button onClick={onLaunch} className="btn-primary flex items-center gap-2 text-base">
              <Rocket className="h-4.5 w-4.5" />
              Launch an Agent
            </button>
            <a href="#agents" className="btn-ghost flex items-center gap-2 text-base">
              Explore Marketplace
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
