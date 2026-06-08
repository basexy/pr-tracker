'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { Theme, Accent } from '@/lib/types'

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
  accent: Accent
  setAccent: (a: Accent) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
  accent: 'lime',
  setAccent: () => {},
})

const ACCENT_MAP: Record<Accent, [string, string, string, string]> = {
  lime:   ['#C0E840', '#161412', '#8FA92D', '#D4FF3A'],
  orange: ['#FF7A59', '#FFFFFE', '#E15A39', '#FF7A59'],
  blue:   ['#5E9BFF', '#FFFFFE', '#3F7CDC', '#7BB0FF'],
  red:    ['#F87171', '#FFFFFE', '#D14F4F', '#FB8B8B'],
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [accent, setAccentState] = useState<Accent>('lime')

  useEffect(() => {
    const t = localStorage.getItem('pr_theme') as Theme | null
    const a = localStorage.getItem('pr_accent') as Accent | null
    if (t === 'light' || t === 'dark') setThemeState(t)
    if (a) setAccentState(a)
  }, [])

  useEffect(() => {
    const [hex, on, deep, hexDark] = ACCENT_MAP[accent]
    const root = document.documentElement
    root.style.setProperty('--lime', theme === 'dark' ? hexDark : hex)
    root.style.setProperty('--lime-on', on)
    root.style.setProperty('--lime-deep', deep)
  }, [accent, theme])

  function setTheme(t: Theme) {
    setThemeState(t)
    localStorage.setItem('pr_theme', t)
  }

  function setAccent(a: Accent) {
    setAccentState(a)
    localStorage.setItem('pr_accent', a)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
