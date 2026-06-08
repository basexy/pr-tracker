import {
  House, List, Plus, Minus, ClockCounterClockwise, User, MagnifyingGlass,
  X, Check, CaretLeft, CaretRight, CaretDown, ArrowUp, ArrowLeft, Trophy, Lightning,
  PencilSimple, Trash, Moon, Sun, Palette, Target, Circle, CalendarBlank,
  Note, Medal, ArrowsLeftRight, BookOpen, ClipboardText, CheckCircle,
  Barbell, SmileyMeh, ArrowCounterClockwise,
} from '@phosphor-icons/react'

type PhosphorWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'
type PhosphorComp = React.ComponentType<{ size?: number; weight?: PhosphorWeight }>

const ICON_MAP: Record<string, PhosphorComp> = {
  dash:       House,
  list:       List,
  plus:       Plus,
  minus:      Minus,
  clock:      ClockCounterClockwise,
  user:       User,
  search:     MagnifyingGlass,
  close:      X,
  check:      Check,
  checkCircle:CheckCircle,
  chevL:      CaretLeft,
  chevR:      CaretRight,
  chevD:      CaretDown,
  arrowUp:    ArrowUp,
  arrowLeft:  ArrowLeft,
  trophy:     Trophy,
  flash:      Lightning,
  edit:       PencilSimple,
  trash:      Trash,
  moon:       Moon,
  sun:        Sun,
  palette:    Palette,
  bolt:       Lightning,
  target:     Target,
  dot:        Circle,
  cal:        CalendarBlank,
  note:       Note,
  medal:      Medal,
  swap:       ArrowsLeftRight,
  book:       BookOpen,
  clipboard:  ClipboardText,
  barbell:    Barbell,
  rest:       SmileyMeh,
  reset:      ArrowCounterClockwise,
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
    petto:     '#ff7a59',
    gambe:     '#5e9bff',
    schiena:   '#a78bfa',
    dorso:     '#a78bfa',
    spalle:    '#f4b942',
    bicipiti:  '#34d399',
    tricipiti: '#f472b6',
    core:      '#fb7185',
    cardio:    '#22d3ee',
    braccia:   '#fb923c',
    full_body: '#c0e840',
    riposo:    '#71717a',
  }
  return m[tag] ?? '#c0e840'
}

export function tagLabel(tag: string): string {
  const labels: Record<string, string> = {
    petto: 'Petto', gambe: 'Gambe', dorso: 'Dorso', schiena: 'Dorso',
    spalle: 'Spalle', bicipiti: 'Bicipiti', tricipiti: 'Tricipiti',
    core: 'Core', cardio: 'Cardio', braccia: 'Braccia',
    full_body: 'Full Body', riposo: 'Riposo',
  }
  return labels[tag] ?? tag
}

/** Returns the display label for a tag, applying any renames (schiena → dorso). */
export function tagDisplay(tag: string): string {
  const renames: Record<string, string> = { schiena: 'dorso' }
  return renames[tag] ?? tag
}
