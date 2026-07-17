interface AgentAvatarProps {
  gradient: string
  glyph: string
  size?: number
  className?: string
}

export default function AgentAvatar({ gradient, glyph, size = 44, className = '' }: AgentAvatarProps) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl shadow-glow-sm ${className}`}
      style={{ background: gradient, width: size, height: size }}
    >
      <span style={{ fontSize: size * 0.5 }} className="drop-shadow">
        {glyph}
      </span>
      <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/15" />
    </div>
  )
}
