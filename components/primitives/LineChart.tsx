interface LineChartProps {
  data: number[]
  w?: number
  h?: number
  color?: string
  fill?: boolean
  dots?: boolean
}

export default function LineChart({ data, w = 320, h = 90, color, fill = true, dots = false }: LineChartProps) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data), max = Math.max(...data)
  const span = max - min || 1
  const pad = 8
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - pad * 2) + pad
    const y = h - pad - ((v - min) / span) * (h - pad * 2)
    return [x, y]
  })
  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ')
  const area = path + ` L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`
  const stroke = color || 'var(--ink)'
  return (
    <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
      {fill && <path d={area} fill={stroke} opacity={0.18} />}
      <path d={path} fill="none" stroke={stroke} strokeWidth={1.8}
        strokeLinecap="round" strokeLinejoin="round" />
      {dots && pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 4 : 2.5}
          fill={i === pts.length - 1 ? 'var(--lime)' : 'var(--surface)'}
          stroke={i === pts.length - 1 ? 'var(--ink)' : stroke}
          strokeWidth={1.5} />
      ))}
    </svg>
  )
}
