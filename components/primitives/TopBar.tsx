import UserSegmented from './UserSegmented'
import type { UserName } from '@/lib/types'

interface TopBarProps {
  eyebrow?: string
  title?: string
  user?: UserName
  onUser?: (u: UserName) => void
  trailing?: React.ReactNode
}

export default function TopBar({ eyebrow, title, user, onUser, trailing }: TopBarProps) {
  return (
    <div className="topbar">
      <div style={{ minWidth: 0 }}>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        {title && <h1>{title}</h1>}
      </div>
      <div style={{ flexShrink: 0 }}>
        {trailing ?? (user && <UserSegmented user={user} onChange={onUser} />)}
      </div>
    </div>
  )
}
