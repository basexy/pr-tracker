'use client'

import { useState } from 'react'
import Icon, { tagColor, tagDisplay } from '@/components/Icon'
import type { Exercise, PREntry, UserName } from '@/lib/types'

interface ExerciseListProps {
  user: UserName
  onUser: (u: UserName) => void
  exercises: Exercise[]
  entries: PREntry[]
  onOpenExercise: (id: string) => void
  onCreate: () => void
  onBack?: () => void
  onEditExercise?: (id: string) => void
  onDeleteExercise?: (id: string) => void
}

const ALL_TAGS = ['tutti', 'petto', 'gambe', 'dorso', 'spalle', 'bicipiti', 'tricipiti']

export default function ExerciseList({
  user, onUser, exercises, entries, onOpenExercise, onCreate, onBack, onEditExercise, onDeleteExercise,
}: ExerciseListProps) {
  const [filter, setFilter] = useState('tutti')
  const [query, setQuery] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const filtered = exercises.filter((e) => {
    if (filter !== 'tutti') {
      // 'dorso' matches both new 'dorso' tag and legacy 'schiena' tag in DB
      const exDisplay = tagDisplay(e.tag)
      if (exDisplay !== filter) return false
    }
    if (query && !e.name.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  return (
    <div className="screen">
      {/* Sticky header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: '56px 20px 14px',
        background: 'var(--bg)',
        borderBottom: '1px solid var(--line)',
        display: 'flex', alignItems: 'flex-end', gap: 12,
      }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              appearance: 'none', border: 0, background: 'var(--surface-2)',
              cursor: 'pointer', width: 36, height: 36, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--muted)', flexShrink: 0,
            }}>
            <Icon name="chevL" size={18} />
          </button>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow" style={{ marginBottom: 3 }}>{exercises.length} esercizi tracciati</div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.4, color: 'var(--ink)' }}>Esercizi</div>
        </div>
      </div>

      <div className="screen-scroll" style={{ paddingTop: 116 }}>
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
              <Icon name="close" size={14} stroke={2.2} />
            </button>
          )}
        </div>

        {/* chips */}
        <div className="chip-row" style={{ marginTop: 12, flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: 4 }}>
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
            const isConfirming = confirmDeleteId === ex.id
            return (
              <div key={ex.id} style={{ position: 'relative' }}>
                <button className="ex-card" onClick={() => { if (!isConfirming) onOpenExercise(ex.id) }}
                  style={{ width: '100%' }}>
                  <div className="body">
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="name">{ex.name}</div>
                      <div style={{ marginTop: 4 }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 7px', borderRadius: 5,
                          background: tagColor(ex.tag) + '28',
                          color: tagColor(ex.tag),
                          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                          letterSpacing: 0.4,
                        }}>
                          #{tagDisplay(ex.tag)}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {!isConfirming && (
                        <>
                          {onEditExercise && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onEditExercise(ex.id) }}
                              style={{
                                appearance: 'none', border: 0, cursor: 'pointer',
                                width: 30, height: 30, borderRadius: 8,
                                background: 'var(--surface-2)', color: 'var(--muted)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              }}>
                              <Icon name="edit" size={14} stroke={1.8} />
                            </button>
                          )}
                          {onDeleteExercise && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(ex.id) }}
                              style={{
                                appearance: 'none', border: 0, cursor: 'pointer',
                                width: 30, height: 30, borderRadius: 8,
                                background: 'var(--surface-2)', color: 'var(--muted)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              }}>
                              <Icon name="trash" size={14} stroke={1.8} />
                            </button>
                          )}
                        </>
                      )}
                      {isConfirming && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null) }}
                            style={{
                              appearance: 'none', border: '1px solid var(--line-2)', cursor: 'pointer',
                              background: 'var(--surface-2)', color: 'var(--muted)',
                              borderRadius: 8, padding: '5px 10px',
                              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                            }}>
                            No
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteExercise!(ex.id); setConfirmDeleteId(null) }}
                            style={{
                              appearance: 'none', border: 0, cursor: 'pointer',
                              background: '#ef4444', color: '#fff',
                              borderRadius: 8, padding: '5px 10px',
                              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                            }}>
                            Elimina
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              </div>
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
          <Icon name="plus" size={16} stroke={2.2} />
          Crea nuovo esercizio
        </button>
      </div>
      </div>
    </div>
  )
}
