interface BadgeProps {
  children: string
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'featured'
}

const tones: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral: 'bg-stone-800/80 text-stone-300 border border-stone-700/50',
  success: 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50',
  warning: 'bg-amber-950/60 text-amber-400 border border-amber-800/50',
  danger: 'bg-red-950/60 text-red-400 border border-red-800/50',
  info: 'bg-sky-950/60 text-sky-400 border border-sky-800/50',
  featured: 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold uppercase tracking-wider text-[10px]',
}

export function statusTone(status?: string): BadgeProps['tone'] {
  const value = status?.toLowerCase() ?? ''
  if (['featured'].includes(value)) return 'featured'
  if (['active', 'resolved', 'success', 'published'].includes(value)) return 'success'
  if (['pending', 'recommended', 'inactive', 'draft'].includes(value)) return 'warning'
  if (['cancelled', 'closed', 'failed'].includes(value)) return 'danger'
  if (['in_progress'].includes(value)) return 'info'
  return 'neutral'
}

export function Badge({ children, tone }: BadgeProps) {
  const resolvedTone = tone ?? statusTone(children) ?? 'neutral'
  const isFeatured = children.toLowerCase() === 'featured' || resolvedTone === 'featured'

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
        tones[resolvedTone]
      }`}
    >
      {isFeatured && <span className="mr-1 h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />}
      {children.replaceAll('_', ' ').toLowerCase()}
    </span>
  )
}

