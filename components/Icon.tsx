import {
  House, List, Plus, Minus, ClockCounterClockwise, User, MagnifyingGlass,
  X, Check, CaretLeft, CaretRight, CaretDown, ArrowUp, Trophy, Lightning,
  PencilSimple, Trash, Moon, Sun, Palette, Target, Circle, CalendarBlank,
  Note, Medal,
} from '@phosphor-icons/react'

type PhosphorWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'
type PhosphorComp = React.ComponentType<{ size?: number; weight?: PhosphorWeight }>

const ICON_MAP: Record<string, PhosphorComp> = {
  dash:    House,
  list:    List,
  plus:    Plus,
  minus:   Minus,
  clock:   ClockCounterClockwise,
  user:    User,
  search:  MagnifyingGlass,
  close:   X,
  check:   Check,
  chevL:   CaretLeft,
  chevR:   CaretRight,
  chevD:   CaretDown,
  arrowUp: ArrowUp,
  trophy:  Trophy,
  flash:   Lightning,
  edit:    PencilSimple,
  trash:   Trash,
  moon:    Moon,
  sun:     Sun,
  palette: Palette,
  bolt:    Lightning,
  target:  Target,
  dot:     Circle,
  cal:     CalendarBlank,
  note:    Note,
  medal:   Medal,
}

function strokeToWeight(stroke: number): PhosphorWeight {
  if (stroke <= 1.6) return 'light'
  if (stroke <= 2.0) return 'regular'
  return 'bold'
}

interface IconProps {
  name: string
  size?: number
  stroke?: number
}

export default function Icon({ name, size = 22, stroke = 1.7 }: IconProps) {
  const Comp = ICON_MAP[name]
  if (!Comp) return null
  return <Comp size={size} weight={strokeToWeight(stroke)} />
}

export function tagColor(tag: string): string {
  const m: Record<string, string> = {
    petto:    '#ff7a59',
    gambe:    '#5e9bff',
    schiena:  '#a78bfa',
    dorso:    '#a78bfa',
    spalle:   '#f4b942',
    bicipiti: '#34d399',
    tricipiti:'#f472b6',
    core:     '#fb7185',
    cardio:   '#22d3ee',
  }
  return m[tag] ?? '#c0e840'
}

/** Returns the display label for a tag, applying any renames (schiena → dorso). */
export function tagDisplay(tag: string): string {
  const renames: Record<string, string> = { schiena: 'dorso' }
  return renames[tag] ?? tag
}
