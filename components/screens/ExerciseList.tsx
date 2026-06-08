'use client'

import { useState } from 'react'
import TopBar from '@/components/primitives/TopBar'
import Icon, { tagColor } from '@/components/Icon'
import { buildPRData } from '@/lib/queries'
import type { Exercise, PREntry, UserName } from '@/lib/types'

interface ExerciseListProps {
  user: UserName
  onUser: (u: UserName) => void
  exercises: Exercise[]
  entries: PREntry[]
  onOpenExercise: (id: string) => void
  onCreate: () => void
}

const ALL_TAGS = ['tutti', 'petto', 'gambe', 'schiena', 'spalle', 'bicipiti', 'tricipiti']

export default function ExerciseList({
  user, onUser, exercises, entries, onOpenExercise, onCreate,
}: ExerciseListProps) {
  const [filter, setFilter] = useState('tutti')
  const [query, setQuery] = useState('')

  const filtered = exercises.filter((e) => {
    if (filter !== 'tutti' && e.tag !== filter) return false
    if (query && !e.name.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  return (
    <div className="screen-scroll">
      <TopBar
        eyebrow={`${exercises.length} esercizi tracciati`}
        title="Esercizi"
        user={user} onUser={onUser}
      />

      <div style={{ padding: '0 18px' }}>
        {/* search */}
        <div style={{
          padding: '12px 16px',
          background: 'var(--surface)', border: '1px solid var(--line)',
          borderRadius: 'var(--r-md)',
          display: 'flex', alignItems: 'center', gap: 10,
          color: 'var(--muted)',
        }}>
          <Icon name="search" size={16} stroke={1.8} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca o crea esercizio…"
            style={{
              border: 0, outline: 0, flex: 1, background: 'transparent',
              fontFamily: 'inherit', fontSize: 14, color: 'var(--ink)',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{
              appearance: 'none', border: 0, background: 'transparent',
              color: 'var(--muted)', cursor: 'pointer',
            }}>
              <Icon name="close" size={14} stroke={2} />
            </button>
          )}
        </div>

        {/* chips */}
        <div className="chip-row" style={{ marginTop: 12 }}>
          {ALL_TAGS.map((t) => (
            <button key={t}
              className={'chip' + (filter === t ? ' is-active' : '')}
              onClick={() => setFilter(t)}>
              {t === 'tutti' ? t : '#' + t}
            </button>
          ))}
        </div>

        {/* cards */}
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.length === 0 && (
            <div style={{
              padding: 24, textAlign: 'center', color: 'var(--muted)',
              border: '1px dashed var(--line-2)', borderRadius: 'var(--r-md)',
              fontSize: 13,
            }}>
              Nessun esercizio trovato.
              {query && (
                <div style={{ marginTop: 8 }}>
                  <button className="btn-ghost" style={{ padding: '8px 14px', borderRadius: 999, fontSize: 12 }} onClick={onCreate}>
                    + Crea &quot;{query}&quot;
                  </button>
                </div>
              )}
            </div>
          )}
          {filtered.map((ex) => {
            const pr = buildPRData(entries, ex.id)
            return (
              <button key={ex.id} className="ex-card" onClick={() => onOpenExercise(ex.id)}>
                <div className="rail" style={{ background: tagColor(ex.tag) }} />
                <div className="body">
                  <div style={{ minWidth: 0 }}>
                    <div className="name">{ex.name}</div>
                    <div className="meta">#{ex.tag} · {pr?.date ?? '—'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {pr ? (
                      <>
                        <div className="value">
                          {pr.v}<span className="u">{ex.unit}</span>
                        </div>
                        <div className="delta">▲ +{pr.delta}</div>
                      </>
                    ) : (
                      <div className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>nessun PR</div>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* create button */}
        <button
          onClick={onCreate}
          style={{
            marginTop: 14, padding: '14px 16px',
            width: '100%',
            background: 'transparent', color: 'var(--ink)',
            border: '1.5px dashed var(--line-2)',
            borderRadius: 'var(--r-md)',
            fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer',
          }}>
          <Icon name="plus" size={16} stroke={2} />
          Crea nuovo esercizio
        </button>
      </div>
    </div>
  )
}
