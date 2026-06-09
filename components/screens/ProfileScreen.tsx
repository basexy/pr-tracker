'use client'

import { useMemo, useState } from 'react'
import TopBar from '@/components/primitives/TopBar'
import Icon, { tagColor, tagLabel } from '@/components/Icon'
import { calcStreak } from '@/lib/queries'
import type { Accent, Exercise, PREntry, Theme, UserName } from '@/lib/types'

interface ProfileScreenProps {
  user: UserName
  onUser: (u: UserName) => void
  theme: Theme
  onTheme: (t: Theme) => void
  accent: Accent
  onAccent: (a: Accent) => void
  entries: PREntry[]
  exercises: Exercise[]
  onCreateExercise: () => void
  onEditExercise: (id: string) => void
  onDeleteExercise: (id: string) => void
}

const ACCENTS: { id: Accent; hex: string }[] = [
  { id: 'lime',   hex: '#C0E840' },
  { id: 'orange', hex: '#FF7A59' },
  { id: 'blue',   hex: '#5E9BFF' },
  { id: 'red',    hex: '#F87171' },
]

const ALL_TAGS = ['petto', 'dorso', 'gambe', 'spalle', 'bicipiti', 'tricipiti', 'braccia', 'core', 'cardio']

export default function ProfileScreen({
  user, onUser, theme, onTheme, accent, onAccent, entries,
  exercises, onCreateExercise, onEditExercise, onDeleteExercise,
}: ProfileScreenProps) {
  const initial = user === 'base' ? 'B' : 'D'
  const fullName = user === 'base' ? 'Base' : 'Dawg'
  const streak = calcStreak(entries)
  const totalKg = entries.reduce((s, e) => s + Number(e.value), 0)
  const totalPRs = entries.length

  const [exQuery, setExQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const matchTag = activeTag
        ? ex.tag === activeTag || (activeTag === 'braccia' && (ex.tag === 'bicipiti' || ex.tag === 'tricipiti'))
        : true
      const matchQuery = exQuery.trim() === '' || ex.name.toLowerCase().includes(exQuery.toLowerCase())
      return matchTag && matchQuery
    })
  }, [exercises, exQuery, activeTag])

  return (
    <div className="screen-scroll">
      <TopBar title="Profilo" user={user} onUser={onUser} />

      <div style={{ padding: '0 18px' }}>
        {/* identity card */}
        <div className="card" style={{ padding: '20px 22px', borderRadius: 'var(--r-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 'var(--r-pill)',
              background: 'var(--ink)', color: 'var(--lime)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 800, letterSpacing: -1,
            }}>{initial}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1 }}>{fullName}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                PR.TRACKER · v1
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 14, marginTop: 18, paddingTop: 16,
            borderTop: '1px solid var(--line)',
          }}>
            {[
              { l: 'PR totali', v: String(totalPRs) },
              { l: 'streak', v: streak + 's' },
              { l: 'kg / mese', v: totalKg > 0 ? (totalKg / 1000).toFixed(1) + 'k' : '—' },
            ].map((s, i) => (
              <div key={i}>
                <div className="eyebrow" style={{ fontSize: 9.5 }}>{s.l}</div>
                <div className="mono tnum" style={{ fontSize: 20, fontWeight: 700, marginTop: 4, letterSpacing: -0.5 }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* APPEARANCE */}
        <div style={{ marginTop: 22 }}>
          <div className="eyebrow" style={{ padding: '0 4px 8px' }}>Aspetto</div>
          <div className="row-group">
            <div className="row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon name={theme === 'dark' ? 'moon' : 'sun'} size={18} stroke={1.8} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>Tema</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 2 }}>
                    {theme === 'dark' ? 'Scuro · Athletic' : 'Chiaro · Editorial'}
                  </div>
                </div>
              </div>
              <button
                className={'theme-toggle' + (theme === 'dark' ? ' is-dark' : '')}
                onClick={() => onTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Cambia tema"
              />
            </div>

            <div className="row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon name="palette" size={18} stroke={1.8} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>Colore accento</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 2 }}>
                    al momento · {accent}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {ACCENTS.map((a) => (
                  <button key={a.id}
                    onClick={() => onAccent(a.id)}
                    aria-label={a.id}
                    style={{
                      appearance: 'none', cursor: 'pointer',
                      width: 24, height: 24, borderRadius: 999,
                      background: a.hex,
                      border: accent === a.id ? '2px solid var(--ink)' : '2px solid transparent',
                      outline: accent === a.id ? '1px solid var(--ink)' : 'none',
                      outlineOffset: 2,
                    }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PREFERENCES */}
        <div style={{ marginTop: 18 }}>
          <div className="eyebrow" style={{ padding: '0 4px 8px' }}>Preferenze</div>
          <div className="row-group">
            <div className="row">
              <span style={{ fontSize: 14 }}>Unità predefinita</span>
              <span className="mono" style={{ fontSize: 13, color: 'var(--muted)' }}>kg</span>
            </div>
            <div className="row">
              <span style={{ fontSize: 14 }}>Notifiche PR di {user === 'base' ? 'Dawg' : 'Base'}</span>
              <span className="mono" style={{ fontSize: 13, color: 'var(--lime-deep)' }}>on</span>
            </div>
          </div>
        </div>

        {/* EXERCISES */}
        <div style={{ marginTop: 22 }}>
          <div className="eyebrow" style={{ padding: '0 4px 8px' }}>Esercizi · {exercises.length}</div>

          {/* Search */}
          <div style={{
            padding: '10px 14px',
            background: 'var(--surface)', border: '1px solid var(--line)',
            borderRadius: 'var(--r-md)',
            display: 'flex', alignItems: 'center', gap: 10,
            color: 'var(--muted)', marginBottom: 10,
          }}>
            <Icon name="search" size={16} stroke={1.8} />
            <input
              value={exQuery}
              onChange={(e) => setExQuery(e.target.value)}
              placeholder="Cerca esercizio…"
              style={{
                border: 0, outline: 0, flex: 1, background: 'transparent',
                fontFamily: 'inherit', fontSize: 14, color: 'var(--ink)',
              }}
            />
            {exQuery && (
              <button onClick={() => setExQuery('')} style={{
                appearance: 'none', border: 0, background: 'transparent',
                color: 'var(--muted)', cursor: 'pointer',
              }}>
                <Icon name="close" size={14} stroke={2.2} />
              </button>
            )}
          </div>

          {/* Tag filters */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 10, flexWrap: 'nowrap' }}>
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

          {/* Create new */}
          <button
            onClick={onCreateExercise}
            style={{
              width: '100%', appearance: 'none', border: '1.5px dashed var(--line-2)',
              background: 'transparent', cursor: 'pointer',
              borderRadius: 'var(--r-md)', padding: '13px 16px', marginBottom: 8,
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

          {/* Exercise list */}
          {filtered.length === 0 ? (
            <div style={{
              padding: 24, textAlign: 'center', color: 'var(--muted)',
              border: '1px dashed var(--line-2)', borderRadius: 'var(--r-md)',
              fontSize: 13,
            }}>
              Nessun esercizio trovato
            </div>
          ) : (
            <div className="row-group">
              {filtered.map((ex, idx) => {
                const color = tagColor(ex.tag)
                const isConfirming = confirmDeleteId === ex.id
                return (
                  <div
                    key={ex.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '13px 16px',
                      borderBottom: idx < filtered.length - 1 ? '1px solid var(--line)' : 'none',
                    }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: color,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 15, fontWeight: 600, color: 'var(--ink)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {ex.name}
                      </div>
                    </div>
                    {isConfirming ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          style={{
                            appearance: 'none', border: '1px solid var(--line-2)', cursor: 'pointer',
                            background: 'var(--surface-2)', color: 'var(--muted)',
                            borderRadius: 8, padding: '5px 10px',
                            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                          }}>
                          No
                        </button>
                        <button
                          onClick={() => { onDeleteExercise(ex.id); setConfirmDeleteId(null) }}
                          style={{
                            appearance: 'none', border: 0, cursor: 'pointer',
                            background: '#ef4444', color: '#fff',
                            borderRadius: 8, padding: '5px 10px',
                            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                          }}>
                          Elimina
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <button
                          onClick={() => onEditExercise(ex.id)}
                          style={{
                            appearance: 'none', border: 0, cursor: 'pointer',
                            width: 32, height: 32, borderRadius: 8,
                            background: 'var(--surface-2)', color: 'var(--muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                          <Icon name="edit" size={15} stroke={1.8} />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(ex.id)}
                          style={{
                            appearance: 'none', border: 0, cursor: 'pointer',
                            width: 32, height: 32, borderRadius: 8,
                            background: 'var(--surface-2)', color: 'var(--muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                          <Icon name="trash" size={15} stroke={1.8} />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* footer */}
        <div style={{ textAlign: 'center', marginTop: 28, paddingBottom: 16 }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--subtle)', letterSpacing: 1 }}>
            PR.TRACKER · v1 · made for Base &amp; Dawg
          </div>
        </div>
      </div>
    </div>
  )
}
