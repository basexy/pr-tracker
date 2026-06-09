'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Icon, { tagColor } from '@/components/Icon'
import { buildPRData } from '@/lib/queries'
import type { ExerciseLog, ExerciseLogSet, LogContext, PREntry } from '@/lib/types'

interface ExerciseLoggingProps {
  ctx: LogContext
  entries: PREntry[]
  otherEntries?: PREntry[]
  otherName?: string
  onBack: () => void
  onSave: (sessionId: string, orderIndex: number, exerciseId: string, sets: ExerciseLogSet[]) => Promise<void>
}

function buildDefaultSets(defaultSets: number, defaultReps: number, defaultKg: number): ExerciseLogSet[] {
  return Array.from({ length: defaultSets }, () => ({ reps: defaultReps, kg: defaultKg, done: false }))
}

export default function ExerciseLogging({ ctx, entries, otherEntries, otherName, onBack, onSave }: ExerciseLoggingProps) {
  const { exercise, sessionId, orderIndex, defaultSets, defaultReps, defaultKg, existingLog } = ctx

  const [sets, setSets] = useState<ExerciseLogSet[]>(() => {
    if (existingLog && existingLog.sets.length > 0) return existingLog.sets
    return buildDefaultSets(defaultSets, defaultReps, defaultKg)
  })

  const [saving, setSaving] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const color = tagColor(exercise.tag)

  const pr = buildPRData(entries, exercise.id)
  const otherPR = otherEntries ? buildPRData(otherEntries, exercise.id) : null

  // Debounced auto-save
  const scheduleSave = useCallback((newSets: ExerciseLogSet[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setSaving(true)
      try {
        await onSave(sessionId, orderIndex, exercise.id, newSets)
      } finally {
        setSaving(false)
      }
    }, 600)
  }, [sessionId, orderIndex, exercise.id, onSave])

  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current) }, [])

  const updateSet = useCallback((idx: number, field: keyof ExerciseLogSet, rawValue: string | boolean) => {
    setSets((prev) => {
      const next = prev.map((s, i) => {
        if (i !== idx) return s
        if (field === 'done') return { ...s, done: rawValue as boolean }
        const num = parseFloat(rawValue as string)
        return { ...s, [field]: isNaN(num) ? 0 : Math.max(0, num) }
      })
      scheduleSave(next)
      return next
    })
  }, [scheduleSave])

  const addSet = useCallback(() => {
    setSets((prev) => {
      const last = prev[prev.length - 1]
      const next = [...prev, { reps: last?.reps ?? defaultReps, kg: last?.kg ?? defaultKg, done: false }]
      scheduleSave(next)
      return next
    })
  }, [defaultReps, defaultKg, scheduleSave])

  const removeSet = useCallback((idx: number) => {
    setSets((prev) => {
      const next = prev.filter((_, i) => i !== idx)
      scheduleSave(next)
      return next
    })
  }, [scheduleSave])

  const handleDone = useCallback(async () => {
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null }
    setSaving(true)
    try {
      await onSave(sessionId, orderIndex, exercise.id, sets)
      onBack()
    } finally {
      setSaving(false)
    }
  }, [sets, sessionId, orderIndex, exercise.id, onSave, onBack])

  const doneSets = sets.filter((s) => s.done).length

  return (
    <div className="screen">
      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: '56px 20px 14px',
        background: 'var(--bg)',
        borderBottom: '1px solid var(--line)',
        display: 'flex', alignItems: 'flex-end', gap: 12,
      }}>
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
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 3 }}>
            {exercise.tag}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.4, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {exercise.name}
          </div>
        </div>
        {saving && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: 0.5 }}>
            Salvo…
          </div>
        )}
      </div>

      <div className="screen-scroll" style={{ paddingTop: 136 }}>
        {/* PR attuale */}
        {pr && (
          <div style={{
            margin: '0 20px 8px',
            padding: '14px 18px',
            borderRadius: 'var(--r-md)',
            background: 'var(--ink)', color: 'var(--bg)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--r-pill)',
              background: 'var(--lime)', color: 'var(--lime-on)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon name="trophy" size={18} stroke={2} />
            </div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--lime)', letterSpacing: 1.2, textTransform: 'uppercase', flex: 1 }}>
              PR attuale
            </div>
            <div className="mono" style={{ fontSize: 36, fontWeight: 800, color: 'var(--bg)', letterSpacing: -1, lineHeight: 1 }}>
              {pr.v}<span style={{ fontSize: 14, fontWeight: 500, marginLeft: 2 }}>{exercise.unit}</span>
            </div>
          </div>
        )}

        {/* Other user PR */}
        {otherPR && otherName && (
          <div style={{
            margin: '0 20px 14px',
            padding: '10px 16px',
            borderRadius: 'var(--r-md)',
            background: 'var(--surface)', border: '1px solid var(--line)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div className="eyebrow" style={{ flex: 1 }}>PR {otherName}</div>
            <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)' }}>
              {otherPR.v}<span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400, marginLeft: 2 }}>{exercise.unit}</span>
            </div>
          </div>
        )}

        {/* Progress indicator */}
        <div style={{ padding: '0 20px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, height: 4, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2,
              background: 'var(--lime)',
              width: sets.length > 0 ? `${(doneSets / sets.length) * 100}%` : '0%',
              transition: 'width 0.3s ease',
            }} />
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
            {doneSets}/{sets.length} serie
          </span>
        </div>

        {/* Sets table header */}
        <div style={{ padding: '0 20px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
            #
          </div>
          <div style={{ flex: 1, minWidth: 0, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Reps
          </div>
          <div style={{ flex: 1, minWidth: 0, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Kg
          </div>
          <div style={{ width: 36 }} />
          <div style={{ width: 30 }} />
        </div>

        {/* Sets list */}
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sets.map((set, idx) => (
            <SetRow
              key={idx}
              index={idx}
              set={set}
              color={color}
              onUpdate={(field, val) => updateSet(idx, field, val)}
              onRemove={() => removeSet(idx)}
              canRemove={sets.length > 1}
            />
          ))}
        </div>

        {/* Add set */}
        <div style={{ padding: '10px 20px 0' }}>
          <button
            onClick={addSet}
            style={{
              width: '100%', appearance: 'none', border: '1.5px dashed var(--line-2)',
              background: 'transparent', cursor: 'pointer',
              borderRadius: 'var(--r-md)', padding: '13px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              color: 'var(--muted)', fontFamily: 'var(--font-ui)',
            }}>
            <Icon name="plus" size={16} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Aggiungi serie</span>
          </button>
        </div>

        {/* Done button */}
        <div style={{ padding: '16px 20px' }}>
          <button
            className="btn btn-lime"
            onClick={handleDone}
            disabled={saving}>
            {saving ? 'Salvo…' : 'Fine'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SetRow({
  index, set, color, onUpdate, onRemove, canRemove,
}: {
  index: number
  set: ExerciseLogSet
  color: string
  onUpdate: (field: keyof ExerciseLogSet, value: string | boolean) => void
  onRemove: () => void
  canRemove: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: set.done ? color + '12' : 'var(--surface)',
      border: `1px solid ${set.done ? color + '40' : 'var(--line)'}`,
      borderRadius: 12, padding: '10px 12px',
      transition: 'background 0.2s, border-color 0.2s',
    }}>
      {/* Set number */}
      <div style={{
        width: 28, fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
        color: set.done ? 'var(--lime-deep)' : 'var(--muted)', flexShrink: 0,
      }}>
        {index + 1}
      </div>

      {/* Reps */}
      <input
        type="number"
        min={0}
        value={set.reps}
        onChange={(e) => onUpdate('reps', e.target.value)}
        style={{
          flex: 1, minWidth: 0, boxSizing: 'border-box',
          appearance: 'none', border: '1px solid var(--line)',
          background: 'var(--surface-2)', borderRadius: 8,
          padding: '8px 4px', textAlign: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: 'var(--ink)',
        }}
      />

      {/* Kg */}
      <input
        type="number"
        min={0}
        step={0.5}
        value={set.kg}
        onChange={(e) => onUpdate('kg', e.target.value)}
        style={{
          flex: 1, minWidth: 0, boxSizing: 'border-box',
          appearance: 'none', border: '1px solid var(--line)',
          background: 'var(--surface-2)', borderRadius: 8,
          padding: '8px 4px', textAlign: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: 'var(--ink)',
        }}
      />

      {/* Done toggle */}
      <button
        onClick={() => onUpdate('done', !set.done)}
        style={{
          appearance: 'none', border: 0, cursor: 'pointer',
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: set.done ? 'var(--lime)' : 'var(--surface-2)',
          color: set.done ? 'var(--lime-on)' : 'var(--muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}>
        <Icon name="check" size={16} stroke={2.2} />
      </button>

      {/* Remove */}
      {canRemove ? (
        <button
          onClick={onRemove}
          style={{
            appearance: 'none', border: 0, cursor: 'pointer',
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: 'transparent', color: 'var(--muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          <Icon name="minus" size={14} />
        </button>
      ) : <div style={{ width: 30 }} />}
    </div>
  )
}
