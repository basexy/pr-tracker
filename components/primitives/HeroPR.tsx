import Icon from '@/components/Icon'
import type { Exercise, PRData } from '@/lib/types'

interface HeroPRProps {
  exercise: Exercise
  pr: PRData
  onOpen?: () => void
}

export default function HeroPR({ exercise, pr, onOpen }: HeroPRProps) {
  return (
    <div
      className="card"
      onClick={onOpen}
      style={{ cursor: 'pointer', borderRadius: 'var(--r-xl)', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <div className="eyebrow" style={{ whiteSpace: 'nowrap' }}>Ultimo PR</div>
        <div style={{
          padding: '4px 9px', borderRadius: 6,
          background: 'var(--lime)', color: 'var(--lime-on)',
          fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
          whiteSpace: 'nowrap',
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontFamily: 'var(--font-mono)',
        }}>
          ▲ +{pr.delta}{exercise.unit === 'reps' ? ' reps' : exercise.unit}
        </div>
      </div>
      <div className="big-num" style={{ fontSize: 92, marginTop: 10 }}>
        {pr.v}<span className="u">{exercise.unit}</span>
      </div>
      <div style={{
        marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--line)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.2 }}>{exercise.name}</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, letterSpacing: 0.3 }}>
            #{exercise.tag} · {pr.date}
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4, color: 'var(--muted)',
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
          whiteSpace: 'nowrap',
        }}>
          da {pr.v - pr.delta}
          <Icon name="arrowUp" size={12} stroke={2.4} />
        </div>
      </div>
    </div>
  )
}
