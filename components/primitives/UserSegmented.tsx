import type { UserName } from '@/lib/types'

interface UserSegmentedProps {
  user: UserName
  onChange?: (u: UserName) => void
}

export default function UserSegmented({ user, onChange }: UserSegmentedProps) {
  return (
    <div className="segmented" role="tablist">
      {(['base', 'dawg'] as UserName[]).map((u) => (
        <button
          key={u}
          className={user === u ? 'is-active' : ''}
          onClick={() => onChange?.(u)}
          role="tab"
          aria-selected={user === u}>
          <span className="seg-avatar">
            <span className="dot">{u[0].toUpperCase()}</span>
            {u[0].toUpperCase() + u.slice(1)}
          </span>
        </button>
      ))}
    </div>
  )
}
