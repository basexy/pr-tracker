'use client'

import Icon from '@/components/Icon'
import type { Exercise } from '@/lib/types'

interface CelebrationProps {
  exercise: Exercise
  currentPR: number
  value: number
  user: string
  onClose: () => void
}

export default function Celebration({ exercise, currentPR, value, user, onClose }: CelebrationProps) {
  const delta = +(value - currentPR).toFixed(1)

  return (
    <div className="screen" style={{
      background: 'var(--ink)', color: 'var(--lime)',
      position: 'absolute', inset: 0, zIndex: 200,
      overflow: 'hidden',
      animation: 'fadeUp .3s ease both',
    }}>
      {/* radial glow */}
      <div style={{
        position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, var(--lime) 0%, transparent 60%)',
        opacity: 0.18, pointerEvents: 'none',
      }} />

      {/* confetti — pointer-events none so they never block the CTA button */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2
        const cx = Math.cos(angle) * (140 + (i % 3) * 30)
        const cy = Math.sin(angle) * (140 + (i % 3) * 30)
        return (
          <div key={i} style={{
            position: 'absolute', top: '40%', left: '50%',
            width: 8, height: 8, borderRadius: 2,
            pointerEvents: 'none',
            background: i % 3 === 0 ? 'var(--lime)' : i % 3 === 1 ? '#fff' : '#ff7a59',
            // @ts-expect-error CSS custom property
            '--cx': cx + 'px',
            '--cy': cy + 'px',
            animation: `confetti-burst 1.2s ${i * 0.02}s cubic-bezier(0.2, 0.7, 0.3, 1) forwards`,
            opacity: 0,
          }} />
        )
      })}

      <div style={{ height: 56 }} />

      {/* close */}
      <div style={{ position: 'absolute', top: 60, right: 22, zIndex: 10 }}>
        <button onClick={onClose} style={{
          appearance: 'none', cursor: 'pointer',
          width: 36, height: 36, borderRadius: 999,
          background: 'rgba(255,255,255,0.1)', color: 'var(--lime)',
          border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="close" size={16} stroke={2.2} />
        </button>
      </div>

      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '0 40px',
        textAlign: 'center', zIndex: 4, pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 2,
          textTransform: 'uppercase', color: 'var(--lime)',
          animation: 'rise .5s .1s both', whiteSpace: 'nowrap',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Icon name="bolt" size={13} stroke={2.2} />
          Nuovo personal record
        </div>
        <div style={{
          marginTop: 18, fontSize: 132, fontWeight: 800, letterSpacing: -5,
          lineHeight: 0.9, color: 'var(--lime)',
          animation: 'count-up .6s .2s cubic-bezier(0.2, 0.9, 0.3, 1) both',
          fontFeatureSettings: '"tnum"',
        }}>
          {value}<span style={{ fontSize: 36, fontFamily: 'var(--font-mono)', fontWeight: 500, marginLeft: 4 }}>{exercise.unit}</span>
        </div>
        <div style={{
          marginTop: 12, fontSize: 24, fontWeight: 600, letterSpacing: -0.5, color: '#fff',
          animation: 'rise .5s .35s both',
        }}>
          {exercise.name}
        </div>
        <div style={{
          marginTop: 8, fontSize: 13, color: 'rgba(255,255,255,0.55)',
          fontFamily: 'var(--font-mono)',
          animation: 'rise .5s .5s both', whiteSpace: 'nowrap',
        }}>
          #{exercise.tag} · {currentPR}{exercise.unit} → {value}{exercise.unit}
        </div>

        <div style={{
          marginTop: 30, padding: '12px 20px', borderRadius: 999,
          background: 'var(--lime)', color: 'var(--lime-on)',
          fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, letterSpacing: 0.5,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          animation: 'rise .5s .65s both',
        }}>
          <Icon name="arrowUp" size={18} stroke={2.5} />
          +{delta}{exercise.unit === 'reps' ? ' reps' : 'kg'}
        </div>
      </div>

      {/* bottom CTA — high z-index, fully interactive */}
      <div style={{
        position: 'absolute', left: 22, right: 22, bottom: 50,
        animation: 'rise .5s .8s both',
        zIndex: 10,
      }}>
        <button
          onClick={onClose}
          className="btn btn-lime"
          style={{ pointerEvents: 'auto' }}>
          Continua
        </button>
        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>
          Bravo, {user === 'base' ? 'Base' : 'Dawg'}. Avanti il prossimo.
        </div>
      </div>
    </div>
  )
}
