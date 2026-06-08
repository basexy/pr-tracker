interface SparkProps {
  data: number[]
  w?: number
  h?: number
}

export default function Spark({ data, w = 60, h = 22 }: SparkProps) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data), max = Math.max(...data)
  const span = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - 2 - ((v - min) / span) * (h - 4)
    return [x, y]
  })
  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ')
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <path d={path} fill="none" stroke="var(--muted)" strokeWidth={1.4}
        strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={2.2}
        fill="var(--lime-deep)" />
    </svg>
  )
}
