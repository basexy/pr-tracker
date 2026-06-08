'use client'

import { useEffect, useState } from 'react'

interface KeypadProps {
  value: number
  setValue: (v: number) => void
  unit: string
}

export default function Keypad({ value, setValue }: KeypadProps) {
  const [str, setStr] = useState(String(value))

  useEffect(() => { setStr(String(value)) }, [])

  function update(s: string) {
    setStr(s)
    const num = parseFloat(s)
    setValue(isNaN(num) ? 0 : num)
  }

  function press(k: string) {
    if (k === '⌫') { update(str.slice(0, -1) || '0'); return }
    if (k === '.') { if (!str.includes('.')) update(str + '.'); return }
    update(str === '0' ? k : str + k)
  }

  return (
    <div className="keypad">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map((k) => (
        <button key={k}
          className={k === '⌫' ? 'muted' : ''}
          onClick={() => press(k)}>{k}</button>
      ))}
    </div>
  )
}
