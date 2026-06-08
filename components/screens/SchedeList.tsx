'use client'

import { useState } from 'react'
import Icon, { tagColor, tagLabel } from '@/components/Icon'
import type { UserName, WorkoutPlan } from '@/lib/types'
import UserSegmented from '@/components/primitives/UserSegmented'

const MUSCLE_GROUPS = [
  'petto', 'dorso', 'gambe', 'spalle', 'braccia', 'full_body',
]

interface SchedeListProps {
  user: UserName
  onUser: (u: UserName) => void
  workoutPlans: WorkoutPlan[]
  onOpenPlan: (planId: string) => void
  onCreatePlan: (name: string, muscleGroup: string) => Promise<WorkoutPlan>
}

export default function SchedeList({ user, onUser, workoutPlans, onOpenPlan, onCreatePlan }: SchedeListProps) {
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="screen">
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: '56px 20px 14px', background: 'var(--bg)',
        borderBottom: '1px solid var(--line)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.5, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>
              Allenamento
            </div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: -0.7, color: 'var(--ink)' }}>
              Le mie schede
            </h1>
          </div>
          <UserSegmented user={user} onChange={onUser} />
        </div>
      </div>

      <div className="screen-scroll" style={{ paddingTop: 128 }}>
        <div style={{ padding: '0 20px' }}>
          {workoutPlans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: 44, marginBottom: 8 }}>📋</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>Nessuna scheda</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>
                Crea la tua prima scheda di allenamento
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
              {workoutPlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} onOpen={() => onOpenPlan(plan.id)} />
              ))}
            </div>
          )}

          <button
            onClick={() => setShowCreate(true)}
            className="btn btn-primary">
            + Crea nuova scheda
          </button>
        </div>
      </div>

      {showCreate && (
        <CreatePlanSheet
          onClose={() => setShowCreate(false)}
          onCreate={async (name, group) => {
            await onCreatePlan(name, group)
            setShowCreate(false)
          }}
        />
      )}
    </div>
  )
}

function PlanCard({ plan, onOpen }: { plan: WorkoutPlan; onOpen: () => void }) {
  const color = tagColor(plan.muscle_group)
  return (
    <button
      onClick={onOpen}
      style={{
        width: '100%', appearance: 'none', cursor: 'pointer', textAlign: 'left',
        background: 'var(--surface)', border: '1px solid var(--line)',
        borderRadius: 'var(--r-lg)', padding: '16px',
        display: 'flex', alignItems: 'center', gap: 14,
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform .15s ease',
      }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
        background: color + '1A',
        border: `1.5px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="barbell" size={22} stroke={1.6} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {plan.name}
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4,
          background: color + '18', borderRadius: 6, padding: '2px 8px',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            {tagLabel(plan.muscle_group)}
          </span>
        </div>
      </div>
      <Icon name="chevR" size={18} stroke={1.5} />
    </button>
  )
}

function CreatePlanSheet({
  onClose, onCreate,
}: {
  onClose: () => void
  onCreate: (name: string, group: string) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [group, setGroup] = useState(MUSCLE_GROUPS[0])
  const [saving, setSaving] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return
    setSaving(true)
    try { await onCreate(name.trim(), group) } finally { setSaving(false) }
  }

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-grab" />
        <div className="sheet-header">
          <div className="sheet-title">Nuova scheda</div>
          <button className="sheet-close" onClick={onClose}><Icon name="close" size={15} /></button>
        </div>
        <div className="sheet-content">
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Nome scheda
            </div>
            <input
              autoFocus
              type="text"
              placeholder="Es. Petto e Tricipiti"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%', appearance: 'none', border: '1px solid var(--line-2)',
                background: 'var(--surface-2)', borderRadius: 10,
                padding: '12px 14px',
                fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--ink)',
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Gruppo muscolare
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {MUSCLE_GROUPS.map((g) => {
                const active = group === g
                const color = tagColor(g)
                return (
                  <button
                    key={g}
                    onClick={() => setGroup(g)}
                    style={{
                      appearance: 'none', cursor: 'pointer',
                      padding: '7px 14px', borderRadius: 'var(--r-pill)',
                      border: `1px solid ${active ? color + '60' : 'var(--line-2)'}`,
                      background: active ? color + '1A' : 'transparent',
                      fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 600,
                      color: active ? color : 'var(--muted)',
                      textTransform: 'capitalize',
                    }}>
                    {tagLabel(g)}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        <div className="sheet-footer">
          <button
            className="btn btn-primary"
            onClick={handleCreate}
            disabled={!name.trim() || saving}>
            {saving ? 'Creando…' : 'Crea scheda'}
          </button>
        </div>
      </div>
    </>
  )
}
