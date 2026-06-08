'use client'

import { useState } from 'react'
import Icon from '@/components/Icon'

interface StepperProps {
  value: number
  setValue: (v: number) => void
  step: number
  unit: string
}

export default function Stepper({ value, setValue, step, unit }: StepperProps) {
  const increments = unit === 'kg' ? [0.5, 1, 2.5, 5] : [1, 2, 5, 10]
  const [chosen, setChosen] = useState(step)

  return (
    <div>
      <div className="stepper-card">
        <button className="stepper-btn" onClick={() => setValue(+(value - chosen).toFixed(2))}>
          <Icon name="minus" size={20} stroke={2.4} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase' }}>
            incremento
          </div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 700, marginTop: 4, letterSpacing: -0.5 }}>
            ± {chosen}{unit === 'kg' ? 'kg' : ''}
          </div>
        </div>
        <button className="stepper-btn plus" onClick={() => setValue(+(value + chosen).toFixed(2))}>
          <Icon name="plus" size={20} stroke={2.4} />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 12, justifyContent: 'center' }}>
        {increments.map((s) => (
          <button key={s}
            onClick={() => setChosen(s)}
            style={{
              appearance: 'none', cursor: 'pointer',
              padding: '8px 14px', borderRadius: 999,
              background: chosen === s ? 'var(--ink)' : 'var(--surface)',
              color: chosen === s ? 'var(--lime)' : 'var(--ink)',
              border: '1px solid ' + (chosen === s ? 'var(--ink)' : 'var(--line)'),
              fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600,
            }}>± {s}</button>
        ))}
      </div>
    </div>
  )
}
