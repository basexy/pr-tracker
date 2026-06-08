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
    <nav className="tabbar">
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

      <button
        className="tab-fab"
        onClick={() => onNav('overview')}
        aria-label="Panoramica"
        style={{
          background: 'var(--ink)',
          color: 'var(--lime)',
          opacity: screen === 'overview' ? 0.85 : 1,
        }}>
        <Icon name="flash" size={24} stroke={2} />
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
