interface BarChartProps {
  data: number[]
  labels: string[]
  w?: number
  h?: number
}

export default function BarChart({ data, labels, w = 320, h = 90 }: BarChartProps) {
  const max = Math.max(...data)
  const barW = (w - (data.length - 1) * 8) / data.length
  return (
    <svg width={w} height={h}>
      {data.map((v, i) => {
        const bh = (v / max) * (h - 22)
        const x = i * (barW + 8)
        const y = h - bh - 16
        const last = i === data.length - 1
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} rx="3"
              fill={last ? 'var(--lime)' : 'var(--surface-2)'}
              stroke={last ? 'transparent' : 'var(--line)'} strokeWidth={1} />
            <text x={x + barW / 2} y={h - 2} fontSize="10"
              fill="var(--muted)" textAnchor="middle" fontFamily="Geist Mono">
              {labels[i]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
