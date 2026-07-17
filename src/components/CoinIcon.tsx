import { useState } from 'react'

const GRADIENTS = [
  'linear-gradient(135deg,#FF2E3E,#FF6A3D)',
  'linear-gradient(135deg,#FF3B6B,#FF2E3E)',
  'linear-gradient(135deg,#C81E3A,#FF3B6B)',
  'linear-gradient(135deg,#FF6A3D,#FFB03A)',
  'linear-gradient(135deg,#8E1023,#FF2E3E)',
  'linear-gradient(135deg,#E01029,#FF6A3D)',
]

function gradientFor(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 997
  return GRADIENTS[h % GRADIENTS.length]
}

interface CoinIconProps {
  icon: string | null
  symbol: string
  size?: number
}

export default function CoinIcon({ icon, symbol, size = 36 }: CoinIconProps) {
  const [err, setErr] = useState(false)
  const letters = (symbol || '?').replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase() || '?'

  if (icon && !err) {
    return (
      <img
        src={icon}
        alt={symbol}
        onError={() => setErr(true)}
        width={size}
        height={size}
        loading="lazy"
        className="shrink-0 rounded-full bg-luff-card object-cover ring-1 ring-white/10"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white ring-1 ring-white/15"
      style={{ width: size, height: size, background: gradientFor(symbol), fontSize: size * 0.32 }}
    >
      {letters}
    </div>
  )
}

const CHAIN_LABEL: Record<string, string> = {
  solana: 'SOL',
  ethereum: 'ETH',
  base: 'BASE',
  bsc: 'BSC',
  arbitrum: 'ARB',
  polygon: 'POLY',
  avalanche: 'AVAX',
}

export function ChainBadge({ chainId }: { chainId: string }) {
  const label = CHAIN_LABEL[chainId] ?? chainId.slice(0, 4).toUpperCase()
  return (
    <span className="chip border-luff-border bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-luff-muted">
      {label}
    </span>
  )
}
