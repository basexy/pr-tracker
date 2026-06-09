export type UserName = 'base' | 'dawg'

export interface Exercise {
  id: string
  name: string
  tag: string
  unit: 'kg' | 'reps'
}

export interface PREntry {
  id: string
  user_name: UserName
  exercise_id: string
  value: number
  recorded_at: string
}

// Derived shape used throughout the UI
export interface PRData {
  v: number          // current PR value
  date: string       // formatted date string, e.g. "04 giu"
  delta: number      // diff from previous PR
  hist: number[]     // last ≤6 values, oldest first
}

// ── Workout types ─────────────────────────────────────────────────

export interface WorkoutPlan {
  id: string
  name: string
  muscle_group: string
  created_at: string
}

export interface PlanExercise {
  id: string
  plan_id: string
  exercise_id: string
  default_sets: number
  default_reps: number
  default_kg: number
  order_index: number
  exercise?: Exercise
}

export interface DayAssignment {
  id: string
  user_name: UserName
  date: string        // YYYY-MM-DD
  plan_id: string | null
  is_rest: boolean
}

export interface WorkoutSession {
  id: string
  user_name: UserName
  date: string        // YYYY-MM-DD
  plan_id: string | null
  completed_at: string | null
}

export interface ExerciseLogSet {
  reps: number
  kg: number
  done: boolean
}

export interface ExerciseLog {
  id: string
  session_id: string
  exercise_id: string
  order_index: number
  sets: ExerciseLogSet[]
}

// ── Navigation ────────────────────────────────────────────────────

export type Accent = 'lime' | 'orange' | 'blue' | 'red'
export type Theme = 'light' | 'dark'

export type Screen =
  | 'dash'
  | 'overview'
  | 'list'
  | 'exercise-library'
  | 'hist'
  | 'prof'
  | 'detail'
  | 'create'
  | 'schede'
  | 'plan-detail'
  | 'exercise-log'
  | 'exercise-picker'

// ── Compound contexts passed between screens ──────────────────────

export interface LogContext {
  exercise: Exercise
  sessionId: string
  orderIndex: number
  defaultSets: number
  defaultReps: number
  defaultKg: number
  existingLog: ExerciseLog | null
}

export interface PickerContext {
  purpose: 'swap-session' | 'add-session' | 'add-plan'
  sessionId?: string
  orderIndex?: number   // for swap: the position being replaced
  planId?: string       // for add-plan
  returnScreen: Screen
}
