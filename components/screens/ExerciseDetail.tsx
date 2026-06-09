'use client'

import Icon, { tagColor, tagDisplay } from '@/components/Icon'
import LineChart from '@/components/primitives/LineChart'
import { buildPRData, formatDate } from '@/lib/queries'
import type { Exercise, PREntry, UserName } from '@/lib/types'

interface ExerciseDetailProps {
  exercise: Exercise
  user: UserName
  onUser: (u: UserName) => void
  entries: PREntry[]
  otherEntries: PREntry[]
  onBack: () => void
  onAddPR: () => void
  onDeleteEntry?: (id: string) => void
}

const IT_MONTHS = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']

export default function ExerciseDetail({
  exercise, user, onUser, entries, otherEntries, onBack, onAddPR, onDeleteEntry,
}: ExerciseDetailProps) {
  const pr = buildPRData(entries, exercise.id)
  const other = buildPRData(otherEntries, exercise.id)
  const otherName = user === 'base' ? 'Dawg' : 'Base'
  const meAhead = pr && other ? pr.v > other.v : false

  const history = pr?.hist ?? []

  const rawEntries = [...entries]
    .filter((e) => e.exercise_id === exercise.id)
    .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())

  const now = new Date()
  const labels = history.map((_, i) => {
    const d = new Date(now)
    d.setMonth(d.getMonth() - (history.length - 1 - i))
    return IT_MONTHS[d.getMonth()]
  })

  return (
    <div className="screen">
      {/* Sticky header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: '56px 20px 14px',
        background: 'var(--bg)',
        borderBottom: '1px solid var(--line)',
        display: 'flex', alignItems: 'flex-end', gap: 12,
      }}>
        <button
          onClick={onBack}
          style={{
            appearance: 'none', border: 0, background: 'var(--surface-2)',
            cursor: 'pointer', width: 36, height: 36, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--muted)', flexShrink: 0,
          }}>
          <Icon name="chevL" size={18} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: tagColor(exercise.tag), display: 'inline-block', flexShrink: 0 }} />
            #{tagDisplay(exercise.tag)} · {exercise.unit}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.4, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {exercise.name}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="screen-scroll" style={{ paddingTop: 116, paddingBottom: 130 }}>
        <div style={{ padding: '18px 22px 0' }}>
          {pr ? (
            <>
              {/* current PR */}
              <div className="card" style={{ marginTop: 0, padding: '20px 22px', borderRadius: 'var(--r-xl)' }}>
                <div className="eyebrow">PR attuale</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4 }}>
                  <div className="big-num" style={{ fontSize: 86 }}>
                    {pr.v}<span className="u">{exercise.unit}</span>
                  </div>
                  <div style={{ paddingBottom: 8, textAlign: 'right' }}>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: 0.4, whiteSpace: 'nowrap' }}>
                      {pr.date}
                    </div>
                    <div className="mono" style={{
                      fontSize: 13, fontWeight: 700,
                      marginTop: 4, padding: '3px 8px',
                      background: 'var(--lime)', color: 'var(--lime-on)',
                      borderRadius: 6, display: 'inline-block',
                      whiteSpace: 'nowrap',
                    }}>+{pr.delta}{exercise.unit === 'reps' ? '' : exercise.unit}</div>
                  </div>
                </div>
              </div>

              {/* CHART */}
              {history.length >= 2 && (
                <div className="card" style={{ marginTop: 10, padding: '16px 18px 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, gap: 8 }}>
                    <div className="eyebrow">Andamento · {history.length} PR</div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                      min {Math.min(...history)} · max {Math.max(...history)}
                    </div>
                  </div>
                  <LineChart data={history} w={328} h={120} dots fill />
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', marginTop: 6,
                    fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)',
                  }}>
                    {labels.map((m, i) => <span key={i}>{m}</span>)}
                  </div>
                </div>
              )}

              {/* vs other user */}
              {other && (
                <div className="card-flat" style={{
                  marginTop: 8, padding: '14px 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div className="eyebrow">vs {otherName}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                      <span className="mono" style={{ fontSize: 22, fontWeight: 700, color: meAhead ? 'var(--lime-deep)' : 'var(--ink)' }}>
                        {pr.v}
                      </span>
                      <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>—</span>
                      <span className="mono" style={{ fontSize: 22, fontWeight: 700, color: !meAhead ? 'var(--lime-deep)' : 'var(--ink)' }}>
                        {other.v}
                      </span>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>{exercise.unit}</span>
                    </div>
                  </div>
                  <div className="mono" style={{
                    fontSize: 11, color: meAhead ? 'var(--lime-deep)' : 'var(--muted)',
                    padding: '5px 10px', borderRadius: 999, background: 'var(--surface-2)',
                    fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6,
                  }}>
                    {meAhead
                      ? `+${(pr.v - other.v).toFixed(1)} avanti`
                      : `-${(other.v - pr.v).toFixed(1)} sotto`}
                  </div>
                </div>
              )}

              {/* History */}
              <div style={{ marginTop: 16 }}>
                <div className="eyebrow" style={{ padding: '0 4px 10px' }}>Storico PR · {rawEntries.length} sessioni</div>
                <div className="row-group">
                  {rawEntries.map((entry, i) => {
                    const v = Number(entry.value)
                    const nextEntry = rawEntries[i + 1]
                    const prevV = nextEntry ? Number(nextEntry.value) : null
                    const delta = prevV !== null ? +(v - prevV).toFixed(2) : null
                    const isCurrent = i === 0
                    return (
                      <div key={entry.id} className="row" style={{ borderTop: i ? '1px solid var(--line)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 'var(--r-pill)',
                            background: isCurrent ? 'var(--lime)' : 'var(--surface-2)',
                            color: isCurrent ? 'var(--lime-on)' : 'var(--muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 11,
                          }}>
                            {isCurrent
                              ? <Icon name="trophy" size={16} stroke={2.2} />
                              : `#${rawEntries.length - i}`}
                          </div>
                          <div>
                            <div className="mono tnum" style={{ fontSize: 16, fontWeight: 600 }}>
                              {v} <span style={{ fontSize: 10, color: 'var(--muted)' }}>{exercise.unit}</span>
                            </div>
                            <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 2 }}>
                              {formatDate(entry.recorded_at)}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {delta !== null && delta > 0 && (
                            <div className="mono" style={{ fontSize: 11.5, color: 'var(--lime-deep)', fontWeight: 700 }}>
                              ▲ +{delta.toFixed(delta % 1 ? 1 : 0)}
                            </div>
                          )}
                          {onDeleteEntry && (
                            <button
                              onClick={() => onDeleteEntry(entry.id)}
                              style={{
                                appearance: 'none', border: 0, cursor: 'pointer',
                                background: 'transparent', color: 'var(--muted)',
                                width: 32, height: 32, borderRadius: 8,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                              <Icon name="trash" size={16} stroke={1.8} />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            <div style={{ marginTop: 32, textAlign: 'center', color: 'var(--muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <Icon name="medal" size={36} stroke={1.5} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Nessun PR ancora.</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Premi &quot;Aggiungi PR&quot; per iniziare.</div>
            </div>
          )}
        </div>
      </div>

      {/* Floating CTA */}
      <div style={{ position: 'absolute', left: 22, right: 22, bottom: 96, zIndex: 50 }}>
        <button
          onClick={onAddPR}
          style={{
            width: '100%', appearance: 'none', border: 0,
            background: 'var(--lime)', color: 'var(--lime-on)',
            borderRadius: 'var(--r-pill)',
            fontFamily: 'var(--font-ui)', fontSize: 16, fontWeight: 700,
            padding: '16px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
          <Icon name="plus" size={18} stroke={2.2} />
          Aggiungi PR
        </button>
      </div>
    </div>
  )
}
