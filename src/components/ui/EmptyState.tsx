interface EmptyStateProps {
  title: string
  description?: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="px-4 py-16 text-center">
      <p className="text-base font-semibold text-stone-200">{title}</p>
      {description ? <p className="mt-1 text-sm text-stone-400">{description}</p> : null}
    </div>
  )
}
