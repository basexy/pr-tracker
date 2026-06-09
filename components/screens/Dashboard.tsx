'use client'

import { useEffect, useState } from 'react'
import TopBar from '@/components/primitives/TopBar'
import HeroPR from '@/components/primitives/HeroPR'
import BarChart from '@/components/primitives/BarChart'
import Spark from '@/components/primitives/Spark'
import Icon, { tagColor, tagDisplay } from '@/components/Icon'
import {
  buildPRData, findLatestEntry, countPRsThisMonth, calcStreak, calcTop3,
  fetchDayAssignments, fetchWorkoutSessionsRange, toDateStr,
} from '@/lib/queries'
import type { DayAssignment, Exercise, PREntry, Screen, UserName, WorkoutSession } from '@/lib/types'

const IT_MONTHS_FULL = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
const IT_DAYS_SHORT = ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do']

interface DashboardProps {
  user: UserName
  onUser: (u: UserName) => void
  exercises: Exercise[]
  baseEntries: PREntry[]
  dawgEntries: PREntry[]
  workoutStreak: number
  onOpenExercise: (id: string) => void
  onNav: (t: Screen | 'input') => void
}

export default function Dashboard({
  user, onUser, exercises, baseEntries, dawgEntries, workoutStreak, onOpenExercise,
}: DashboardProps) {
  const entries = user === 'base' ? baseEntries : dawgEntries
  const otherEntries = user === 'base' ? dawgEntries : baseEntries
  const otherName = user === 'base' ? 'Dawg' : 'Base'

  const latest = findLatestEntry(entries, exercises)
  const latestEx = latest ? exercises.find((e) => e.id === latest.exId) : null
  const latestPR = latest ? buildPRData(entries, latest.exId) : null

  const prMonth = countPRsThisMonth(entries)
  const top3 = calcTop3(entries, exercises)

  const totalKg = entries.reduce((s, e) => s + Number(e.value), 0)
  const volData = [
    Math.round(totalKg * 0.43),
    Math.round(totalKg * 0.58),
    Math.round(totalKg * 0.66),
    Math.round(totalKg * 0.62),
    Math.round(totalKg * 0.80),
    totalKg,
  ]

  const meAhead = exercises.filter((ex) => {
    const me = buildPRData(entries, ex.id)
    const other = buildPRData(otherEntries, ex.id)
    return me && other && me.v > other.v
  }).length
  const otherAhead = exercises.length - meAhead

  const today = new Date()
  const itDays = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato']
  const itMonths = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']
  const eyebrow = `${itDays[today.getDay()]} ${today.getDate()} ${itMonths[today.getMonth()]}`

  // ── Streak calendar ──────────────────────────────────────────────
  const [calMonth, setCalMonth] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [workoutDays, setWorkoutDays] = useState<Set<string>>(new Set())
  const [restDays, setRestDays] = useState<Set<string>>(new Set())

  useEffect(() => {
    const { year, month } = calMonth
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const lastDay = new Date(year, month + 1, 0).getDate()
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    Promise.all([
      fetchDayAssignments(user, startDate, endDate),
      fetchWorkoutSessionsRange(user, startDate, endDate),
    ]).then(([assignments, sessions]: [DayAssignment[], WorkoutSession[]]) => {
      setWorkoutDays(new Set(sessions.filter((s) => s.completed_at != null).map((s) => s.date)))
      setRestDays(new Set(assignments.filter((a) => a.is_rest).map((a) => a.date)))
    }).catch(() => {})
  }, [user, calMonth])

  const prevMonth = () => setCalMonth(({ year, month }) => {
    if (month === 0) return { year: year - 1, month: 11 }
    return { year, month: month - 1 }
  })
  const nextMonth = () => setCalMonth(({ year, month }) => {
    if (month === 11) return { year: year + 1, month: 0 }
    return { year, month: month + 1 }
  })

  const calDays = buildCalendarDays(calMonth.year, calMonth.month)
  const todayStr = toDateStr(today)

  if (entries.length === 0) {
    return (
      <div className="screen-scroll">
        <TopBar eyebrow={eyebrow} title={`Ciao, ${user === 'base' ? 'Base' : 'Dawg'}.`} />
        <div style={{ padding: '0 18px', textAlign: 'center', paddingTop: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <Icon name="trophy" size={48} stroke={1.5} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>Nessun PR ancora.</div>
          <div style={{ color: 'var(--muted)', fontSize: 14, marginTop: 8 }}>
            Premi + per aggiungere il tuo primo record.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="screen-scroll">
      <TopBar
        eyebrow={eyebrow}
        title={`Ciao, ${user === 'base' ? 'Base' : 'Dawg'}.`}
      />

      <div style={{ padding: '0 18px' }}>

        {/* ── STREAK CALENDAR ──────────────────────────────────── */}
        <div style={{ marginTop: 10, animation: 'fadeUp .4s .05s both' }}>
          {/* Counter */}
          <div style={{ textAlign: 'center', padding: '24px 0 16px' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 80, fontWeight: 800,
              color: 'var(--lime-deep)', letterSpacing: -4, lineHeight: 1,
            }}>
              {workoutStreak}
            </div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 6 }}>
              giorni di slancio
            </div>
          </div>

          {/* Month navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px 12px' }}>
            <button
              onClick={prevMonth}
              style={{
                appearance: 'none', border: 0, background: 'var(--surface-2)', cursor: 'pointer',
                width: 34, height: 34, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)',
              }}>
              <Icon name="chevL" size={16} />
            </button>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, letterSpacing: 0.3, color: 'var(--ink)' }}>
              {IT_MONTHS_FULL[calMonth.month]} {calMonth.year}
            </div>
            <button
              onClick={nextMonth}
              style={{
                appearance: 'none', border: 0, background: 'var(--surface-2)', cursor: 'pointer',
                width: 34, height: 34, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)',
              }}>
              <Icon name="chevR" size={16} />
            </button>
          </div>

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            <div className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Slancio</div>
              <div className="mono" style={{ fontSize: 32, fontWeight: 800, color: 'var(--lime-deep)', letterSpacing: -1 }}>
                {workoutDays.size}
              </div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>giorni</div>
            </div>
            <div className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Riposo</div>
              <div className="mono" style={{ fontSize: 32, fontWeight: 800, color: 'var(--muted)', letterSpacing: -1 }}>
                {restDays.size}
              </div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>giorni</div>
            </div>
          </div>

          {/* Calendar grid */}
          <div className="card" style={{ padding: '14px 12px' }}>
            {/* Day headers */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
              marginBottom: 6,
            }}>
              {IT_DAYS_SHORT.map((d) => (
                <div key={d} style={{
                  textAlign: 'center', fontFamily: 'var(--font-mono)',
                  fontSize: 10, fontWeight: 700, color: 'var(--muted)',
                  letterSpacing: 0.5, padding: '2px 0',
                }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
              {calDays.map((cell, i) => {
                if (!cell) {
                  return <div key={`empty-${i}`} />
                }
                const isWorkout = workoutDays.has(cell)
                const isRest = restDays.has(cell)
                const isToday = cell === todayStr
                const dayNum = parseInt(cell.split('-')[2], 10)

                return (
                  <div key={cell} style={{
                    aspectRatio: '1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 8,
                    background: isWorkout ? 'var(--lime)' : isRest ? 'var(--surface-2)' : 'transparent',
                    border: isToday ? '1.5px solid var(--lime-deep)' : '1.5px solid transparent',
                    position: 'relative',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: isWorkout ? 700 : 400,
                      color: isWorkout ? 'var(--lime-on)' : isToday ? 'var(--lime-deep)' : isRest ? 'var(--muted)' : 'var(--ink)',
                    }}>
                      {dayNum}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* HERO */}
        {latestEx && latestPR && (
          <HeroPR
            exercise={latestEx}
            pr={latestPR}
            onOpen={() => onOpenExercise(latestEx.id)}
          />
        )}

        {/* STATS grid */}
        <div style={{
          marginTop: 10, display: 'grid', gap: 8,
          gridTemplateColumns: '1fr 1fr',
          animation: 'fadeUp .4s .1s both',
        }}>
          <div className="stat">
            <div className="label">PR / Mese</div>
            <div className="value">{prMonth}</div>
            <div className="sub" style={{ color: 'var(--lime-deep)' }}>questo mese</div>
          </div>
          <div className="stat">
            <div className="label">vs {otherName}</div>
            <div className="value">{meAhead}<span className="u">—{otherAhead}</span></div>
            <div className="sub">esercizi avanti</div>
          </div>
        </div>

        {/* CHART block */}
        {totalKg > 0 && (
          <div className="card" style={{ padding: '14px 16px 8px', marginTop: 8, animation: 'fadeUp .4s .15s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <div className="eyebrow">Volume · 6 mesi</div>
              <div className="mono" style={{ fontSize: 13, fontWeight: 600 }}>
                {totalKg.toLocaleString('it-IT')} kg
              </div>
            </div>
            <BarChart data={volData} labels={['G', 'F', 'M', 'A', 'M', 'G']} w={332} h={84} />
          </div>
        )}

        {/* TOP 3 */}
        {top3.length > 0 && (
          <div style={{ marginTop: 16, animation: 'fadeUp .4s .25s both' }}>
            <div className="eyebrow" style={{ padding: '0 4px 8px' }}>Top 3 progressioni</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {top3.map((t, i) => {
                const ex = exercises.find((e) => e.id === t.exId)!
                const pr = buildPRData(entries, t.exId)
                if (!pr) return null
                return (
                  <button key={t.exId} className="ex-card" onClick={() => onOpenExercise(t.exId)}>
                    <div className="rail" style={{ background: tagColor(ex.tag) }} />
                    <div className="body">
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                          <span className="mono" style={{ fontSize: 10, color: 'var(--muted)', width: 14 }}>0{i + 1}</span>
                          <span className="name">{ex.name}</span>
                        </div>
                        <div className="meta" style={{ marginLeft: 22 }}>#{tagDisplay(ex.tag)} · {pr.date}</div>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Spark data={pr.hist} w={42} h={20} />
                        <span className="mono" style={{
                          fontSize: 13, fontWeight: 600, color: 'var(--lime-on)',
                          padding: '3px 7px', background: 'var(--lime)', borderRadius: 5,
                        }}>{t.growth}</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Build array of date strings (or null for empty cells) for a month grid starting on Monday
function buildCalendarDays(year: number, month: number): (string | null)[] {
  const firstDay = new Date(year, month, 1)
  // JS getDay(): 0=Sun,1=Mon,...,6=Sat → convert to Mon-first: Mon=0,Tue=1,...,Sun=6
  const startOffset = (firstDay.getDay() + 6) % 7
  const lastDay = new Date(year, month + 1, 0).getDate()
  const cells: (string | null)[] = []

  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= lastDay; d++) {
    cells.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
  }
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}
