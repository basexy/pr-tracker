'use client'

import { useState } from 'react'
import TopBar from '@/components/primitives/TopBar'
import Icon from '@/components/Icon'
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
  onOpenExerciseList: () => void
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

export default function ProfileScreen({
  user, onUser, theme, onTheme, accent, onAccent, entries,
  exercises, onOpenExerciseList, onCreateExercise, onEditExercise, onDeleteExercise,
}: ProfileScreenProps) {
  const initial = user === 'base' ? 'B' : 'D'
  const fullName = user === 'base' ? 'Base' : 'Dawg'
  const streak = calcStreak(entries)
  const totalKg = entries.reduce((s, e) => s + Number(e.value), 0)
  const totalPRs = entries.length

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

        {/* EXERCISES LINK */}
        <div style={{ marginTop: 18 }}>
          <div className="eyebrow" style={{ padding: '0 4px 8px' }}>Esercizi</div>
          <div className="row-group">
            <button
              onClick={onOpenExerciseList}
              style={{
                width: '100%', appearance: 'none', cursor: 'pointer', textAlign: 'left',
                background: 'transparent', border: 0,
              }}>
              <div className="row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Icon name="barbell" size={18} stroke={1.8} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>Lista esercizi</div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 2 }}>
                      {exercises.length} esercizi tracciati
                    </div>
                  </div>
                </div>
                <Icon name="chevR" size={16} stroke={1.6} />
              </div>
            </button>
          </div>
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
