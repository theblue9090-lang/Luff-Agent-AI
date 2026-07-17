import Modal from './Modal'

interface WalletModalProps {
  open: boolean
  onClose: () => void
  onSelect: (wallet: string) => void
}

const WALLETS = [
  { name: 'MetaMask', glyph: '🦊', desc: 'Most popular EVM wallet' },
  { name: 'Coinbase Wallet', glyph: '🔵', desc: 'Connect with Coinbase' },
  { name: 'WalletConnect', glyph: '🔗', desc: 'Scan with any mobile wallet' },
  { name: 'Rabby', glyph: '🐰', desc: 'Multi-chain DeFi wallet' },
]

export default function WalletModal({ open, onClose, onSelect }: WalletModalProps) {
  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <h2 className="font-display text-xl font-bold">Connect wallet</h2>
      <p className="mt-1 text-sm text-luff-muted">
        Connect to trade agents, pledge to Genesis and claim points.
      </p>

      <div className="mt-5 grid gap-2">
        {WALLETS.map((w) => (
          <button
            key={w.name}
            onClick={() => onSelect(w.name)}
            className="group flex items-center gap-3 rounded-2xl border border-luff-border bg-white/[0.02] p-3.5 text-left transition-all hover:border-luff-red/50 hover:bg-white/[0.04]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.04] text-2xl">
              {w.glyph}
            </span>
            <div className="flex-1">
              <div className="font-semibold">{w.name}</div>
              <div className="text-xs text-luff-muted">{w.desc}</div>
            </div>
            <span className="text-luff-muted transition-colors group-hover:text-luff-red">→</span>
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-luff-muted/70">
        Demo experience — no real wallet connection is made.
      </p>
    </Modal>
  )
}
