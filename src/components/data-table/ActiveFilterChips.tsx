import { X } from 'lucide-react'
import type { FilterState } from '@/hooks/useDataTable'

type Props = {
  filters: FilterState
  onRemove: (key: string) => void
}

const FILTER_LABELS: Record<string, string> = {
  status: 'Status',
  source: 'Source',
  timeline: 'Timeline',
  financing: 'Financing',
  leadType: 'Type',
  budgetMin: 'Budget Min',
  budgetMax: 'Budget Max',
}

const VALUE_LABELS: Record<string, Record<string, string>> = {
  status: { new: 'New', contacted: 'Contacted', qualified: 'Qualified', lost: 'Lost', won: 'Won' },
  source: { website: 'Website', referral: 'Referral', 'walk-in': 'Walk-in', phone: 'Phone', 'social-media': 'Social Media', 'dealer-event': 'Dealer Event', other: 'Other' },
  timeline: { immediate: 'Immediate', 'within-1-month': 'Within 1 Month', 'within-3-months': 'Within 3 Months', 'within-6-months': 'Within 6 Months', exploring: 'Exploring' },
  financing: { cash: 'Cash', lease: 'Lease', loan: 'Loan', undecided: 'Undecided' },
  leadType: { cold: 'Cold', warm: 'Warm', hot: 'Hot' },
}

type ActiveFilter = { key: string; label: string; value: string }

function getActiveFilters(filters: FilterState): ActiveFilter[] {
  const active: ActiveFilter[] = []

  for (const key of ['status', 'source', 'timeline', 'financing', 'leadType'] as const) {
    const val = filters[key]
    if (val) {
      active.push({
        key,
        label: FILTER_LABELS[key],
        value: VALUE_LABELS[key]?.[val] ?? val,
      })
    }
  }

  if (filters.budgetMin != null) {
    active.push({ key: 'budgetMin', label: 'Budget Min', value: `$${filters.budgetMin.toLocaleString()}` })
  }
  if (filters.budgetMax != null) {
    active.push({ key: 'budgetMax', label: 'Budget Max', value: `$${filters.budgetMax.toLocaleString()}` })
  }
  if (filters.currency) {
    active.push({ key: 'currency', label: 'Currency', value: filters.currency })
  }

  return active
}

export function ActiveFilterChips({ filters, onRemove }: Props) {
  const active = getActiveFilters(filters)

  if (active.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-gray-500">Filters:</span>
      {active.map((f) => (
        <span
          key={f.key}
          className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-medium text-blue-700"
        >
          {f.label}: {f.value}
          <button
            type="button"
            onClick={() => onRemove(f.key)}
            className="ml-0.5 rounded-full p-0.5 hover:bg-blue-200 transition-colors"
            aria-label={`Remove ${f.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  )
}
