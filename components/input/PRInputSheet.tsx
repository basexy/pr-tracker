'use client'

import { useEffect, useState } from 'react'
import Icon, { tagColor, tagDisplay } from '@/components/Icon'
import WheelPicker from './WheelPicker'
import Keypad from './Keypad'
import { buildPRData } from '@/lib/queries'
import type { Exercise, PREntry, UserName } from '@/lib/types'

interface PRInputSheetProps {
  user: UserName
  exerciseId: string | null
  exercises: Exercise[]
  entries: PREntry[]
  onClose: () => void
  onSave: (args: { exId: string; value: number; isPR: boolean; date: string }) => void
}

type Mode = 'scroll' | 'keypad'

function todayStr(): string {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

function ValueDisplay({ value, unit, delta, isPR }: { value: number; unit: string; delta: number; isPR: boolean }) {
  return (
    <div style={{ textAlign: 'center', padding: '10px 0 18px' }}>
      <div className="big-num tnum" style={{ fontSize: 84, justifyContent: 'center' }}>
        {value.toString()}<span className="u">{unit}</span>
      </div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        marginTop: 6, padding: '4px 10px', borderRadius: 999,
        background: isPR ? 'var(--lime)' : 'var(--surface-2)',
        color: isPR ? 'var(--lime-on)' : 'var(--muted)',
        fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
        whiteSpace: 'nowrap',
      }}>
        {isPR && <Icon name="bolt" size={13} stroke={2.2} />}
        {delta > 0
          ? `+${delta.toFixed(delta % 1 ? 1 : 0)}${unit === 'reps' ? ' reps' : 'kg'} vs PR`
          : delta === 0 ? '= PR attuale'
          : `${delta.toFixed(delta % 1 ? 1 : 0)} vs PR`}
      </div>
    </div>
  )
}

export default function PRInputSheet({
  user, exerciseId, exercises, entries, onClose, onSave,
}: PRInputSheetProps) {
  const [exId, setExId] = useState<string | null>(exerciseId)
  const [picking, setPicking] = useState(!exerciseId)
  const [mode, setMode] = useState<Mode>('scroll')
  const [date, setDate] = useState(todayStr())

  const ex = exId ? exercises.find((e) => e.id === exId) ?? null : null
  const currentPR = exId ? buildPRData(entries, exId) : null
  const defaultVal = currentPR
    ? currentPR.v + (ex?.unit === 'kg' ? 2.5 : 1)
    : ex?.unit === 'reps' ? 5 : 20
  const [value, setValue] = useState(defaultVal)

  useEffect(() => {
    if (currentPR && ex) setValue(currentPR.v + (ex.unit === 'kg' ? 2.5 : 1))
  }, [exId])

  const maxDate = todayStr()

  if (picking) {
    return (
      <>
        <div className="scrim" onClick={onClose} />
        <div className="sheet" style={{ maxHeight: '88%' }}>
          <div className="sheet-grab" />
          <div className="sheet-header">
            <div>
              <div className="sheet-title">Quale esercizio?</div>
              <div className="sheet-sub">Seleziona l&apos;esercizio per cui registrare un PR</div>
            </div>
            <button className="sheet-close" onClick={onClose}>
              <Icon name="close" size={14} stroke={2.2} />
            </button>
          </div>
          <div className="sheet-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingBottom: 8 }}>
              {exercises.map((e) => {
                const p = buildPRData(entries, e.id)
                return (
                  <button key={e.id} className="ex-card"
                    onClick={() => { setExId(e.id); setPicking(false) }}>
                    <div className="rail" style={{ background: tagColor(e.tag) }} />
                    <div className="body">
                      <div style={{ minWidth: 0 }}>
                        <div className="name">{e.name}</div>
                        <div className="meta">#{tagDisplay(e.tag)}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {p && (
                          <div className="mono tnum" style={{ fontSize: 14, color: 'var(--muted)' }}>
                            {p.v}<span style={{ fontSize: 10, marginLeft: 2 }}>{e.unit}</span>
                          </div>
                        )}
                        <Icon name="chevR" size={16} stroke={2} />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!ex) return null

  const minIncrement = ex.unit === 'kg' ? 0.5 : 1
  const delta = +(value - (currentPR?.v ?? 0)).toFixed(2)
  const isPR = currentPR ? value > currentPR.v : true

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="sheet" style={{ maxHeight: '92%' }}>
        <div className="sheet-grab" />
        <div className="sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <div style={{
              width: 6, alignSelf: 'stretch', minHeight: 36, borderRadius: 4,
              background: tagColor(ex.tag), flexShrink: 0,
            }} />
            <div style={{ minWidth: 0 }}>
              <div className="sheet-title">{ex.name}</div>
              <div className="sheet-sub">
                #{tagDisplay(ex.tag)} · attuale{' '}
                <b style={{ color: 'var(--ink)' }}>{currentPR ? `${currentPR.v}${ex.unit}` : '—'}</b>
              </div>
            </div>
          </div>
          <button className="sheet-close" onClick={onClose}>
            <Icon name="close" size={14} stroke={2.2} />
          </button>
        </div>

        <div className="sheet-content">
          {/* date — at the top */}
          <div className="row-group" style={{ marginBottom: 14 }}>
            <div className="row" style={{ padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink)' }}>
                <Icon name="cal" size={16} stroke={1.7} />
                <span style={{ fontSize: 14 }}>Data</span>
              </div>
              <input
                type="date"
                value={date}
                max={maxDate}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  border: 0, outline: 0, background: 'transparent',
                  fontFamily: 'var(--font-mono)', fontSize: 13,
                  color: 'var(--muted)', cursor: 'pointer',
                  colorScheme: 'light dark',
                }}
              />
            </div>
          </div>

          {/* mode tabs — scroll + keypad only */}
          <div className="input-modes">
            <button className={mode === 'scroll' ? 'is-active' : ''} onClick={() => setMode('scroll')}>Scroll</button>
            <button className={mode === 'keypad' ? 'is-active' : ''} onClick={() => setMode('keypad')}>Tastiera</button>
          </div>

          {mode === 'keypad' && (
            <ValueDisplay value={value} unit={ex.unit} delta={delta} isPR={isPR} />
          )}

          {mode === 'scroll' && (
            <WheelPicker value={value} setValue={setValue} step={minIncrement} unit={ex.unit} delta={delta} isPR={isPR} />
          )}
          {mode === 'keypad' && (
            <Keypad value={value} setValue={setValue} unit={ex.unit} />
          )}
        </div>

        <div className="sheet-footer">
          <button
            className="btn btn-lime"
            onClick={() => onSave({ exId: ex.id, value, isPR, date })}
            disabled={value <= 0}
            style={{ opacity: value > 0 ? 1 : 0.4 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {isPR && <Icon name="bolt" size={16} stroke={2.2} />}
              {isPR ? `Salva nuovo PR · ${value}${ex.unit}` : `Salva · ${value}${ex.unit}`}
            </span>
          </button>
        </div>
      </div>
    </>
  )
}
