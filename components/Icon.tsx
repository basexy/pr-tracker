interface IconProps {
  name: string
  size?: number
  stroke?: number
}

export default function Icon({ name, size = 22, stroke = 1.7 }: IconProps) {
  const sw = stroke
  const p = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  const paths: Record<string, React.ReactNode> = {
    dash: <><path {...p} d="M3 12l9-8 9 8"/><path {...p} d="M5 11v9h14v-9"/><path {...p} d="M10 20v-5h4v5"/></>,
    list: <><path {...p} d="M4 6h16"/><path {...p} d="M4 12h16"/><path {...p} d="M4 18h10"/></>,
    plus: <path {...p} d="M12 5v14M5 12h14"/>,
    minus: <path {...p} d="M5 12h14"/>,
    clock: <><circle {...p} cx="12" cy="12" r="9"/><path {...p} d="M12 7v5l3 2"/></>,
    user: <><circle {...p} cx="12" cy="8" r="4"/><path {...p} d="M4 21c1.5-4 4.7-6 8-6s6.5 2 8 6"/></>,
    search: <><circle {...p} cx="11" cy="11" r="6.5"/><path {...p} d="M16 16l4.5 4.5"/></>,
    close: <path {...p} d="M6 6l12 12M18 6L6 18"/>,
    check: <path {...p} d="M5 12l5 5L20 6"/>,
    chevL: <path {...p} d="M15 5l-7 7 7 7"/>,
    chevR: <path {...p} d="M9 5l7 7-7 7"/>,
    chevD: <path {...p} d="M5 9l7 7 7-7"/>,
    arrowUp: <><path {...p} d="M12 19V5"/><path {...p} d="M5 12l7-7 7 7"/></>,
    trophy: <><path {...p} d="M7 4h10v4a5 5 0 01-10 0V4z"/><path {...p} d="M5 6H3v2a3 3 0 003 3"/><path {...p} d="M19 6h2v2a3 3 0 01-3 3"/><path {...p} d="M9 14h6v2H9z"/><path {...p} d="M8 20h8"/><path {...p} d="M12 16v4"/></>,
    flash: <path {...p} d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>,
    edit: <><path {...p} d="M4 20h4l10-10-4-4L4 16v4z"/><path {...p} d="M14 6l4 4"/></>,
    trash: <><path {...p} d="M4 7h16"/><path {...p} d="M10 7V4h4v3"/><path {...p} d="M6 7l1 13h10l1-13"/></>,
    moon: <path {...p} d="M21 13a8 8 0 11-10-10 7 7 0 0010 10z"/>,
    sun: <><circle {...p} cx="12" cy="12" r="4"/><path {...p} d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></>,
    palette: <><circle {...p} cx="12" cy="12" r="9"/><circle {...p} cx="7" cy="11" r="1.3"/><circle {...p} cx="11" cy="7" r="1.3"/><circle {...p} cx="16" cy="9" r="1.3"/><circle {...p} cx="16" cy="14" r="1.3"/></>,
    bolt: <path {...p} d="M13 3l-8 11h6l-2 7 9-12h-6l1-6z"/>,
    target: <><circle {...p} cx="12" cy="12" r="9"/><circle {...p} cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></>,
    dot: <circle cx="12" cy="12" r="3" fill="currentColor"/>,
    cal: <><rect {...p} x="3" y="5" width="18" height="16" rx="2"/><path {...p} d="M3 9h18M8 3v4M16 3v4"/></>,
    note: <><path {...p} d="M5 4h11l4 4v12a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"/><path {...p} d="M8 11h7M8 15h5"/></>,
    medal: <><circle {...p} cx="12" cy="14" r="6"/><path {...p} d="M8 4l4 6 4-6"/></>,
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
      {paths[name] ?? null}
    </svg>
  )
}

export function tagColor(tag: string): string {
  const m: Record<string, string> = {
    petto: '#ff7a59',
    gambe: '#5e9bff',
    schiena: '#a78bfa',
    spalle: '#f4b942',
    bicipiti: '#34d399',
    tricipiti: '#f472b6',
    core: '#fb7185',
    cardio: '#22d3ee',
  }
  return m[tag] ?? '#c0e840'
}
