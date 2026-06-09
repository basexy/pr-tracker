'use client'

import { useCallback, useEffect, useState } from 'react'
import Icon, { tagColor, tagLabel } from '@/components/Icon'
import type { Exercise, PlanExercise, PickerContext, WorkoutPlan } from '@/lib/types'

const MUSCLE_GROUPS = [
  'petto', 'dorso', 'gambe', 'spalle', 'braccia', 'full_body',
]

interface PlanDetailProps {
  plan: WorkoutPlan
  allExercises: Exercise[]
  onBack: () => void
  onRenamePlan: (planId: string, name: string) => Promise<void>
  onChangePlanGroup: (planId: string, group: string) => Promise<void>
  onDeletePlan: (planId: string) => Promise<void>
  onAddExerciseToPlan: (planId: string, exerciseId: string, orderIndex: number) => Promise<PlanExercise>
  onUpdateExerciseDefaults: (planExerciseId: string, sets: number, reps: number, kg: number) => Promise<void>
  onRemoveExerciseFromPlan: (planExerciseId: string) => Promise<void>
  onOpenExercisePicker: (ctx: PickerContext) => void
  loadPlanExercises: (planId: string, exercises: Exercise[]) => Promise<PlanExercise[]>
}

export default function PlanDetail({
  plan, allExercises, onBack,
  onRenamePlan, onChangePlanGroup, onDeletePlan,
  onAddExerciseToPlan, onUpdateExerciseDefaults, onRemoveExerciseFromPlan,
  onOpenExercisePicker, loadPlanExercises,
}: PlanDetailProps) {
  const [planExercises, setPlanExercises] = useState<PlanExercise[]>([])
  const [loading, setLoading] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(plan.name)
  const [showGroupPicker, setShowGroupPicker] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    setLoading(true)
    loadPlanExercises(plan.id, allExercises)
      .then((pes) => { setPlanExercises(pes); setLoading(false) })
      .catch(() => setLoading(false))
  }, [plan.id, allExercises, loadPlanExercises])

  const handleRename = useCallback(async () => {
    setEditingName(false)
    if (nameValue.trim() && nameValue !== plan.name) {
      await onRenamePlan(plan.id, nameValue.trim())
    }
  }, [nameValue, plan.id, plan.name, onRenamePlan])

  const handleAddExercise = useCallback(() => {
    const nextIndex = planExercises.length > 0
      ? Math.max(...planExercises.map((pe) => pe.order_index)) + 1
      : 0
    onOpenExercisePicker({
      purpose: 'add-plan',
      planId: plan.id,
      orderIndex: nextIndex,
      returnScreen: 'plan-detail',
    })
  }, [plan.id, planExercises, onOpenExercisePicker])

  const handleRemoveExercise = useCallback(async (peId: string) => {
    await onRemoveExerciseFromPlan(peId)
    setPlanExercises((prev) => prev.filter((pe) => pe.id !== peId))
  }, [onRemoveExerciseFromPlan])

  const handleMoveUp = useCallback(async (idx: number) => {
    if (idx === 0) return
    const updated = [...planExercises]
    const temp = updated[idx - 1].order_index
    updated[idx - 1] = { ...updated[idx - 1], order_index: updated[idx].order_index }
    updated[idx] = { ...updated[idx], order_index: temp }
    ;[updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]]
    setPlanExercises(updated)
    await Promise.all([
      onUpdateExerciseDefaults(updated[idx - 1].id, updated[idx - 1].default_sets, updated[idx - 1].default_reps, updated[idx - 1].default_kg),
      onUpdateExerciseDefaults(updated[idx].id, updated[idx].default_sets, updated[idx].default_reps, updated[idx].default_kg),
    ])
  }, [planExercises, onUpdateExerciseDefaults])

  const handleUpdateDefaults = useCallback(async (pe: PlanExercise, sets: number, reps: number, kg: number) => {
    await onUpdateExerciseDefaults(pe.id, sets, reps, kg)
    setPlanExercises((prev) => prev.map((p) => p.id === pe.id ? { ...p, default_sets: sets, default_reps: reps, default_kg: kg } : p))
  }, [onUpdateExerciseDefaults])

  const color = tagColor(plan.muscle_group)

  return (
    <div className="screen">
      {/* Header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: '56px 20px 14px', background: 'var(--bg)',
        borderBottom: '1px solid var(--line)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
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

          {editingName ? (
            <input
              autoFocus
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRename() }}
              style={{
                flex: 1, appearance: 'none', border: '1px solid var(--lime)',
                background: 'var(--surface-2)', borderRadius: 10, padding: '8px 12px',
                fontFamily: 'var(--font-ui)', fontSize: 20, fontWeight: 700,
                letterSpacing: -0.4, color: 'var(--ink)',
              }}
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              style={{
                flex: 1, appearance: 'none', border: 0, background: 'transparent',
                cursor: 'pointer', textAlign: 'left', padding: 0, minWidth: 0,
              }}>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.4, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {plan.name}
              </div>
            </button>
          )}

          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
              color: '#ef4444', padding: '6px', flexShrink: 0,
            }}>
            <Icon name="trash" size={18} />
          </button>
        </div>

        {/* Group picker */}
        <div style={{ marginTop: 10, display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {MUSCLE_GROUPS.map((g) => {
            const active = plan.muscle_group === g
            const gc = tagColor(g)
            return (
              <button
                key={g}
                onClick={() => onChangePlanGroup(plan.id, g)}
                style={{
                  appearance: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                  padding: '5px 12px', borderRadius: 'var(--r-pill)',
                  border: `1px solid ${active ? gc + '60' : 'var(--line-2)'}`,
                  background: active ? gc + '1A' : 'transparent',
                  fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 600,
                  color: active ? gc : 'var(--muted)',
                  textTransform: 'capitalize',
                }}>
                {tagLabel(g)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Body */}
      <div className="screen-scroll" style={{ paddingTop: 168 }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            Caricamento…
          </div>
        ) : (
          <div style={{ padding: '0 20px' }}>
            {planExercises.length > 0 && (
              <div className="row-group" style={{ marginBottom: 10 }}>
                {planExercises.map((pe, idx) => (
                  <PlanExerciseRow
                    key={pe.id}
                    pe={pe}
                    isLast={idx === planExercises.length - 1}
                    canMoveUp={idx > 0}
                    onMoveUp={() => handleMoveUp(idx)}
                    onRemove={() => handleRemoveExercise(pe.id)}
                    onUpdateDefaults={(sets, reps, kg) => handleUpdateDefaults(pe, sets, reps, kg)}
                  />
                ))}
              </div>
            )}

            <button
              onClick={handleAddExercise}
              style={{
                width: '100%', appearance: 'none', border: '1.5px dashed var(--line-2)',
                background: 'transparent', cursor: 'pointer',
                borderRadius: 'var(--r-md)', padding: '16px',
                display: 'flex', alignItems: 'center', gap: 12,
                color: 'var(--muted)', fontFamily: 'var(--font-ui)',
              }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="plus" size={18} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 600 }}>Aggiungi esercizio</span>
            </button>
          </div>
        )}
      </div>

      {/* Delete confirm sheet */}
      {showDeleteConfirm && (
        <>
          <div className="scrim" onClick={() => setShowDeleteConfirm(false)} />
          <div className="sheet">
            <div className="sheet-grab" />
            <div style={{ padding: '8px 22px 20px', textAlign: 'center' }}>
              <div style={{ marginBottom: 8, color: 'var(--muted)', display: 'flex', justifyContent: 'center' }}><Icon name="trash" size={32} stroke={1.5} /></div>
              <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3, color: 'var(--ink)', marginBottom: 6 }}>
                Elimina scheda?
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: 20 }}>
                Questa azione non può essere annullata.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowDeleteConfirm(false)}>
                  Annulla
                </button>
                <button
                  onClick={async () => { await onDeletePlan(plan.id); onBack() }}
                  style={{
                    flex: 1, appearance: 'none', border: 0, cursor: 'pointer',
                    background: '#ef4444', color: '#fff', borderRadius: 'var(--r-md)',
                    padding: '14px', fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 600,
                  }}>
                  Elimina
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Plan exercise row ─────────────────────────────────────────────

function PlanExerciseRow({
  pe, isLast, canMoveUp, onMoveUp, onRemove, onUpdateDefaults,
}: {
  pe: PlanExercise
  isLast: boolean
  canMoveUp: boolean
  onMoveUp: () => void
  onRemove: () => void
  onUpdateDefaults: (sets: number, reps: number, kg: number) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [sets, setSets] = useState(pe.default_sets)
  const [reps, setReps] = useState(pe.default_reps)
  const [kg, setKg] = useState(pe.default_kg)
  const [saving, setSaving] = useState(false)

  const color = pe.exercise ? tagColor(pe.exercise.tag) : 'var(--muted)'

  const handleSave = async () => {
    setSaving(true)
    try { await onUpdateDefaults(sets, reps, kg) } finally { setSaving(false) }
    setExpanded(false)
  }

  return (
    <div style={{ borderBottom: isLast ? 'none' : '1px solid var(--line)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px' }}>
        {/* Reorder */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
          <button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            style={{
              appearance: 'none', border: 0, background: 'transparent', cursor: canMoveUp ? 'pointer' : 'default',
              color: canMoveUp ? 'var(--muted)' : 'var(--subtle)', padding: 2,
            }}>
            <Icon name="arrowUp" size={14} />
          </button>
        </div>

        {/* Color dot */}
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />

        {/* Name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {pe.exercise?.name ?? pe.exercise_id}
          </div>
          {!expanded && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
              {sets}×{reps} {kg > 0 ? `@ ${kg}kg` : ''}
            </div>
          )}
        </div>

        {/* Edit toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{
            appearance: 'none', border: '1px solid var(--line-2)', background: 'var(--surface-2)',
            cursor: 'pointer', padding: '5px 10px', borderRadius: 8,
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: 'var(--muted)',
          }}>
          {expanded ? 'Chiudi' : 'Edit'}
        </button>

        {/* Remove */}
        <button
          onClick={onRemove}
          style={{
            appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
            color: '#ef4444', padding: '4px', flexShrink: 0,
          }}>
          <Icon name="trash" size={15} />
        </button>
      </div>

      {/* Inline defaults editor */}
      {expanded && (
        <div style={{ padding: '0 16px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <DefaultInput label="Serie" value={sets} onChange={setSets} />
          <DefaultInput label="Reps" value={reps} onChange={setReps} />
          <DefaultInput label="Kg" value={kg} onChange={setKg} step={0.5} />
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              appearance: 'none', border: 0, cursor: 'pointer',
              background: 'var(--lime)', color: 'var(--lime-on)',
              borderRadius: 8, padding: '8px 12px',
              fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700,
              flexShrink: 0,
            }}>
            {saving ? '…' : 'OK'}
          </button>
        </div>
      )}
    </div>
  )
}

function DefaultInput({
  label, value, onChange, step = 1,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  step?: number
}) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
        {label}
      </div>
      <input
        type="number"
        min={0}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        style={{
          width: '100%', appearance: 'none', border: '1px solid var(--line)',
          background: 'var(--surface-2)', borderRadius: 8,
          padding: '7px 4px', textAlign: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: 'var(--ink)',
        }}
      />
    </div>
  )
}
