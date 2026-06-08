'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchExercises, fetchAllPREntries } from '@/lib/queries'
import type { Exercise, PREntry, UserName } from '@/lib/types'

interface PRDataState {
  exercises: Exercise[]
  baseEntries: PREntry[]
  dawgEntries: PREntry[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function usePRData(): PRDataState {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [baseEntries, setBaseEntries] = useState<PREntry[]>([])
  const [dawgEntries, setDawgEntries] = useState<PREntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [exs, base, dawg] = await Promise.all([
          fetchExercises(),
          fetchAllPREntries('base'),
          fetchAllPREntries('dawg'),
        ])
        if (!cancelled) {
          setExercises(exs)
          setBaseEntries(base)
          setDawgEntries(dawg)
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [tick])

  // Realtime subscription on pr_entries
  useEffect(() => {
    const channel = supabase
      .channel('pr_entries_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pr_entries' },
        (payload) => {
          const entry = payload.new as PREntry
          if (entry.user_name === 'base') {
            setBaseEntries((prev) => [...prev, entry].sort(
              (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
            ))
          } else {
            setDawgEntries((prev) => [...prev, entry].sort(
              (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
            ))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return { exercises, baseEntries, dawgEntries, loading, error, refetch }
}

export function useEntriesFor(
  baseEntries: PREntry[],
  dawgEntries: PREntry[],
  user: UserName
): PREntry[] {
  return user === 'base' ? baseEntries : dawgEntries
}
