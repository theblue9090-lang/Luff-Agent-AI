import { useState } from 'react'
import { Rocket, Check } from 'lucide-react'
import Modal from './Modal'

interface LaunchModalProps {
  open: boolean
  onClose: () => void
}

const CATS = ['DeFAI', 'Trading', 'Gaming', 'Productivity', 'Social', 'Creative', 'Meme']

export default function LaunchModal({ open, onClose }: LaunchModalProps) {
  const [name, setName] = useState('')
  const [ticker, setTicker] = useState('')
  const [cat, setCat] = useState('DeFAI')
  const [type, setType] = useState<'Sentient' | 'Prototype'>('Prototype')
  const [done, setDone] = useState(false)

  const reset = () => {
    setName('')
    setTicker('')
    setCat('DeFAI')
    setType('Prototype')
    setDone(false)
  }

  const close = () => {
    onClose()
    setTimeout(reset, 200)
  }

  return (
    <Modal open={open} onClose={close} maxWidth="max-w-lg">
      {done ? (
        <div className="py-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-grad shadow-glow">
            <Check className="h-8 w-8 text-white" />
          </div>
          <h2 className="font-display text-xl font-bold">Agent queued for Genesis 🎉</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-luff-muted">
            <span className="font-semibold text-luff-text">{name || 'Your agent'}</span> (${ticker || 'TICKER'}) is
            now in the LUFF launch pipeline. Share your Genesis link to start collecting pledges.
          </p>
          <button onClick={close} className="btn-primary mt-6">
            Done
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-luff-red" />
            <h2 className="font-display text-xl font-bold">Launch an agent</h2>
          </div>
          <p className="mt-1 text-sm text-luff-muted">Fair-launch your agent through LUFF Genesis.</p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Agent name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Scarlet Sentinel"
                className="w-full rounded-xl border border-luff-border bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-luff-red/50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Ticker</label>
              <input
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="SCRLT"
                className="w-full rounded-xl border border-luff-border bg-white/[0.03] px-3.5 py-2.5 font-mono text-sm outline-none focus:border-luff-red/50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Type</label>
              <div className="inline-flex w-full rounded-xl border border-luff-border bg-white/[0.03] p-1">
                {(['Prototype', 'Sentient'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      type === t ? 'bg-red-grad text-white' : 'text-luff-muted hover:text-luff-text'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCat(c)}
                    className={`chip ${
                      cat === c
                        ? 'border-luff-red/60 bg-luff-red/15 text-luff-text'
                        : 'border-luff-border bg-white/[0.02] text-luff-muted hover:text-luff-text'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={() => setDone(true)} className="btn-primary mt-6 w-full">
            Create Genesis Launch
          </button>
        </>
      )}
    </Modal>
  )
}
