import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hoverable?: boolean
}

export function Card({ children, className = '', hoverable = false }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-[#26201a] bg-[#151210] text-stone-100 shadow-xl shadow-black/40 transition-all duration-300 ${
        hoverable ? 'hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-amber-500/5 hover:bg-[#181412]' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

