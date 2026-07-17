interface FooterLink {
  label: string
  href: string
  external?: boolean
}

const LINKS: Record<string, FooterLink[]> = {
  Product: [
    { label: 'Marketplace', href: '#agents' },
    { label: 'Markets', href: '#markets' },
    { label: 'Portfolio', href: '#portfolio' },
    { label: 'Genesis', href: '#genesis' },
    { label: 'Points', href: '#points' },
  ],
  Developers: [
    { label: 'Docs', href: `${import.meta.env.BASE_URL}docs.html`, external: true },
    { label: 'Agent SDK', href: `${import.meta.env.BASE_URL}agent-sdk.html`, external: true },
  ],
  Company: [{ label: 'About', href: `${import.meta.env.BASE_URL}about.html`, external: true }],
  Community: [
    { label: 'X', href: 'https://x.com/luffagent/' },
    { label: 'Telegram', href: 'https://t.me/luffagent/' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-luff-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(4,1fr)]" data-reveal>
          <div>
            <a href="#top" className="flex items-center gap-2.5">
              <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="LUFF AGENT" className="h-9 w-9" />
              <div>
                <span className="font-display text-lg font-bold">LUFF</span>
                <span className="ml-1 font-display text-lg font-bold text-gradient">AGENT</span>
              </div>
            </a>
            <p className="mt-4 max-w-xs text-sm text-luff-muted">
              The launchpad and marketplace for tokenized AI agents.
            </p>
          </div>

          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <h4 className="text-sm font-semibold">{group}</h4>
              <ul className="mt-3 space-y-2">
                {items.map((item) => {
                  const external = item.external || item.href.startsWith('http')
                  return (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                        className="text-sm text-luff-muted transition-colors hover:text-luff-red"
                      >
                        {item.label}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-luff-border pt-6 text-sm text-luff-muted sm:flex-row">
          <span>© {new Date().getFullYear()} LUFF AGENT. All rights reserved.</span>
          <div className="flex gap-5">
            <a href="#" className="hover:text-luff-red">Terms</a>
            <a href="#" className="hover:text-luff-red">Privacy</a>
            <a href="#" className="hover:text-luff-red">Disclaimer</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
