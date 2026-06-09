'use client'

import { useCallback, useState } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useTheme } from '@/contexts/ThemeContext'
import { usePRData, useEntriesFor } from '@/hooks/usePRData'
import { useWorkoutData } from '@/hooks/useWorkoutData'
import { insertPREntry, buildPRData, deletePREntry, deleteExercise } from '@/lib/queries'
import type { Screen, UserName, LogContext, PickerContext } from '@/lib/types'

import IOSStatusBar from '@/components/IOSStatusBar'
import TabBar from '@/components/primitives/TabBar'

// Screens — PR tracker (unchanged)
import Dashboard from '@/components/screens/Dashboard'
import PRList from '@/components/screens/PRList'
import ExerciseList from '@/components/screens/ExerciseList'
import ExerciseDetail from '@/components/screens/ExerciseDetail'
import ExerciseCreate from '@/components/screens/ExerciseCreate'
import HistoryScreen from '@/components/screens/HistoryScreen'
import ProfileScreen from '@/components/screens/ProfileScreen'
import PRInputSheet from '@/components/input/PRInputSheet'
import Celebration from '@/components/Celebration'

// Screens — Workout tracker (new)
import WorkoutDiary from '@/components/screens/WorkoutDiary'
import ExerciseLogging from '@/components/screens/ExerciseLogging'
import ExercisePicker from '@/components/screens/ExercisePicker'
import SchedeList from '@/components/screens/SchedeList'
import PlanDetail from '@/components/screens/PlanDetail'

// ── User picker (first launch) ────────────────────────────────────
function UserPicker({ onSelect }: { onSelect: (u: UserName) => void }) {
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#FAF8F1', padding: '0 32px', textAlign: 'center',
      gap: 8,
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#7A7468', marginBottom: 8 }}>
        WORKOUT.TRACKER
      </div>
      <h1 style={{ margin: 0, fontSize: 38, fontWeight: 800, letterSpacing: -1.5, color: '#161412' }}>
        Chi sei?
      </h1>
      <p style={{ color: '#7A7468', fontSize: 14, margin: '8px 0 32px', fontFamily: 'var(--font-mono)' }}>
        Scegli il tuo profilo per iniziare.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
        {(['base', 'dawg'] as UserName[]).map((u) => (
          <button key={u} onClick={() => onSelect(u)} style={{
            appearance: 'none', border: 0, cursor: 'pointer',
            padding: '18px', borderRadius: 18,
            background: '#161412', color: '#C0E840',
            fontFamily: 'var(--font-ui)', fontSize: 20, fontWeight: 700, letterSpacing: -0.5,
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'rgba(192,232,64,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 800,
            }}>
              {u[0].toUpperCase()}
            </div>
            {u[0].toUpperCase() + u.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main app ──────────────────────────────────────────────────────
export default function PRTrackerApp() {
  const { user, setUser } = useUser()
  const { theme, setTheme, accent, setAccent } = useTheme()

  const [screen, setScreen] = useState<Screen>('dash')

  // ── PR tracker state ──────────────────────────────────────────
  const [exerciseId, setExerciseId] = useState<string | null>(null)
  const [inputOpen, setInputOpen] = useState(false)
  const [celebration, setCelebration] = useState<{ exId: string; value: number; prevPR: number } | null>(null)

  const { exercises, baseEntries, dawgEntries, loading, refetch } = usePRData()
  const entries = useEntriesFor(baseEntries, dawgEntries, user ?? 'base')
  const otherEntries = useEntriesFor(baseEntries, dawgEntries, user === 'base' ? 'dawg' : 'base')

  // ── Workout tracker state ─────────────────────────────────────
  const [logContext, setLogContext] = useState<LogContext | null>(null)
  const [pickerContext, setPickerContext] = useState<PickerContext | null>(null)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [editExerciseId, setEditExerciseId] = useState<string | null>(null)
  const [createSource, setCreateSource] = useState<'list' | 'picker' | 'prof' | 'exercise-library'>('list')
  const [detailSource, setDetailSource] = useState<Screen>('list')

  const workout = useWorkoutData(user ?? 'base', exercises)

  // ── Navigation ────────────────────────────────────────────────
  const handleNav = useCallback((target: Screen) => {
    setScreen(target)
  }, [])

  const openExercise = useCallback((id: string, source: Screen = 'list') => {
    setExerciseId(id)
    setDetailSource(source)
    setScreen('detail')
  }, [])

  // ── PR tracker actions ────────────────────────────────────────
  const handleSavePR = useCallback(async ({
    exId, value, isPR, date,
  }: { exId: string; value: number; isPR: boolean; date: string }) => {
    if (!user) return
    const prevPR = buildPRData(entries, exId)
    let recordedAt: string | undefined
    if (date) {
      const [y, m, d] = date.split('-').map(Number)
      recordedAt = new Date(y, m - 1, d, 12, 0, 0).toISOString()
    }
    await insertPREntry(user, exId, value, recordedAt)
    setInputOpen(false)
    refetch()
    if (isPR) setCelebration({ exId, value, prevPR: prevPR?.v ?? 0 })
  }, [user, entries, refetch])

  const handleDeleteEntry = useCallback(async (id: string) => {
    await deletePREntry(id)
    refetch()
  }, [refetch])

  const handleDeleteExercise = useCallback(async (id: string) => {
    await deleteExercise(id)
    refetch()
  }, [refetch])

  const closeCelebration = useCallback(() => {
    const exId = celebration?.exId ?? null
    setCelebration(null)
    if (exId) { setExerciseId(exId); setScreen('detail') }
  }, [celebration])

  // ── Workout diary actions ─────────────────────────────────────
  const handleOpenExerciseLog = useCallback(async (ctx: LogContext) => {
    setLogContext(ctx)
    setScreen('exercise-log')
  }, [])

  const handleOpenExercisePicker = useCallback((ctx: PickerContext) => {
    setPickerContext(ctx)
    setScreen('exercise-picker')
  }, [])

  const handlePickerSelect = useCallback(async (exercise: { id: string }) => {
    if (!pickerContext) return
    const ctx = pickerContext

    if (ctx.purpose === 'swap-session' && ctx.sessionId != null && ctx.orderIndex != null) {
      await workout.logExercise(ctx.sessionId, ctx.orderIndex, exercise.id, [])
    } else if (ctx.purpose === 'add-session' && ctx.sessionId != null && ctx.orderIndex != null) {
      await workout.logExercise(ctx.sessionId, ctx.orderIndex, exercise.id, [])
    } else if (ctx.purpose === 'add-plan' && ctx.planId != null && ctx.orderIndex != null) {
      const newPe = await workout.addExerciseToPlan(ctx.planId, exercise.id, ctx.orderIndex)
      // Refetch plan exercises by navigating back to plan-detail
    }

    workout.refetchDay()
    setPickerContext(null)
    setScreen(ctx.returnScreen)
  }, [pickerContext, workout])

  // ── Active tab calculation ─────────────────────────────────────
  const TAB_SCREENS: Screen[] = ['dash', 'schede', 'overview', 'list', 'prof']
  const activeTab: Screen | null = TAB_SCREENS.includes(screen) ? screen : null

  const currentEx = exerciseId ? exercises.find((e) => e.id === exerciseId) : null
  const selectedPlan = selectedPlanId ? workout.workoutPlans.find((p) => p.id === selectedPlanId) ?? null : null

  if (user === null) {
    return (
      <div className="app-outer" style={{ background: '#ECEBE6' }}>
        <div className="phone-frame" data-theme="light" style={{ background: '#FAF8F1' }}>
          <div className="dynamic-island" style={{
            position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
            width: 126, height: 37, borderRadius: 24, background: '#000', zIndex: 1000,
          }} />
          <UserPicker onSelect={setUser} />
        </div>
      </div>
    )
  }

  function renderScreen() {
    switch (screen) {
      // ── Workout diary ──────────────────────────────────────────
      case 'dash':
        return (
          <WorkoutDiary
            user={user!} onUser={setUser}
            currentDate={workout.currentDate}
            dayData={workout.dayData}
            dayLoading={workout.dayLoading}
            workoutPlans={workout.workoutPlans}
            allExercises={exercises}
            workoutStreak={workout.workoutStreak}
            navigateDay={workout.navigateDay}
            onAssignPlan={workout.assignPlan}
            onMarkRest={workout.markRest}
            onClearDay={workout.clearDay}
            onOpenExerciseLog={handleOpenExerciseLog}
            onOpenExercisePicker={handleOpenExercisePicker}
            onEnsureSession={workout.ensureSession}
          />
        )

      case 'exercise-log':
        return logContext ? (
          <ExerciseLogging
            ctx={logContext}
            entries={entries}
            otherEntries={otherEntries}
            otherName={user === 'base' ? 'Dawg' : 'Base'}
            onBack={() => setScreen('dash')}
            onSave={workout.logExercise}
          />
        ) : null

      case 'exercise-picker':
        return pickerContext ? (
          <ExercisePicker
            ctx={pickerContext}
            exercises={exercises}
            onSelect={handlePickerSelect}
            onBack={() => setScreen(pickerContext.returnScreen)}
            onCreateNew={() => {
              setCreateSource('picker')
              setScreen('create')
            }}
          />
        ) : null

      // ── Overview (PR dashboard) ────────────────────────────────
      case 'overview':
        return (
          <Dashboard
            user={user!} onUser={setUser}
            exercises={exercises}
            baseEntries={baseEntries}
            dawgEntries={dawgEntries}
            workoutStreak={workout.workoutStreak}
            onOpenExercise={openExercise}
            onNav={(t) => { if (t === 'input') setInputOpen(true); else handleNav(t as Screen) }}
          />
        )

      // ── Schede ─────────────────────────────────────────────────
      case 'schede':
        return (
          <SchedeList
            user={user!} onUser={setUser}
            workoutPlans={workout.workoutPlans}
            onOpenPlan={(planId) => { setSelectedPlanId(planId); setScreen('plan-detail') }}
            onCreatePlan={workout.createPlan}
          />
        )

      case 'plan-detail':
        return selectedPlan ? (
          <PlanDetail
            plan={selectedPlan}
            allExercises={exercises}
            onBack={() => { setSelectedPlanId(null); setScreen('schede') }}
            onRenamePlan={workout.renamePlan}
            onChangePlanGroup={workout.changePlanGroup}
            onDeletePlan={async (planId) => {
              await workout.removePlan(planId)
              setSelectedPlanId(null)
              setScreen('schede')
            }}
            onAddExerciseToPlan={workout.addExerciseToPlan}
            onUpdateExerciseDefaults={workout.updateExerciseDefaults}
            onRemoveExerciseFromPlan={workout.removeExerciseFromPlan}
            onOpenExercisePicker={(ctx) => {
              setPickerContext({ ...ctx, returnScreen: 'plan-detail' })
              setScreen('exercise-picker')
            }}
            loadPlanExercises={workout.loadPlanExercises}
          />
        ) : null

      // ── PR tracker ─────────────────────────────────────────────
      case 'list':
        return (
          <PRList
            user={user!} onUser={setUser}
            exercises={exercises} entries={entries}
            onOpenExercise={(id) => openExercise(id, 'list')}
            onAddPR={() => setInputOpen(true)}
          />
        )

      case 'exercise-library':
        return (
          <ExerciseList
            user={user!} onUser={setUser}
            exercises={exercises} entries={entries}
            onOpenExercise={(id) => openExercise(id, 'exercise-library')}
            onCreate={() => { setCreateSource('exercise-library'); setScreen('create') }}
            onBack={() => setScreen('prof')}
            onEditExercise={(id) => { setCreateSource('exercise-library'); setEditExerciseId(id); setScreen('create') }}
            onDeleteExercise={handleDeleteExercise}
          />
        )

      case 'hist':
        return (
          <HistoryScreen
            user={user!} onUser={setUser}
            exercises={exercises} entries={entries}
            onOpenExercise={openExercise}
          />
        )

      case 'prof':
        return (
          <ProfileScreen
            user={user!} onUser={setUser}
            theme={theme} onTheme={setTheme}
            accent={accent} onAccent={setAccent}
            entries={entries}
            exercises={exercises}
            onOpenExerciseList={() => setScreen('exercise-library')}
            onCreateExercise={() => { setCreateSource('prof'); setEditExerciseId(null); setScreen('create') }}
            onEditExercise={(id) => { setCreateSource('prof'); setEditExerciseId(id); setScreen('create') }}
            onDeleteExercise={handleDeleteExercise}
          />
        )

      case 'detail':
        return currentEx ? (
          <ExerciseDetail
            exercise={currentEx} user={user!} onUser={setUser}
            entries={entries} otherEntries={otherEntries}
            onBack={() => setScreen(detailSource)}
            onAddPR={() => setInputOpen(true)}
            onDeleteEntry={handleDeleteEntry}
          />
        ) : null

      case 'create':
        return (
          <ExerciseCreate
            exercise={editExerciseId ? exercises.find((e) => e.id === editExerciseId) : undefined}
            onBack={() => {
              setEditExerciseId(null)
              if (createSource === 'picker') setScreen('exercise-picker')
              else if (createSource === 'exercise-library') setScreen('exercise-library')
              else if (createSource === 'prof') setScreen('prof')
              else setScreen('list')
            }}
            onCreated={() => {
              setEditExerciseId(null)
              refetch()
              if (createSource === 'picker') setScreen('exercise-picker')
              else if (createSource === 'exercise-library') setScreen('exercise-library')
              else if (createSource === 'prof') setScreen('prof')
              else setScreen('list')
            }}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="app-outer" style={{ background: '#ECEBE6' }}>
      <div data-theme={theme} className="phone-frame" style={{ background: 'var(--bg)' }}>
        {/* dynamic island */}
        <div className="dynamic-island" style={{
          position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
          width: 126, height: 37, borderRadius: 24, background: '#000', zIndex: 1000,
        }} />
        {/* status bar */}
        <div className="status-bar-mock" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 90 }}>
          <IOSStatusBar dark={theme === 'dark'} />
        </div>

        {loading ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', color: 'var(--muted)', fontFamily: 'var(--font-mono)',
            fontSize: 12, letterSpacing: 1, textTransform: 'uppercase',
          }}>
            Caricamento…
          </div>
        ) : renderScreen()}

        {!celebration && activeTab && (
          <TabBar screen={activeTab} onNav={handleNav} />
        )}

        {/* home indicator */}
        <div className="home-indicator" style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 600,
          height: 34, display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
          paddingBottom: 8, pointerEvents: 'none',
        }}>
          <div style={{
            width: 139, height: 5, borderRadius: 100,
            background: theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)',
          }} />
        </div>

        {/* PR Input sheet */}
        {inputOpen && (
          <PRInputSheet
            user={user!}
            exerciseId={screen === 'detail' ? exerciseId : null}
            exercises={exercises}
            entries={entries}
            onClose={() => setInputOpen(false)}
            onSave={handleSavePR}
          />
        )}

        {/* Celebration */}
        {celebration && (() => {
          const ex = exercises.find((e) => e.id === celebration.exId)
          return ex ? (
            <Celebration
              exercise={ex}
              currentPR={celebration.prevPR}
              value={celebration.value}
              user={user!}
              onClose={closeCelebration}
            />
          ) : null
        })()}
      </div>
    </div>
  )
}
