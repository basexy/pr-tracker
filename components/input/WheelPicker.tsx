'use client'

import Icon from '@/components/Icon'

interface WheelPickerProps {
  value: number
  setValue: (v: number) => void
  step: number
  unit: string
  delta: number
  isPR: boolean
}

export default function WheelPicker({ value, setValue, step, unit, delta, isPR }: WheelPickerProps) {
  const values: number[] = []
  for (let i = -3; i <= 3; i++) values.push(+(value + i * step).toFixed(2))

  const scale = (i: number) => {
    const dist = Math.abs(i - 3)
    return {
      fontSize: i === 3 ? 32 : 22 - dist * 2,
      fontWeight: (i === 3 ? 700 : 500) as number,
      color: i === 3 ? 'var(--ink)' : `rgba(122,116,104,${1 - dist * 0.22})`,
    }
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 999,
          background: isPR ? 'var(--lime)' : 'var(--surface-2)',
          color: isPR ? 'var(--lime-on)' : 'var(--muted)',
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
          whiteSpace: 'nowrap',
        }}>
          {isPR && <Icon name="flash" size={12} stroke={2.5} />}
          {delta > 0
            ? `+${delta.toFixed(delta % 1 ? 1 : 0)}${unit === 'reps' ? ' reps' : 'kg'} vs PR`
            : delta === 0 ? '= PR attuale'
            : `${delta.toFixed(delta % 1 ? 1 : 0)} vs PR`}
        </span>
      </div>
      <div className="wheel">
        <div className="band" />
        <ul>
          {values.map((v, i) => (
            <li key={i} style={scale(i)} onClick={() => setValue(v)}>
              {v}<span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 5, fontWeight: 500 }}>{unit}</span>
            </li>
          ))}
        </ul>
        <div className="fade-t" /><div className="fade-b" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14 }}>
        {[-step * 2, -step, +step, +step * 2].map((s, i) => (
          <button key={i}
            onClick={() => setValue(+(value + s).toFixed(2))}
            style={{
              appearance: 'none', cursor: 'pointer',
              padding: '8px 14px', borderRadius: 999,
              background: 'var(--surface)', border: '1px solid var(--line)',
              fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600,
              color: 'var(--ink)',
            }}>{s > 0 ? '+' + s : s}</button>
        ))}
      </div>
    </div>
  )
}
