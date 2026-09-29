import { ChevronDown } from 'lucide-react'
import type { SelectHTMLAttributes } from 'react'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  className?: string
}

export function Select({ className = '', children, ...props }: SelectProps) {
  return (
    <div className="relative inline-block">
      <select
        {...props}
        className={`appearance-none rounded-xl border border-[#29221b] bg-[#161310] py-2.5 pr-10 pl-4 text-sm font-medium text-stone-200 shadow-sm outline-none transition-all hover:border-[#3d3227] focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 cursor-pointer ${className}`}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
    </div>
  )
}
