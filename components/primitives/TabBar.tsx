import Icon from '@/components/Icon'
import type { Screen } from '@/lib/types'

interface TabBarProps {
  screen: Screen | null
  onNav: (target: Screen) => void
}

const LEFT_TABS = [
  { id: 'dash' as Screen,    label: 'Diario',  icon: 'book' },
  { id: 'schede' as Screen,  label: 'Schede',  icon: 'clipboard' },
]

const RIGHT_TABS = [
  { id: 'list' as Screen,    label: 'PR',      icon: 'trophy' },
  { id: 'prof' as Screen,    label: 'Profilo', icon: 'user' },
]

export default function TabBar({ screen, onNav }: TabBarProps) {
  return (
    <nav className="tabbar" style={{ position: 'relative', overflow: 'visible' }}>
      {LEFT_TABS.map((t) => (
        <button
          key={t.id}
          className={'tab' + (screen === t.id ? ' is-active' : '')}
          onClick={() => onNav(t.id)}
          aria-label={t.label}>
          <Icon name={t.icon} size={22} />
          {t.label}
        </button>
      ))}

      {/* Raised center button */}
      <button
        onClick={() => onNav('overview')}
        aria-label="Panoramica"
        style={{
          appearance: 'none', border: 0, cursor: 'pointer',
          width: 54, height: 54, borderRadius: 27, flexShrink: 0,
          background: screen === 'overview' ? 'var(--ink)' : 'var(--ink)',
          color: 'var(--lime)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginTop: -20,
          boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
          transition: 'transform 0.15s, box-shadow 0.15s',
          transform: screen === 'overview' ? 'scale(0.94)' : 'scale(1)',
        }}>
        <Icon name="flash" size={24} stroke={screen === 'overview' ? 2.5 : 2} />
      </button>

      {RIGHT_TABS.map((t) => (
        <button
          key={t.id}
          className={'tab' + (screen === t.id ? ' is-active' : '')}
          onClick={() => onNav(t.id)}
          aria-label={t.label}>
          <Icon name={t.icon} size={22} />
          {t.label}
        </button>
      ))}
    </nav>
  )
}
