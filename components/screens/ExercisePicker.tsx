'use client'

import { useState, useMemo } from 'react'
import Icon, { tagColor, tagLabel } from '@/components/Icon'
import type { Exercise, PickerContext } from '@/lib/types'

const ALL_TAGS = ['petto', 'dorso', 'gambe', 'spalle', 'bicipiti', 'tricipiti', 'braccia', 'core', 'cardio']

interface ExercisePickerProps {
  ctx: PickerContext
  exercises: Exercise[]
  onSelect: (exercise: Exercise) => void
  onBack: () => void
  onCreateNew: () => void
}

export default function ExercisePicker({ ctx, exercises, onSelect, onBack, onCreateNew }: ExercisePickerProps) {
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const matchTag = activeTag ? ex.tag === activeTag || (activeTag === 'braccia' && (ex.tag === 'bicipiti' || ex.tag === 'tricipiti')) : true
      const matchQuery = query.trim() === '' || ex.name.toLowerCase().includes(query.toLowerCase())
      return matchTag && matchQuery
    })
  }, [exercises, query, activeTag])

  const title = ctx.purpose === 'swap-session' ? 'Sostituisci esercizio'
    : ctx.purpose === 'add-session' ? 'Aggiungi esercizio'
    : 'Aggiungi a scheda'

  return (
    <div className="screen">
      {/* Header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        background: 'var(--bg)', borderBottom: '1px solid var(--line)',
        padding: '56px 20px 12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
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
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.4, color: 'var(--ink)' }}>
            {title}
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <div style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--muted)', pointerEvents: 'none',
          }}>
            <Icon name="search" size={16} />
          </div>
          <input
            type="text"
            placeholder="Cerca esercizio…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%', appearance: 'none', border: '1px solid var(--line-2)',
              background: 'var(--surface-2)', borderRadius: 10,
              padding: '10px 12px 10px 38px',
              fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--ink)',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
                color: 'var(--muted)', display: 'flex', alignItems: 'center',
              }}>
              <Icon name="close" size={14} />
            </button>
          )}
        </div>

        {/* Tag filters */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          <button
            onClick={() => setActiveTag(null)}
            className={`chip${activeTag === null ? ' is-active' : ''}`}>
            Tutti
          </button>
          {ALL_TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTag(activeTag === t ? null : t)}
              className={`chip${activeTag === t ? ' is-active' : ''}`}
              style={activeTag === t ? { background: tagColor(t) + '22', color: tagColor(t), borderColor: tagColor(t) + '60' } : {}}>
              {tagLabel(t)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="screen-scroll" style={{ paddingTop: 196 }}>
        {/* Create new exercise option */}
        <div style={{ padding: '8px 20px 8px' }}>
          <button
            onClick={onCreateNew}
            style={{
              width: '100%', appearance: 'none', border: '1.5px dashed var(--line-2)',
              background: 'transparent', cursor: 'pointer',
              borderRadius: 'var(--r-md)', padding: '13px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              color: 'var(--muted)',
            }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'var(--surface-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="plus" size={18} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-ui)' }}>
              Crea nuovo esercizio
            </span>
          </button>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            Nessun esercizio trovato
          </div>
        ) : (
          <div style={{ padding: '0 20px' }}>
            <div className="row-group">
              {filtered.map((ex, idx) => {
                const color = tagColor(ex.tag)
                return (
                  <button
                    key={ex.id}
                    onClick={() => onSelect(ex)}
                    style={{
                      width: '100%', appearance: 'none', border: 0, background: 'transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                      padding: '13px 16px', textAlign: 'left',
                      borderBottom: idx < filtered.length - 1 ? '1px solid var(--line)' : 'none',
                    }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: color,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ex.name}
                      </div>
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)',
                      textTransform: 'uppercase', letterSpacing: 0.8, flexShrink: 0,
                    }}>
                      {tagLabel(ex.tag)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
