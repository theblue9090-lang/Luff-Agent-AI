import { CATEGORIES } from '../data/agents'
import { ArrowDownWideNarrow } from 'lucide-react'

export type TypeFilter = 'All' | 'Sentient' | 'Prototype'
export type SortKey = 'trending' | 'marketCap' | 'gainers' | 'new'

interface FilterBarProps {
  typeFilter: TypeFilter
  onType: (t: TypeFilter) => void
  category: string
  onCategory: (c: string) => void
  sort: SortKey
  onSort: (s: SortKey) => void
}

const TYPES: TypeFilter[] = ['All', 'Sentient', 'Prototype']
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'trending', label: 'Trending' },
  { key: 'marketCap', label: 'Market Cap' },
  { key: 'gainers', label: 'Top Gainers' },
  { key: 'new', label: 'Newest' },
]

export default function FilterBar({
  typeFilter,
  onType,
  category,
  onCategory,
  sort,
  onSort,
}: FilterBarProps) {
  return (
    <div className="space-y-4">
      {/* Type segmented control + sort */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-luff-border bg-white/[0.03] p-1">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => onType(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                typeFilter === t
                  ? 'bg-red-grad text-white shadow-glow-sm'
                  : 'text-luff-muted hover:text-luff-text'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-full border border-luff-border bg-white/[0.03] px-3 py-1.5">
          <ArrowDownWideNarrow className="h-4 w-4 text-luff-muted" />
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value as SortKey)}
            className="cursor-pointer bg-transparent text-sm font-medium text-luff-text outline-none [&>option]:bg-luff-surface"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => onCategory(c)}
            className={`chip transition-all ${
              category === c
                ? 'border-luff-red/60 bg-luff-red/15 text-luff-text'
                : 'border-luff-border bg-white/[0.02] text-luff-muted hover:border-luff-red/30 hover:text-luff-text'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}
