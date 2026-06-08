import { supabase } from './supabase'
import type { Exercise, PREntry, PRData, UserName } from './types'

// ── Exercises ────────────────────────────────────────────────────

export async function fetchExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('id')
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

// ── Derived helpers ──────────────────────────────────────────────

/**
 * Build a PRData object for a given user+exercise from the full entries list.
 * Returns null if no entries exist.
 */
export function buildPRData(
  entries: PREntry[],
  exerciseId: string
): PRData | null {
  const sorted = entries
    .filter((e) => e.exercise_id === exerciseId)
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())

  if (sorted.length === 0) return null

  // History = last 6 values (all logged values, oldest first)
  const hist = sorted.slice(-6).map((e) => Number(e.value))

  const current = sorted[sorted.length - 1]
  const prev = sorted.length > 1 ? sorted[sorted.length - 2] : null
  const delta = prev ? +(Number(current.value) - Number(prev.value)).toFixed(2) : 0

  const date = formatDate(current.recorded_at)

  return { v: Number(current.value), date, delta, hist }
}

/**
 * Latest PR entry across all exercises for a user (most recent recorded_at).
 */
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
  return {
    exId: latest.exercise_id,
    dateFull: formatDateFull(latest.recorded_at),
  }
}

// Month PR count: PRs recorded in the current calendar month
export function countPRsThisMonth(entries: PREntry[]): number {
  const now = new Date()
  return entries.filter((e) => {
    const d = new Date(e.recorded_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
}

// Consecutive-week streak: count how many back-to-back ISO weeks have ≥1 entry
export function calcStreak(entries: PREntry[]): number {
  if (entries.length === 0) return 0
  const weeks = new Set(entries.map((e) => isoWeek(new Date(e.recorded_at))))
  const sorted = [...weeks].sort((a, b) => b - a)
  let streak = 0
  let expected = isoWeek(new Date())
  for (const w of sorted) {
    if (w === expected) {
      streak++
      expected--
    } else break
  }
  return streak
}

// Top 3 exercises by percentage growth (first entry → current PR)
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

// ── Date formatting ──────────────────────────────────────────────

const IT_MONTHS_SHORT = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']
const IT_MONTHS_FULL = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2, '0')} ${IT_MONTHS_SHORT[d.getMonth()]}`
}

export function formatDateFull(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} ${IT_MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`
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
