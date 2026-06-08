'use client'

import { useRef, useState, useCallback } from 'react'
import Icon, { tagColor, tagLabel } from '@/components/Icon'
import type {
  Exercise, UserName, WorkoutPlan, PlanExercise,
  ExerciseLog, WorkoutSession, DayAssignment, LogContext, PickerContext,
} from '@/lib/types'
import type { WorkoutDayData } from '@/hooks/useWorkoutData'
import { formatDayFull, formatDayLabel, todayStr } from '@/lib/queries'
interface WorkoutDiaryProps {
  user: UserName
  onUser: (u: UserName) => void
  currentDate: string
  dayData: WorkoutDayData
  dayLoading: boolean
  workoutPlans: WorkoutPlan[]
  allExercises: Exercise[]
  workoutStreak: number
  navigateDay: (delta: number) => void
  onAssignPlan: (planId: string) => Promise<void>
  onMarkRest: () => Promise<void>
  onClearDay: () => Promise<void>
  onOpenExerciseLog: (ctx: LogContext) => Promise<void>
  onOpenExercisePicker: (ctx: PickerContext) => void
  onEnsureSession: (planId: string | null) => Promise<WorkoutSession>
}

interface EffectiveExercise {
  orderIndex: number
  exerciseId: string
  exercise: Exercise | null
  defaultSets: number
  defaultReps: number
  defaultKg: number
  log: ExerciseLog | null
  isDone: boolean
}

function buildEffectiveExercises(
  planExercises: PlanExercise[],
  exerciseLogs: ExerciseLog[],
  allExercises: Exercise[]
): EffectiveExercise[] {
  const result: EffectiveExercise[] = []
  const loggedIndices = new Set(exerciseLogs.map((l) => l.order_index))

  for (const pe of planExercises) {
    const log = exerciseLogs.find((l) => l.order_index === pe.order_index) ?? null
    const exerciseId = log?.exercise_id ?? pe.exercise_id
    const exercise = allExercises.find((e) => e.id === exerciseId) ?? null
    const isDone = log != null && log.sets.length > 0 && log.sets.every((s) => s.done)
    result.push({
      orderIndex: pe.order_index,
      exerciseId,
      exercise,
      defaultSets: pe.default_sets,
      defaultReps: pe.default_reps,
      defaultKg: pe.default_kg,
      log,
      isDone,
    })
  }

  // Extra exercises added by user (order_index not in plan)
  const planIndices = new Set(planExercises.map((pe) => pe.order_index))
  for (const log of exerciseLogs.filter((l) => !planIndices.has(l.order_index))) {
    const exercise = allExercises.find((e) => e.id === log.exercise_id) ?? null
    const isDone = log.sets.length > 0 && log.sets.every((s) => s.done)
    result.push({
      orderIndex: log.order_index,
      exerciseId: log.exercise_id,
      exercise,
      defaultSets: 3,
      defaultReps: 10,
      defaultKg: 0,
      log,
      isDone,
    })
  }

  return result.sort((a, b) => a.orderIndex - b.orderIndex)
}

function countRestDaysThisWeek(currentDate: string, assignments: DayAssignment[]): number {
  const [y, m, d] = currentDate.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const day = date.getDay()
  const monday = new Date(date)
  monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const monStr = `${monday.getFullYear()}-${String(monday.getMonth()+1).padStart(2,'0')}-${String(monday.getDate()).padStart(2,'0')}`
  const sunStr = `${sunday.getFullYear()}-${String(sunday.getMonth()+1).padStart(2,'0')}-${String(sunday.getDate()).padStart(2,'0')}`

  return assignments.filter((a) => a.is_rest && a.date >= monStr && a.date <= sunStr).length
}

export default function WorkoutDiary({
  user, onUser, currentDate, dayData, dayLoading, workoutPlans, allExercises,
  workoutStreak, navigateDay, onAssignPlan, onMarkRest, onClearDay,
  onOpenExerciseLog, onOpenExercisePicker, onEnsureSession,
}: WorkoutDiaryProps) {
  const { assignment, session, planExercises, exerciseLogs } = dayData
  const plan = workoutPlans.find((p) => p.id === assignment?.plan_id) ?? null
  const effectiveExercises = buildEffectiveExercises(planExercises, exerciseLogs, allExercises)
  const isToday = currentDate === todayStr()

  // Swipe gesture state
  const swipeStartX = useRef<number | null>(null)
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    swipeStartX.current = e.clientX
    setSwipeDir(null)
  }, [])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (swipeStartX.current === null) return
    const delta = e.clientX - swipeStartX.current
    swipeStartX.current = null
    if (Math.abs(delta) < 60) return
    if (delta > 0) {
      setSwipeDir('right')
      navigateDay(-1)
    } else {
      setSwipeDir('left')
      navigateDay(1)
    }
    setTimeout(() => setSwipeDir(null), 320)
  }, [navigateDay])

  const handleOpenLog = useCallback(async (eff: EffectiveExercise) => {
    if (!eff.exercise) return
    const planId = assignment?.plan_id ?? null
    const s = await onEnsureSession(planId)
    const ctx: LogContext = {
      exercise: eff.exercise,
      sessionId: s.id,
      orderIndex: eff.orderIndex,
      defaultSets: eff.defaultSets,
      defaultReps: eff.defaultReps,
      defaultKg: eff.defaultKg,
      existingLog: eff.log,
    }
    onOpenExerciseLog(ctx)
  }, [assignment, onEnsureSession, onOpenExerciseLog])

  const handleSwapExercise = useCallback(async (e: React.MouseEvent, eff: EffectiveExercise) => {
    e.stopPropagation()
    const planId = assignment?.plan_id ?? null
    const s = await onEnsureSession(planId)
    onOpenExercisePicker({
      purpose: 'swap-session',
      sessionId: s.id,
      orderIndex: eff.orderIndex,
      returnScreen: 'dash',
    })
  }, [assignment, onEnsureSession, onOpenExercisePicker])

  const handleAddExercise = useCallback(async () => {
    const planId = assignment?.plan_id ?? null
    const s = await onEnsureSession(planId)
    const nextIndex = effectiveExercises.length > 0
      ? Math.max(...effectiveExercises.map((e) => e.orderIndex)) + 1
      : 0
    onOpenExercisePicker({
      purpose: 'add-session',
      sessionId: s.id,
      orderIndex: nextIndex,
      returnScreen: 'dash',
    })
  }, [assignment, onEnsureSession, onOpenExercisePicker, effectiveExercises])

  const [assigningPlan, setAssigningPlan] = useState(false)

  const dayLabel = formatDayFull(currentDate)
  const relLabel = formatDayLabel(currentDate)
  const isRest = assignment?.is_rest === true

  const planColor = plan ? tagColor(plan.muscle_group) : 'var(--lime)'

  // Compact plan-assign sheet
  const [showPlanSheet, setShowPlanSheet] = useState(false)

  const animClass = swipeDir === 'left' ? 'slide-in-left' : swipeDir === 'right' ? 'slide-in-right' : ''

  return (
    <div className="screen" style={{ touchAction: 'pan-y' }}>
      {/* Header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: '56px 20px 12px',
        background: 'var(--bg)',
        borderBottom: '1px solid var(--line)',
      }}>
        {/* Day navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
          <button
            onClick={() => navigateDay(-1)}
            style={{
              appearance: 'none', border: 0, background: 'var(--surface-2)', cursor: 'pointer',
              width: 34, height: 34, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--muted)', flexShrink: 0,
            }}>
            <Icon name="chevL" size={18} />
          </button>

          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, color: 'var(--ink)', lineHeight: 1.1, textTransform: 'capitalize' }}>
              {dayLabel}
            </div>
            {isToday && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--lime-deep)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>
                oggi
              </div>
            )}
          </div>

          <button
            onClick={() => navigateDay(1)}
            style={{
              appearance: 'none', border: 0, background: 'var(--surface-2)', cursor: 'pointer',
              width: 34, height: 34, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--muted)', flexShrink: 0,
            }}>
            <Icon name="chevR" size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div
        className={`screen-scroll ${animClass}`}
        style={{ paddingTop: 112 }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {dayLoading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1 }}>
            Caricamento…
          </div>
        ) : isRest ? (
          // ── Rest day ────────────────────────────────────────────
          <RestDayView
            streak={workoutStreak}
            onClearDay={onClearDay}
          />
        ) : plan ? (
          // ── Assigned plan ───────────────────────────────────────
          <>
            <div style={{ padding: '12px 20px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                      letterSpacing: 1.5, textTransform: 'uppercase',
                      color: planColor,
                      background: planColor + '22',
                      padding: '3px 8px', borderRadius: 6,
                    }}>
                      {tagLabel(plan.muscle_group)}
                    </span>
                    {workoutStreak > 0 && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--lime-deep)', letterSpacing: 0.5 }}>
                        🔥 {workoutStreak} giorni
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.4, color: 'var(--ink)' }}>
                    {plan.name}
                  </div>
                </div>
                <button
                  onClick={() => setShowPlanSheet(true)}
                  style={{
                    appearance: 'none', border: '1px solid var(--line-2)', background: 'transparent',
                    cursor: 'pointer', padding: '6px 12px', borderRadius: 10,
                    fontSize: 12, fontWeight: 600, color: 'var(--muted)', fontFamily: 'var(--font-ui)',
                  }}>
                  Cambia
                </button>
              </div>
            </div>

            {/* Exercise list */}
            <div style={{ padding: '0 20px' }}>
              <div className="row-group">
                {effectiveExercises.map((eff, idx) => (
                  <ExerciseRow
                    key={`${eff.orderIndex}-${eff.exerciseId}`}
                    eff={eff}
                    isLast={idx === effectiveExercises.length - 1}
                    onTap={() => handleOpenLog(eff)}
                    onSwap={(e) => handleSwapExercise(e, eff)}
                  />
                ))}
              </div>

              {/* Add exercise card */}
              <button
                onClick={handleAddExercise}
                style={{
                  width: '100%', appearance: 'none', border: '1.5px dashed var(--line-2)',
                  background: 'transparent', cursor: 'pointer',
                  borderRadius: 'var(--r-md)', padding: '16px 18px', marginTop: 8,
                  display: 'flex', alignItems: 'center', gap: 12,
                  color: 'var(--muted)', fontFamily: 'var(--font-ui)',
                }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: 'var(--surface-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name="plus" size={18} />
                </div>
                <span style={{ fontSize: 15, fontWeight: 600 }}>Aggiungi esercizio</span>
              </button>
            </div>
          </>
        ) : (
          // ── Empty state ─────────────────────────────────────────
          <EmptyDayView
            workoutPlans={workoutPlans}
            currentDate={currentDate}
            onAssignPlan={onAssignPlan}
            onMarkRest={onMarkRest}
          />
        )}
      </div>

      {/* Plan picker sheet */}
      {showPlanSheet && (
        <PlanPickerSheet
          plans={workoutPlans}
          currentPlanId={assignment?.plan_id ?? null}
          onSelect={async (planId) => {
            setShowPlanSheet(false)
            await onAssignPlan(planId)
          }}
          onMarkRest={async () => {
            setShowPlanSheet(false)
            await onMarkRest()
          }}
          onClearDay={async () => {
            setShowPlanSheet(false)
            await onClearDay()
          }}
          onClose={() => setShowPlanSheet(false)}
        />
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────

function ExerciseRow({
  eff, isLast, onTap, onSwap,
}: {
  eff: EffectiveExercise
  isLast: boolean
  onTap: () => void
  onSwap: (e: React.MouseEvent) => void
}) {
  const color = eff.exercise ? tagColor(eff.exercise.tag) : 'var(--muted)'
  const setsLabel = eff.log?.sets.length
    ? `${eff.log.sets.length} serie`
    : `${eff.defaultSets}×${eff.defaultReps}`
  const kgLabel = eff.defaultKg > 0 ? ` @ ${eff.defaultKg} kg` : ''

  return (
    <button
      onClick={onTap}
      style={{
        width: '100%', appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px',
        borderBottom: isLast ? 'none' : '1px solid var(--line)',
        textAlign: 'left',
      }}>
      {/* Color dot + done indicator */}
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: color + '18',
        border: `1.5px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <Icon name="barbell" size={20} stroke={1.6} />
        {eff.isDone && (
          <div style={{
            position: 'absolute', bottom: -3, right: -3,
            width: 16, height: 16, borderRadius: 8,
            background: 'var(--lime)', color: 'var(--lime-on)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="check" size={10} stroke={2.5} />
          </div>
        )}
      </div>

      {/* Name + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15, fontWeight: 600, color: 'var(--ink)',
          letterSpacing: -0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {eff.exercise?.name ?? '—'}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
          {setsLabel}{kgLabel}
        </div>
      </div>

      {/* Swap button */}
      <button
        onClick={onSwap}
        style={{
          appearance: 'none', border: '1px solid var(--line-2)', background: 'var(--surface-2)',
          cursor: 'pointer', width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--muted)',
        }}>
        <Icon name="swap" size={16} />
      </button>
    </button>
  )
}

function EmptyDayView({
  workoutPlans, currentDate, onAssignPlan, onMarkRest,
}: {
  workoutPlans: WorkoutPlan[]
  currentDate: string
  onAssignPlan: (planId: string) => Promise<void>
  onMarkRest: () => Promise<void>
}) {
  const [showPlans, setShowPlans] = useState(false)

  return (
    <div style={{ padding: '20px 20px' }}>
      <div style={{ textAlign: 'center', padding: '32px 0 24px' }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>📋</div>
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3, color: 'var(--ink)' }}>
          Nessun allenamento
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>
          Assegna una scheda o segnala riposo
        </div>
      </div>

      {showPlans ? (
        <div className="row-group" style={{ marginBottom: 8 }}>
          {workoutPlans.map((p, i) => (
            <button
              key={p.id}
              onClick={() => { onAssignPlan(p.id); setShowPlans(false) }}
              style={{
                width: '100%', appearance: 'none', border: 0, background: 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px',
                borderBottom: i < workoutPlans.length - 1 ? '1px solid var(--line)' : 'none',
                textAlign: 'left',
              }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                background: tagColor(p.muscle_group),
              }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{p.name}</span>
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
                {tagLabel(p.muscle_group)}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <button className="btn btn-primary" style={{ marginBottom: 8 }} onClick={() => setShowPlans(true)}>
          Assegna scheda
        </button>
      )}

      <button
        className="btn btn-ghost"
        style={{ width: '100%' }}
        onClick={onMarkRest}>
        Giorno di riposo
      </button>
    </div>
  )
}

function RestDayView({ streak, onClearDay }: { streak: number; onClearDay: () => Promise<void> }) {
  return (
    <div style={{ padding: '20px 20px', textAlign: 'center' }}>
      <div style={{ padding: '40px 0 24px' }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>😴</div>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5, color: 'var(--ink)' }}>
          Giorno di Riposo
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>
          Il riposo fa parte del progresso
        </div>
        {streak > 0 && (
          <div style={{
            marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--surface)', border: '1px solid var(--line)',
            borderRadius: 'var(--r-pill)', padding: '8px 16px',
          }}>
            <span style={{ fontSize: 16 }}>🔥</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
              {streak} giorni di streak
            </span>
          </div>
        )}
      </div>
      <button className="btn btn-ghost" style={{ width: '100%' }} onClick={onClearDay}>
        Rimuovi riposo
      </button>
    </div>
  )
}

function PlanPickerSheet({
  plans, currentPlanId, onSelect, onMarkRest, onClearDay, onClose,
}: {
  plans: WorkoutPlan[]
  currentPlanId: string | null
  onSelect: (planId: string) => void
  onMarkRest: () => void
  onClearDay: () => void
  onClose: () => void
}) {
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-grab" />
        <div className="sheet-header">
          <div>
            <div className="sheet-title">Cambia scheda</div>
          </div>
          <button className="sheet-close" onClick={onClose}><Icon name="close" size={15} /></button>
        </div>
        <div className="sheet-content" style={{ paddingBottom: 16 }}>
          <div className="row-group" style={{ marginBottom: 10 }}>
            {plans.map((p, i) => (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                style={{
                  width: '100%', appearance: 'none', border: 0, background: 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px',
                  borderBottom: i < plans.length - 1 ? '1px solid var(--line)' : 'none',
                  textAlign: 'left',
                }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                  background: tagColor(p.muscle_group),
                }} />
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{p.name}</span>
                {p.id === currentPlanId && (
                  <span style={{ marginLeft: 'auto', color: 'var(--lime-deep)' }}><Icon name="check" size={16} /></span>
                )}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onMarkRest}>
              😴 Riposo
            </button>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClearDay}>
              Cancella
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
