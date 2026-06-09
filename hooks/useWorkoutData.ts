'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  fetchWorkoutPlans, fetchPlanExercises,
  fetchDayAssignments, upsertDayAssignment, deleteDayAssignment,
  fetchWorkoutSessionsRange, upsertWorkoutSession,
  fetchExerciseLogs, upsertExerciseLog,
  createWorkoutPlan, updateWorkoutPlan, deleteWorkoutPlan,
  addPlanExercise, updatePlanExercise, deletePlanExercise,
  todayStr, toDateStr, calcWorkoutStreak,
} from '@/lib/queries'
import type {
  Exercise, UserName,
  WorkoutPlan, PlanExercise,
  DayAssignment, WorkoutSession, ExerciseLog, ExerciseLogSet,
} from '@/lib/types'

export interface WorkoutDayData {
  assignment: DayAssignment | null
  session: WorkoutSession | null
  planExercises: PlanExercise[]
  exerciseLogs: ExerciseLog[]
}

export interface UseWorkoutDataReturn {
  // Global
  workoutPlans: WorkoutPlan[]
  // Current day
  currentDate: string
  dayData: WorkoutDayData
  dayLoading: boolean
  // Streak
  workoutStreak: number
  // Navigation
  navigateDay: (delta: number) => void
  goToDate: (date: string) => void
  // Day actions
  assignPlan: (planId: string) => Promise<void>
  markRest: () => Promise<void>
  clearDay: () => Promise<void>
  // Session + logging
  ensureSession: (planId: string | null) => Promise<WorkoutSession>
  logExercise: (sessionId: string, orderIndex: number, exerciseId: string, sets: ExerciseLogSet[]) => Promise<void>
  // Plan management
  createPlan: (name: string, muscleGroup: string) => Promise<WorkoutPlan>
  renamePlan: (planId: string, name: string) => Promise<void>
  changePlanGroup: (planId: string, muscleGroup: string) => Promise<void>
  removePlan: (planId: string) => Promise<void>
  addExerciseToPlan: (planId: string, exerciseId: string, orderIndex: number) => Promise<PlanExercise>
  updateExerciseDefaults: (planExerciseId: string, sets: number, reps: number, kg: number) => Promise<void>
  removeExerciseFromPlan: (planExerciseId: string) => Promise<void>
  loadPlanExercises: (planId: string, allExercises: Exercise[]) => Promise<PlanExercise[]>
  // Refetch
  refetchPlans: () => void
  refetchDay: () => void
}

export function useWorkoutData(user: UserName, allExercises: Exercise[]): UseWorkoutDataReturn {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([])
  const [currentDate, setCurrentDate] = useState(todayStr())
  const [dayData, setDayData] = useState<WorkoutDayData>({
    assignment: null, session: null, planExercises: [], exerciseLogs: [],
  })
  const [dayLoading, setDayLoading] = useState(false)
  const [workoutStreak, setWorkoutStreak] = useState(0)
  const [plansTick, setPlansTick] = useState(0)
  const [dayTick, setDayTick] = useState(0)

  // Load plans (global, once + on refetch)
  useEffect(() => {
    fetchWorkoutPlans().then(setWorkoutPlans).catch(() => {})
  }, [plansTick])

  // Load day-specific data
  useEffect(() => {
    if (!user || allExercises.length === 0) return
    let cancelled = false
    setDayLoading(true)

    async function load() {
      // Fetch range ±60 days for streak calculation
      const d = new Date(currentDate)
      const rangeStart = toDateStr(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 90))
      const rangeEnd   = toDateStr(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 30))

      const [assignments, sessions] = await Promise.all([
        fetchDayAssignments(user, rangeStart, rangeEnd),
        fetchWorkoutSessionsRange(user, rangeStart, rangeEnd),
      ])

      if (cancelled) return

      const streak = calcWorkoutStreak(sessions, assignments)
      setWorkoutStreak(streak)

      const assignment = assignments.find((a) => a.date === currentDate) ?? null
      const session = sessions.find((s) => s.date === currentDate) ?? null

      let planExercises: PlanExercise[] = []
      if (assignment?.plan_id) {
        planExercises = await fetchPlanExercises(assignment.plan_id, allExercises)
      }

      let exerciseLogs: ExerciseLog[] = []
      if (session) {
        exerciseLogs = await fetchExerciseLogs(session.id)
      }

      if (!cancelled) {
        setDayData({ assignment, session, planExercises, exerciseLogs })
        setDayLoading(false)
      }
    }

    load().catch(() => { if (!cancelled) setDayLoading(false) })
    return () => { cancelled = true }
  }, [user, currentDate, dayTick, allExercises])

  const navigateDay = useCallback((delta: number) => {
    setCurrentDate((prev) => {
      const [y, m, d] = prev.split('-').map(Number)
      const date = new Date(y, m - 1, d)
      date.setDate(date.getDate() + delta)
      return toDateStr(date)
    })
  }, [])

  const goToDate = useCallback((date: string) => setCurrentDate(date), [])

  const assignPlan = useCallback(async (planId: string) => {
    const updated = await upsertDayAssignment(user, currentDate, planId, false)
    const planExercises = await fetchPlanExercises(planId, allExercises)
    setDayData((prev) => ({ ...prev, assignment: updated, planExercises }))
  }, [user, currentDate, allExercises])

  const markRest = useCallback(async () => {
    const updated = await upsertDayAssignment(user, currentDate, null, true)
    setDayData((prev) => ({ ...prev, assignment: updated, planExercises: [] }))
  }, [user, currentDate])

  const clearDay = useCallback(async () => {
    await deleteDayAssignment(user, currentDate)
    setDayData((prev) => ({ ...prev, assignment: null, planExercises: [] }))
  }, [user, currentDate])

  const ensureSession = useCallback(async (planId: string | null): Promise<WorkoutSession> => {
    if (dayData.session) return dayData.session
    const session = await upsertWorkoutSession(user, currentDate, planId)
    setDayData((prev) => ({ ...prev, session }))
    return session
  }, [user, currentDate, dayData.session])

  const logExercise = useCallback(async (
    sessionId: string,
    orderIndex: number,
    exerciseId: string,
    sets: ExerciseLogSet[]
  ) => {
    const log = await upsertExerciseLog(sessionId, orderIndex, exerciseId, sets)
    setDayData((prev) => {
      const existing = prev.exerciseLogs.findIndex((l) => l.order_index === orderIndex)
      const updated = existing >= 0
        ? prev.exerciseLogs.map((l, i) => i === existing ? log : l)
        : [...prev.exerciseLogs, log].sort((a, b) => a.order_index - b.order_index)
      return { ...prev, exerciseLogs: updated }
    })
  }, [])

  // Plan management
  const createPlan = useCallback(async (name: string, muscleGroup: string) => {
    const plan = await createWorkoutPlan(name, muscleGroup)
    setWorkoutPlans((prev) => [...prev, plan])
    return plan
  }, [])

  const renamePlan = useCallback(async (planId: string, name: string) => {
    await updateWorkoutPlan(planId, { name })
    setWorkoutPlans((prev) => prev.map((p) => p.id === planId ? { ...p, name } : p))
  }, [])

  const changePlanGroup = useCallback(async (planId: string, muscle_group: string) => {
    await updateWorkoutPlan(planId, { muscle_group })
    setWorkoutPlans((prev) => prev.map((p) => p.id === planId ? { ...p, muscle_group } : p))
  }, [])

  const removePlan = useCallback(async (planId: string) => {
    await deleteWorkoutPlan(planId)
    setWorkoutPlans((prev) => prev.filter((p) => p.id !== planId))
  }, [])

  const addExerciseToPlan = useCallback(async (
    planId: string, exerciseId: string, orderIndex: number
  ) => {
    return addPlanExercise(planId, exerciseId, {}, orderIndex)
  }, [])

  const updateExerciseDefaults = useCallback(async (
    planExerciseId: string, sets: number, reps: number, kg: number
  ) => {
    await updatePlanExercise(planExerciseId, { default_sets: sets, default_reps: reps, default_kg: kg })
  }, [])

  const removeExerciseFromPlan = useCallback(async (planExerciseId: string) => {
    await deletePlanExercise(planExerciseId)
  }, [])

  const loadPlanExercises = useCallback(async (planId: string, exercises: Exercise[]) => {
    return fetchPlanExercises(planId, exercises)
  }, [])

  const refetchPlans = useCallback(() => setPlansTick((n) => n + 1), [])
  const refetchDay = useCallback(() => setDayTick((n) => n + 1), [])

  // Realtime sync for workout tables
  useEffect(() => {
    const channel = supabase
      .channel('workout_changes')
      // workout_plans: update state inline
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'workout_plans' },
        (payload) => {
          const p = payload.new as WorkoutPlan
          setWorkoutPlans((prev) => prev.some((x) => x.id === p.id) ? prev : [...prev, p])
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'workout_plans' },
        (payload) => {
          const p = payload.new as WorkoutPlan
          setWorkoutPlans((prev) => prev.map((x) => x.id === p.id ? p : x))
        }
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'workout_plans' },
        (payload) => {
          const id = (payload.old as { id: string }).id
          setWorkoutPlans((prev) => prev.filter((x) => x.id !== id))
        }
      )
      // Day-specific tables: refetch (data is cross-referenced by user + date)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'day_assignments' },
        () => setDayTick((n) => n + 1)
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workout_sessions' },
        () => setDayTick((n) => n + 1)
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exercise_logs' },
        () => setDayTick((n) => n + 1)
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plan_exercises' },
        () => setDayTick((n) => n + 1)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return {
    workoutPlans, currentDate, dayData, dayLoading, workoutStreak,
    navigateDay, goToDate,
    assignPlan, markRest, clearDay,
    ensureSession, logExercise,
    createPlan, renamePlan, changePlanGroup, removePlan,
    addExerciseToPlan, updateExerciseDefaults, removeExerciseFromPlan,
    loadPlanExercises,
    refetchPlans, refetchDay,
  }
}
