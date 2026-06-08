import Icon from '@/components/Icon'
import type { Screen } from '@/lib/types'

interface TabBarProps {
  screen: Screen | null
  onNav: (target: Screen | 'input') => void
}

const TABS_LEFT = [
  { id: 'dash' as Screen, label: 'Dashboard', icon: 'dash' },
  { id: 'list' as Screen, label: 'Esercizi', icon: 'list' },
]
const TABS_RIGHT = [
  { id: 'hist' as Screen, label: 'Storico', icon: 'clock' },
  { id: 'prof' as Screen, label: 'Profilo', icon: 'user' },
]

export default function TabBar({ screen, onNav }: TabBarProps) {
  return (
    <nav className="tabbar">
      {TABS_LEFT.map((t) => (
        <button
          key={t.id}
          className={'tab' + (screen === t.id ? ' is-active' : '')}
          onClick={() => onNav(t.id)}
          aria-label={t.label}>
          <Icon name={t.icon} size={22} />
          {t.label}
        </button>
      ))}
      <button className="tab-fab" onClick={() => onNav('input')} aria-label="Nuovo PR">
        <Icon name="plus" size={26} stroke={2.2} />
      </button>
      {TABS_RIGHT.map((t) => (
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
