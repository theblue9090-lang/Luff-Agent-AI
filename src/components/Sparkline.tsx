interface SparklineProps {
  data: number[]
  positive: boolean
  width?: number
  height?: number
}

export default function Sparkline({ data, positive, width = 120, height = 40 }: SparklineProps) {
  if (data.length === 0) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = width / (data.length - 1)

  const points = data.map((d, i) => {
    const x = i * stepX
    const y = height - ((d - min) / range) * height
    return [x, y] as const
  })

  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} ${width},${height} 0,${height}`
  const color = positive ? '#28D67B' : '#FF5A5F'
  const gid = `spark-${positive ? 'up' : 'down'}`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gid})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="2.4" fill={color} />
    </svg>
  )
}
