'use client'

import { useState } from 'react'
import TopBar from '@/components/primitives/TopBar'
import Icon, { tagColor, tagDisplay } from '@/components/Icon'
import { buildPRData } from '@/lib/queries'
import type { Exercise, PREntry, UserName } from '@/lib/types'

interface PRListProps {
  user: UserName
  onUser: (u: UserName) => void
  exercises: Exercise[]
  entries: PREntry[]
  onOpenExercise: (id: string) => void
  onAddPR: () => void
}

const ALL_TAGS = ['tutti', 'petto', 'gambe', 'dorso', 'spalle', 'bicipiti', 'tricipiti']

export default function PRList({ user, onUser, exercises, entries, onOpenExercise, onAddPR }: PRListProps) {
  const [filter, setFilter] = useState('tutti')

  const filtered = exercises.filter((ex) => {
    if (filter !== 'tutti') {
      if (tagDisplay(ex.tag) !== filter) return false
    }
    return true
  })

  return (
    <div className="screen-scroll">
      <TopBar
        eyebrow={`${exercises.length} esercizi · ${entries.length} PR`}
        title="Lista PR"
        user={user} onUser={onUser}
      />

      <div style={{ padding: '0 18px' }}>
        {/* chips */}
        <div className="chip-row" style={{ marginTop: 4, flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: 4 }}>
          {ALL_TAGS.map((t) => (
            <button key={t}
              className={'chip' + (filter === t ? ' is-active' : '')}
              onClick={() => setFilter(t)}>
              {t === 'tutti' ? t : '#' + t}
            </button>
          ))}
        </div>

        {/* list */}
        <div className="row-group" style={{ marginTop: 12 }}>
          {filtered.map((ex, i) => {
            const pr = buildPRData(entries, ex.id)
            return (
              <button
                key={ex.id}
                onClick={() => onOpenExercise(ex.id)}
                style={{
                  width: '100%', appearance: 'none', border: 0, background: 'transparent',
                  cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 16px',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--line)' : 'none',
                }}>
                <div style={{
                  width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                  background: tagColor(ex.tag),
                }} />
                <span style={{
                  flex: 1, fontSize: 15, fontWeight: 500, color: 'var(--ink)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {ex.name}
                </span>
                {pr ? (
                  <span className="mono tnum" style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', flexShrink: 0 }}>
                    {pr.v}<span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400, marginLeft: 1 }}>{ex.unit}</span>
                  </span>
                ) : (
                  <span className="mono" style={{ fontSize: 12, color: 'var(--muted)', flexShrink: 0 }}>—</span>
                )}
              </button>
            )
          })}
        </div>

        {/* add PR */}
        <button
          onClick={onAddPR}
          style={{
            marginTop: 14, padding: '14px 16px',
            width: '100%',
            background: 'var(--lime)', color: 'var(--lime-on)',
            border: 'none',
            borderRadius: 'var(--r-pill)',
            fontFamily: 'inherit', fontSize: 15, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer',
          }}>
          <Icon name="plus" size={16} stroke={2.2} />
          Aggiungi PR
        </button>
      </div>
    </div>
  )
}
