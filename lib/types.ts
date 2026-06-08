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

export type Accent = 'lime' | 'orange' | 'blue' | 'red'
export type Theme = 'light' | 'dark'

export type Screen =
  | 'dash'
  | 'list'
  | 'hist'
  | 'prof'
  | 'detail'
  | 'create'
