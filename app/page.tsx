'use client'

import { useCallback, useState } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useTheme } from '@/contexts/ThemeContext'
import { usePRData, useEntriesFor } from '@/hooks/usePRData'
import { insertPREntry, buildPRData } from '@/lib/queries'
import type { Screen, UserName } from '@/lib/types'

import IOSStatusBar from '@/components/IOSStatusBar'
import TabBar from '@/components/primitives/TabBar'
import Dashboard from '@/components/screens/Dashboard'
import ExerciseList from '@/components/screens/ExerciseList'
import ExerciseDetail from '@/components/screens/ExerciseDetail'
import ExerciseCreate from '@/components/screens/ExerciseCreate'
import HistoryScreen from '@/components/screens/HistoryScreen'
import ProfileScreen from '@/components/screens/ProfileScreen'
import PRInputSheet from '@/components/input/PRInputSheet'
import Celebration from '@/components/Celebration'

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
        PR.TRACKER
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
            transition: 'transform .12s ease',
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
  const [exerciseId, setExerciseId] = useState<string | null>(null)
  const [inputOpen, setInputOpen] = useState(false)
  const [celebration, setCelebration] = useState<{ exId: string; value: number; prevPR: number } | null>(null)

  const { exercises, baseEntries, dawgEntries, loading, refetch } = usePRData()

  const entries = useEntriesFor(baseEntries, dawgEntries, user ?? 'base')
  const otherEntries = useEntriesFor(baseEntries, dawgEntries, user === 'base' ? 'dawg' : 'base')

  const openExercise = useCallback((id: string) => {
    setExerciseId(id)
    setScreen('detail')
  }, [])

  const handleNav = useCallback((target: Screen | 'input') => {
    if (target === 'input') { setInputOpen(true); return }
    setScreen(target)
  }, [])

  const handleSavePR = useCallback(async ({ exId, value, isPR }: { exId: string; value: number; isPR: boolean }) => {
    if (!user) return
    const prevPR = buildPRData(entries, exId)
    await insertPREntry(user, exId, value)
    setInputOpen(false)
    refetch()
    if (isPR) {
      setCelebration({ exId, value, prevPR: prevPR?.v ?? 0 })
    }
  }, [user, entries, refetch])

  const closeCelebration = useCallback(() => {
    const exId = celebration?.exId
    setCelebration(null)
    if (exId) { setExerciseId(exId); setScreen('detail') }
  }, [celebration])

  const activeTab: Screen | null = ['dash', 'list', 'hist', 'prof'].includes(screen) ? screen : null
  const currentEx = exerciseId ? exercises.find((e) => e.id === exerciseId) : null

  // Not yet loaded (localStorage may not have hydrated)
  if (user === null) {
    return (
      <div style={{
        width: '100%', height: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#ECEBE6',
      }}>
        <div style={{
          position: 'relative',
          width: 402, height: 874,
          borderRadius: 48, overflow: 'hidden',
          background: '#FAF8F1',
          boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
        }}>
          <div style={{
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
      case 'dash':
        return (
          <Dashboard
            user={user!} onUser={setUser}
            exercises={exercises} baseEntries={baseEntries} dawgEntries={dawgEntries}
            onOpenExercise={openExercise} onNav={handleNav}
          />
        )
      case 'list':
        return (
          <ExerciseList
            user={user!} onUser={setUser}
            exercises={exercises} entries={entries}
            onOpenExercise={openExercise} onCreate={() => setScreen('create')}
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
          />
        )
      case 'detail':
        return currentEx ? (
          <ExerciseDetail
            exercise={currentEx} user={user!} onUser={setUser}
            entries={entries} otherEntries={otherEntries}
            onBack={() => setScreen('list')}
            onAddPR={() => setInputOpen(true)}
          />
        ) : null
      case 'create':
        return (
          <ExerciseCreate
            onBack={() => setScreen('list')}
            onCreated={() => { refetch(); setScreen('list') }}
          />
        )
      default:
        return null
    }
  }

  return (
    <div style={{
      width: '100%', height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#ECEBE6', padding: '20px 0', boxSizing: 'border-box',
    }}>
      <div data-theme={theme} style={{
        position: 'relative',
        width: 402, height: 874,
        borderRadius: 48, overflow: 'hidden',
        background: 'var(--bg)',
        boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
        fontFamily: 'var(--font-ui)',
      }}>
        {/* dynamic island */}
        <div style={{
          position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
          width: 126, height: 37, borderRadius: 24, background: '#000', zIndex: 1000,
        }} />
        {/* status bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 90 }}>
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
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 600,
          height: 34, display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
          paddingBottom: 8, pointerEvents: 'none',
        }}>
          <div style={{
            width: 139, height: 5, borderRadius: 100,
            background: theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)',
          }} />
        </div>

        {/* Input sheet */}
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
