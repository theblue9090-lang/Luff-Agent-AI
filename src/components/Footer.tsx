const LINKS = {
  Product: ['Marketplace', 'Genesis', 'Leaderboard', 'Points', 'API'],
  Developers: ['Docs', 'Agent SDK', 'GitHub', 'Bug Bounty'],
  Company: ['About', 'Blog', 'Careers', 'Brand Kit'],
  Community: ['X / Twitter', 'Discord', 'Telegram', 'Mirror'],
}

export default function Footer() {
  return (
    <footer className="border-t border-luff-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div>
            <a href="#top" className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="LUFF AGENT" className="h-9 w-9" />
              <div>
                <span className="font-display text-lg font-bold">LUFF</span>
                <span className="ml-1 font-display text-lg font-bold text-gradient">AGENT</span>
              </div>
            </a>
            <p className="mt-4 max-w-xs text-sm text-luff-muted">
              The launchpad and marketplace for tokenized AI agents. The agentic economy, powered red.
            </p>
          </div>

          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <h4 className="text-sm font-semibold">{group}</h4>
              <ul className="mt-3 space-y-2">
                {items.map((i) => (
                  <li key={i}>
                    <a href="#" className="text-sm text-luff-muted transition-colors hover:text-luff-red">
                      {i}
                    </a>
                  </li>
                ))}
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
