'use client'

import { useState } from 'react'
import Icon, { tagColor } from '@/components/Icon'
import { supabase } from '@/lib/supabase'
import { updateExercise } from '@/lib/queries'
import type { Exercise } from '@/lib/types'

interface ExerciseCreateProps {
  exercise?: Exercise
  onBack: () => void
  onCreated: () => void
}

const ALL_TAGS = ['petto', 'gambe', 'dorso', 'spalle', 'bicipiti', 'tricipiti', 'core', 'cardio']

export default function ExerciseCreate({ exercise, onBack, onCreated }: ExerciseCreateProps) {
  const isEdit = !!exercise
  const [name, setName] = useState(exercise?.name ?? '')
  const [tag, setTag] = useState(exercise?.tag ?? 'petto')
  const [unit, setUnit] = useState<'kg' | 'reps'>(exercise?.unit ?? 'kg')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    if (isEdit) {
      await updateExercise(exercise!.id, { name: name.trim(), tag, unit })
    } else {
      const id = name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
      await supabase.from('exercises').insert({ id, name: name.trim(), tag, unit })
    }
    setSaving(false)
    onCreated()
  }

  return (
    <div className="screen-scroll" style={{ paddingBottom: 130 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 16px 4px',
      }}>
        <button onClick={onBack} style={{
          appearance: 'none', border: 0, background: 'var(--surface-2)',
          width: 40, height: 40, borderRadius: 'var(--r-pill)',
          color: 'var(--ink)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="chevL" size={20} stroke={2} />
        </button>
        <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase' }}>
          {isEdit ? 'Modifica esercizio' : 'Nuovo esercizio'}
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ padding: '12px 22px 0' }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: -1, lineHeight: 1.05 }}>
          {isEdit ? 'Modifica.' : 'Crea esercizio.'}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 8, marginBottom: 0 }}>
          {isEdit
            ? 'Aggiorna i dati di questo esercizio.'
            : 'Aggiungi un nuovo esercizio da tracciare per Base e Dawg.'}
        </p>

        {/* name */}
        <div style={{ marginTop: 24 }}>
          <div className="eyebrow" style={{ paddingLeft: 4, marginBottom: 8 }}>Nome esercizio</div>
          <div style={{
            padding: '14px 16px',
            background: 'var(--surface)', border: '1.5px solid ' + (name ? 'var(--ink)' : 'var(--line-2)'),
            borderRadius: 'var(--r-md)', transition: 'border-color .15s ease',
          }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. Panca inclinata"
              style={{
                width: '100%', border: 0, outline: 0, background: 'transparent',
                fontFamily: 'inherit', fontSize: 18, fontWeight: 500, color: 'var(--ink)',
              }}
            />
          </div>
        </div>

        {/* tag */}
        <div style={{ marginTop: 20 }}>
          <div className="eyebrow" style={{ paddingLeft: 4, marginBottom: 8 }}>Gruppo muscolare</div>
          <div className="chip-row">
            {ALL_TAGS.map((t) => (
              <button key={t}
                className={'chip' + (tag === t ? ' is-active' : '')}
                onClick={() => setTag(t)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: tagColor(t) }} />
                #{t}
              </button>
            ))}
          </div>
        </div>

        {/* unit */}
        <div style={{ marginTop: 24 }}>
          <div className="eyebrow" style={{ paddingLeft: 4, marginBottom: 8 }}>Misura il PR in</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { id: 'kg' as const, label: 'kg', sub: 'es. panca, squat, stacco' },
              { id: 'reps' as const, label: 'reps', sub: 'es. trazioni, salti, piegamenti' },
            ].map((u) => (
              <button key={u.id}
                onClick={() => setUnit(u.id)}
                style={{
                  appearance: 'none', cursor: 'pointer', textAlign: 'left',
                  padding: '14px 16px',
                  background: unit === u.id ? 'var(--ink)' : 'var(--surface)',
                  color: unit === u.id ? 'var(--lime)' : 'var(--ink)',
                  border: '1.5px solid ' + (unit === u.id ? 'var(--ink)' : 'var(--line-2)'),
                  borderRadius: 'var(--r-md)', transition: 'all .15s ease',
                }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>
                  {u.label}
                </div>
                <div style={{
                  fontSize: 11, marginTop: 4, fontFamily: 'var(--font-mono)',
                  color: unit === u.id ? 'var(--lime)' : 'var(--muted)', opacity: unit === u.id ? 0.7 : 1,
                }}>{u.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* save */}
        <div style={{ marginTop: 32 }}>
          <button
            className="btn btn-primary"
            disabled={!name || saving}
            onClick={handleSave}
            style={{ opacity: name && !saving ? 1 : 0.45, cursor: name && !saving ? 'pointer' : 'not-allowed' }}>
            {saving ? 'Salvataggio…' : isEdit ? 'Salva modifiche' : 'Crea esercizio'}
          </button>
        </div>
      </div>
    </div>
  )
}
