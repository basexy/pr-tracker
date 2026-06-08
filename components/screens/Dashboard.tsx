'use client'

import TopBar from '@/components/primitives/TopBar'
import HeroPR from '@/components/primitives/HeroPR'
import BarChart from '@/components/primitives/BarChart'
import Spark from '@/components/primitives/Spark'
import Icon, { tagColor, tagDisplay } from '@/components/Icon'
import {
  buildPRData, findLatestEntry, countPRsThisMonth, calcStreak, calcTop3,
} from '@/lib/queries'
import type { Exercise, PREntry, Screen, UserName } from '@/lib/types'

interface DashboardProps {
  user: UserName
  onUser: (u: UserName) => void
  exercises: Exercise[]
  baseEntries: PREntry[]
  dawgEntries: PREntry[]
  onOpenExercise: (id: string) => void
  onNav: (t: Screen | 'input') => void
}

export default function Dashboard({
  user, onUser, exercises, baseEntries, dawgEntries, onOpenExercise,
}: DashboardProps) {
  const entries = user === 'base' ? baseEntries : dawgEntries
  const otherEntries = user === 'base' ? dawgEntries : baseEntries
  const otherName = user === 'base' ? 'Dawg' : 'Base'

  const latest = findLatestEntry(entries, exercises)
  const latestEx = latest ? exercises.find((e) => e.id === latest.exId) : null
  const latestPR = latest ? buildPRData(entries, latest.exId) : null

  const prMonth = countPRsThisMonth(entries)
  const streak = calcStreak(entries)
  const top3 = calcTop3(entries, exercises)

  // Volume mock (6 months leading up to now) — derived from total entries
  const totalKg = entries.reduce((s, e) => s + Number(e.value), 0)
  const volData = [
    Math.round(totalKg * 0.43),
    Math.round(totalKg * 0.58),
    Math.round(totalKg * 0.66),
    Math.round(totalKg * 0.62),
    Math.round(totalKg * 0.80),
    totalKg,
  ]

  // vs comparison: count exercises where user is ahead
  const meAhead = exercises.filter((ex) => {
    const me = buildPRData(entries, ex.id)
    const other = buildPRData(otherEntries, ex.id)
    return me && other && me.v > other.v
  }).length
  const otherAhead = exercises.length - meAhead

  // Next target: exercise where user is closest below their next round number
  const nextTargetEx = exercises.find((ex) => {
    const pr = buildPRData(entries, ex.id)
    return pr !== null
  })
  const nextTargetPR = nextTargetEx ? buildPRData(entries, nextTargetEx.id) : null
  const nextTarget = nextTargetPR
    ? Math.ceil((nextTargetPR.v + 1) / (nextTargetEx?.unit === 'reps' ? 5 : 5)) *
      (nextTargetEx?.unit === 'reps' ? 5 : 5)
    : null

  const today = new Date()
  const itDays = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato']
  const itMonths = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']
  const eyebrow = `${itDays[today.getDay()]} ${today.getDate()} ${itMonths[today.getMonth()]}`

  if (entries.length === 0) {
    return (
      <div className="screen-scroll">
        <TopBar eyebrow={eyebrow} title={`Ciao, ${user === 'base' ? 'Base' : 'Dawg'}.`} user={user} onUser={onUser} />
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
        user={user} onUser={onUser}
      />

      <div style={{ padding: '0 18px' }}>
        {/* HERO */}
        {latestEx && latestPR && (
          <HeroPR
            exercise={latestEx}
            pr={latestPR}
            onOpen={() => onOpenExercise(latestEx.id)}
          />
        )}

        {/* TARGET strip */}
        {nextTargetEx && nextTarget && (
          <div style={{
            marginTop: 10, padding: '14px 16px',
            borderRadius: 'var(--r-md)',
            background: 'var(--ink)', color: 'var(--bg)',
            display: 'flex', alignItems: 'center', gap: 12,
            animation: 'fadeUp .4s .05s both',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--r-pill)',
              background: 'var(--lime)', color: 'var(--lime-on)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon name="target" size={20} stroke={2} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--lime)', letterSpacing: 1, textTransform: 'uppercase' }}>
                Prossimo target
              </div>
              <div style={{ fontSize: 14, marginTop: 3, fontWeight: 500 }}>
                {nextTargetEx.name} →{' '}
                <b className="mono">{nextTarget}{nextTargetEx.unit}</b>
              </div>
            </div>
          </div>
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
            <div className="label">Streak</div>
            <div className="value">{streak}<span className="u">sett</span></div>
            <div className="sub">consecutive</div>
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

        {/* vs comparison strip */}
        <div className="card-flat" style={{
          marginTop: 8, padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          animation: 'fadeUp .4s .2s both',
        }}>
          <div>
            <div className="eyebrow">vs {otherName}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
              <span className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--lime-deep)' }}>{meAhead}</span>
              <span className="mono" style={{ fontSize: 13, color: 'var(--muted)' }}>—</span>
              <span className="mono" style={{ fontSize: 22, fontWeight: 700 }}>{otherAhead}</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>esercizi avanti</span>
            </div>
          </div>
        </div>

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
