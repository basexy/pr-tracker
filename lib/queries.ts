import { supabase } from './supabase'
import type {
  Exercise, PREntry, PRData, UserName,
  WorkoutPlan, PlanExercise, DayAssignment,
  WorkoutSession, ExerciseLog, ExerciseLogSet,
} from './types'

// ── Date helpers ─────────────────────────────────────────────────

export function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function todayStr(): string {
  return toDateStr(new Date())
}

// ── Exercises ────────────────────────────────────────────────────

export async function fetchExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

// ── PR entries ───────────────────────────────────────────────────

export async function fetchAllPREntries(user: UserName): Promise<PREntry[]> {
  const { data, error } = await supabase
    .from('pr_entries')
    .select('*')
    .eq('user_name', user)
    .order('recorded_at', { ascending: true })
  if (error) throw error
  return data
}

export async function insertPREntry(
  user: UserName,
  exerciseId: string,
  value: number,
  recordedAt?: string
): Promise<PREntry> {
  const { data, error } = await supabase
    .from('pr_entries')
    .insert({
      user_name: user,
      exercise_id: exerciseId,
      value,
      recorded_at: recordedAt ?? new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePREntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('pr_entries')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function deleteExercise(id: string): Promise<void> {
  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function updateExercise(
  id: string,
  updates: { name?: string; tag?: string; unit?: string }
): Promise<void> {
  const { error } = await supabase
    .from('exercises')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

// ── Derived PR helpers ───────────────────────────────────────────

export function buildPRData(
  entries: PREntry[],
  exerciseId: string
): PRData | null {
  const sorted = entries
    .filter((e) => e.exercise_id === exerciseId)
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())

  if (sorted.length === 0) return null

  const hist = sorted.slice(-6).map((e) => Number(e.value))
  const current = sorted[sorted.length - 1]
  const prev = sorted.length > 1 ? sorted[sorted.length - 2] : null
  const delta = prev ? +(Number(current.value) - Number(prev.value)).toFixed(2) : 0

  return { v: Number(current.value), date: formatDate(current.recorded_at), delta, hist }
}

export function findLatestEntry(
  entries: PREntry[],
  exercises: Exercise[]
): { exId: string; dateFull: string } | null {
  if (entries.length === 0) return null
  const latest = [...entries].sort(
    (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
  )[0]
  const ex = exercises.find((e) => e.id === latest.exercise_id)
  if (!ex) return null
  return { exId: latest.exercise_id, dateFull: formatDateFull(latest.recorded_at) }
}

export function countPRsThisMonth(entries: PREntry[]): number {
  const now = new Date()
  return entries.filter((e) => {
    const d = new Date(e.recorded_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
}

export function calcStreak(entries: PREntry[]): number {
  if (entries.length === 0) return 0
  const weeks = new Set(entries.map((e) => isoWeek(new Date(e.recorded_at))))
  const sorted = [...weeks].sort((a, b) => b - a)
  let streak = 0
  let expected = isoWeek(new Date())
  for (const w of sorted) {
    if (w === expected) { streak++; expected-- } else break
  }
  return streak
}

export function calcTop3(
  entries: PREntry[],
  exercises: Exercise[]
): { exId: string; growth: string; from: number; to: number }[] {
  return exercises
    .map((ex) => {
      const sorted = entries
        .filter((e) => e.exercise_id === ex.id)
        .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      if (sorted.length < 2) return null
      const from = Number(sorted[0].value)
      const to = Number(sorted[sorted.length - 1].value)
      const pct = ((to - from) / from) * 100
      return { exId: ex.id, growth: `+${Math.round(pct)}%`, from, to }
    })
    .filter(Boolean)
    .sort((a, b) => parseFloat(b!.growth) - parseFloat(a!.growth))
    .slice(0, 3) as { exId: string; growth: string; from: number; to: number }[]
}

// ── Workout Plans ─────────────────────────────────────────────────

export async function fetchWorkoutPlans(): Promise<WorkoutPlan[]> {
  const { data, error } = await supabase
    .from('workout_plans')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function createWorkoutPlan(name: string, muscle_group: string): Promise<WorkoutPlan> {
  const { data, error } = await supabase
    .from('workout_plans')
    .insert({ name, muscle_group })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateWorkoutPlan(id: string, updates: { name?: string; muscle_group?: string }): Promise<void> {
  const { error } = await supabase.from('workout_plans').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteWorkoutPlan(id: string): Promise<void> {
  const { error } = await supabase.from('workout_plans').delete().eq('id', id)
  if (error) throw error
}

// ── Plan Exercises ────────────────────────────────────────────────

export async function fetchPlanExercises(planId: string, exercises: Exercise[]): Promise<PlanExercise[]> {
  const { data, error } = await supabase
    .from('plan_exercises')
    .select('*')
    .eq('plan_id', planId)
    .order('order_index', { ascending: true })
  if (error) throw error
  return (data as PlanExercise[]).map((pe) => ({
    ...pe,
    exercise: exercises.find((e) => e.id === pe.exercise_id),
  }))
}

export async function addPlanExercise(
  planId: string,
  exerciseId: string,
  defaults: { sets?: number; reps?: number; kg?: number },
  orderIndex: number
): Promise<PlanExercise> {
  const { data, error } = await supabase
    .from('plan_exercises')
    .insert({
      plan_id: planId,
      exercise_id: exerciseId,
      default_sets: defaults.sets ?? 3,
      default_reps: defaults.reps ?? 10,
      default_kg: defaults.kg ?? 0,
      order_index: orderIndex,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePlanExercise(
  id: string,
  updates: { default_sets?: number; default_reps?: number; default_kg?: number; order_index?: number }
): Promise<void> {
  const { error } = await supabase.from('plan_exercises').update(updates).eq('id', id)
  if (error) throw error
}

export async function deletePlanExercise(id: string): Promise<void> {
  const { error } = await supabase.from('plan_exercises').delete().eq('id', id)
  if (error) throw error
}

// ── Day Assignments ───────────────────────────────────────────────

export async function fetchDayAssignments(
  user: UserName,
  startDate: string,
  endDate: string
): Promise<DayAssignment[]> {
  const { data, error } = await supabase
    .from('day_assignments')
    .select('*')
    .eq('user_name', user)
    .gte('date', startDate)
    .lte('date', endDate)
  if (error) throw error
  return data
}

export async function upsertDayAssignment(
  user: UserName,
  date: string,
  planId: string | null,
  isRest: boolean
): Promise<DayAssignment> {
  const { data, error } = await supabase
    .from('day_assignments')
    .upsert({ user_name: user, date, plan_id: planId, is_rest: isRest }, { onConflict: 'user_name,date' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteDayAssignment(user: UserName, date: string): Promise<void> {
  const { error } = await supabase
    .from('day_assignments')
    .delete()
    .eq('user_name', user)
    .eq('date', date)
  if (error) throw error
}

// ── Workout Sessions ──────────────────────────────────────────────

export async function fetchWorkoutSessionsRange(
  user: UserName,
  startDate: string,
  endDate: string
): Promise<WorkoutSession[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_name', user)
    .gte('date', startDate)
    .lte('date', endDate)
  if (error) throw error
  return data
}

export async function upsertWorkoutSession(
  user: UserName,
  date: string,
  planId: string | null
): Promise<WorkoutSession> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .upsert({ user_name: user, date, plan_id: planId }, { onConflict: 'user_name,date' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function completeWorkoutSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('workout_sessions')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', sessionId)
  if (error) throw error
}

// ── Exercise Logs ─────────────────────────────────────────────────

export async function fetchExerciseLogs(sessionId: string): Promise<ExerciseLog[]> {
  const { data, error } = await supabase
    .from('exercise_logs')
    .select('*')
    .eq('session_id', sessionId)
    .order('order_index', { ascending: true })
  if (error) throw error
  return (data as ExerciseLog[]).map((l) => ({
    ...l,
    sets: Array.isArray(l.sets) ? l.sets : [],
  }))
}

export async function upsertExerciseLog(
  sessionId: string,
  orderIndex: number,
  exerciseId: string,
  sets: ExerciseLogSet[]
): Promise<ExerciseLog> {
  const { data, error } = await supabase
    .from('exercise_logs')
    .upsert(
      { session_id: sessionId, order_index: orderIndex, exercise_id: exerciseId, sets },
      { onConflict: 'session_id,order_index' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Workout streak ─────────────────────────────────────────────────
// Counts consecutive days backwards where user either completed a workout
// OR had a valid rest day (max 2 rest days per ISO week).

export function calcWorkoutStreak(
  sessions: WorkoutSession[],
  assignments: DayAssignment[]
): number {
  const today = todayStr()
  let streak = 0

  for (let i = 1; i <= 365; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = toDateStr(d)

    const completed = sessions.some((s) => s.date === dateStr && s.completed_at != null)
    const isRestDay = assignments.some((a) => a.date === dateStr && a.is_rest)

    if (completed) {
      streak++
    } else if (isRestDay) {
      // Validate: max 2 rest days in this ISO week
      const weekStart = getWeekMonday(d)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      const restInWeek = assignments.filter((a) => {
        if (!a.is_rest) return false
        const ad = new Date(a.date)
        return ad >= weekStart && ad <= weekEnd
      }).length
      if (restInWeek <= 2) { streak++ } else { break }
    } else {
      break
    }
  }

  void today // suppress unused warning
  return streak
}

// ── Date formatting ──────────────────────────────────────────────

const IT_MONTHS_SHORT = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']
const IT_MONTHS_FULL  = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']
export const IT_DAYS  = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato']
export const IT_DAYS_SHORT = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab']

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2, '0')} ${IT_MONTHS_SHORT[d.getMonth()]}`
}

export function formatDateFull(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} ${IT_MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`
}

export function formatDayLabel(dateStr: string): string {
  const [y, m, day] = dateStr.split('-').map(Number)
  const d = new Date(y, m - 1, day)
  const today = new Date()
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1)
  const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1)
  if (dateStr === toDateStr(today)) return 'oggi'
  if (dateStr === toDateStr(yesterday)) return 'ieri'
  if (dateStr === toDateStr(tomorrow)) return 'domani'
  return IT_DAYS_SHORT[d.getDay()]
}

export function formatDayFull(dateStr: string): string {
  const [y, m, day] = dateStr.split('-').map(Number)
  const d = new Date(y, m - 1, day)
  return `${IT_DAYS_SHORT[d.getDay()]} ${day} ${IT_MONTHS_SHORT[m - 1]}`
}

function isoWeek(d: Date): number {
  const thursday = new Date(d)
  thursday.setDate(d.getDate() - ((d.getDay() + 6) % 7) + 3)
  const firstThursday = new Date(thursday.getFullYear(), 0, 4)
  return (
    1 +
    Math.round(
      ((thursday.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getDay() + 6) % 7)) /
        7
    )
  )
}

function getWeekMonday(d: Date): Date {
  const monday = new Date(d)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1 - day)
  monday.setDate(d.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}
