import Icon from '@/components/Icon'
import type { Screen } from '@/lib/types'

interface TabBarProps {
  screen: Screen | null
  onNav: (target: Screen) => void
}

const TABS = [
  { id: 'dash' as Screen,   label: 'Diario',  icon: 'book' },
  { id: 'schede' as Screen, label: 'Schede',  icon: 'clipboard' },
  { id: 'list' as Screen,   label: 'PR',      icon: 'trophy' },
  { id: 'prof' as Screen,   label: 'Profilo', icon: 'user' },
]

export default function TabBar({ screen, onNav }: TabBarProps) {
  return (
    <nav className="tabbar">
      {TABS.map((t) => (
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
