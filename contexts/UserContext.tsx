'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { UserName } from '@/lib/types'

interface UserContextValue {
  user: UserName | null
  setUser: (u: UserName) => void
}

const UserContext = createContext<UserContextValue>({
  user: null,
  setUser: () => {},
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserName | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('pr_tracker_user') as UserName | null
    if (saved === 'base' || saved === 'dawg') setUserState(saved)
  }, [])

  function setUser(u: UserName) {
    setUserState(u)
    localStorage.setItem('pr_tracker_user', u)
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
