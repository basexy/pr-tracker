'use client'

import TopBar from '@/components/primitives/TopBar'
import Icon, { tagColor, tagDisplay } from '@/components/Icon'
import { buildPRData, calcStreak, countPRsThisMonth } from '@/lib/queries'
import type { Exercise, PREntry, UserName } from '@/lib/types'

interface HistoryScreenProps {
  user: UserName
  onUser: (u: UserName) => void
  exercises: Exercise[]
  entries: PREntry[]
  onOpenExercise: (id: string) => void
}

const IT_MONTHS: Record<string, string> = {
  '0': 'Gennaio', '1': 'Febbraio', '2': 'Marzo', '3': 'Aprile',
  '4': 'Maggio', '5': 'Giugno', '6': 'Luglio', '7': 'Agosto',
  '8': 'Settembre', '9': 'Ottobre', '10': 'Novembre', '11': 'Dicembre',
}

export default function HistoryScreen({
  user, onUser, exercises, entries, onOpenExercise,
}: HistoryScreenProps) {
  const streak = calcStreak(entries)
  const totalKg = entries.reduce((s, e) => s + Number(e.value), 0)

  // Group entries by month
  const groups: Record<string, { ex: Exercise; pr: ReturnType<typeof buildPRData> }[]> = {}
  const sorted = [...entries].sort(
    (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
  )
  sorted.forEach((entry) => {
    const d = new Date(entry.recorded_at)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const ex = exercises.find((e) => e.id === entry.exercise_id)
    if (!ex) return
    const pr = buildPRData(entries, ex.id)
    if (!groups[key]) groups[key] = []
    if (!groups[key].some((g) => g.ex.id === ex.id)) {
      groups[key].push({ ex, pr })
    }
  })

  const totalPRs = entries.length

  return (
    <div className="screen-scroll">
      <TopBar
        eyebrow=""
        title="Storico"
      />
      <div style={{ padding: '0 18px' }}>
        {/* Stats stripe */}
        <div className="card" style={{ padding: '16px 18px', borderRadius: 'var(--r-xl)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[
              { l: 'Totale PR', v: String(totalPRs), s: 'da inizio' },
              { l: 'kg sollevati', v: totalKg.toLocaleString('it-IT'), s: 'totale' },
              { l: 'streak', v: streak + ' s', s: 'consecutive' },
            ].map((s, i) => (
              <div key={i} style={{
                borderLeft: i ? '1px solid var(--line)' : 'none',
                paddingLeft: i ? 12 : 0,
                textAlign: 'center',
              }}>
                <div className="eyebrow" style={{ fontSize: 9.5, letterSpacing: 0.8 }}>{s.l}</div>
                <div style={{
                  fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 22,
                  letterSpacing: -0.8, marginTop: 4, fontFeatureSettings: '"tnum"',
                }}>{s.v}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{s.s}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        {Object.entries(groups).map(([key, items]) => {
          const [year, month] = key.split('-')
          return (
            <div key={key} style={{ marginTop: 22 }}>
              <div style={{
                display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                padding: '0 4px 10px',
              }}>
                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>
                  {IT_MONTHS[month]}{' '}
                  <span style={{ color: 'var(--muted)', fontWeight: 500, fontSize: 14, marginLeft: 4 }}>{year}</span>
                </div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {items.length} PR
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 18, top: 8, bottom: 8,
                  width: 2, background: 'var(--line)',
                }} />
                {items.map(({ ex, pr }) => (
                  <button key={ex.id} onClick={() => onOpenExercise(ex.id)}
                    style={{
                      appearance: 'none', border: 0, background: 'transparent',
                      cursor: 'pointer', textAlign: 'left',
                      display: 'flex', gap: 14, alignItems: 'flex-start',
                      padding: '8px 0', width: '100%',
                    }}>
                    <div style={{
                      width: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative',
                    }}>
                      <div style={{
                        width: 12, height: 12, borderRadius: 999,
                        background: tagColor(ex.tag),
                        border: '3px solid var(--bg)', boxShadow: '0 0 0 1px var(--line-2)',
                      }} />
                    </div>
                    <div style={{
                      flex: 1, padding: '12px 14px', borderRadius: 'var(--r-md)',
                      background: 'var(--surface)', border: '1px solid var(--line)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{ex.name}</div>
                        <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 2, whiteSpace: 'nowrap' }}>
                          #{tagDisplay(ex.tag)} · {pr?.date ?? '—'}
                        </div>
                      </div>
                      {pr && (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                          <div className="mono tnum" style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>
                            {pr.v}<span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 2 }}>{ex.unit}</span>
                          </div>
                          <div className="mono" style={{
                            fontSize: 10.5, fontWeight: 700, color: 'var(--lime-on)',
                            padding: '2px 6px', background: 'var(--lime)', borderRadius: 4,
                          }}>+{pr.delta}</div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}

        {entries.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <Icon name="note" size={36} stroke={1.5} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Nessun PR ancora.</div>
          </div>
        )}
      </div>
    </div>
  )
}
