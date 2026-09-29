import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginationMeta } from '@/types/api'
import { formatNumber } from '@/utils/format'
import { Select } from '@/components/ui/Select'

interface PaginationProps {
  meta?: PaginationMeta
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
}

function pageNumbers(current: number, total: number): number[] {
  const windowSize = 5
  const start = Math.max(1, Math.min(current - 2, total - windowSize + 1))
  const end = Math.min(total, start + windowSize - 1)
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index)
}

export function Pagination({ meta, onPageChange, onLimitChange }: PaginationProps) {
  if (!meta || meta.total === 0) return null

  const { page, totalPage, total, limit } = meta
  const pages = pageNumbers(page, totalPage)

  return (
    <div className="flex flex-col gap-3 border-t border-[#26201a] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-stone-400">
        Page {page} of {totalPage} · {formatNumber(total)} records
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {onLimitChange ? (
          <Select
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            className="py-1.5 text-xs"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </Select>
        ) : null}
        <button
          type="button"
          className="rounded-xl border border-[#29221b] bg-[#1d1814] p-2 text-stone-300 transition hover:border-amber-500/40 hover:text-white disabled:opacity-30 disabled:hover:border-[#29221b]"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={`min-w-8 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              item === page
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md shadow-amber-500/20'
                : 'border border-[#29221b] bg-[#1d1814] text-stone-300 hover:border-amber-500/40 hover:text-white'
            }`}
          >
            {item}
          </button>
        ))}
        <button
          type="button"
          className="rounded-xl border border-[#29221b] bg-[#1d1814] p-2 text-stone-300 transition hover:border-amber-500/40 hover:text-white disabled:opacity-30 disabled:hover:border-[#29221b]"
          disabled={page >= totalPage}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
