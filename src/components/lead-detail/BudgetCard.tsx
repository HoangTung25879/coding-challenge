// src/components/lead-detail/BudgetCard.tsx
import type { Lead } from '@/types'

const TIMELINE_LABEL: Record<string, string> = {
  immediate: 'Immediate',
  'within-1-month': 'Within 1 month',
  'within-3-months': 'Within 3 months',
  'within-6-months': 'Within 6 months',
  exploring: 'Just exploring',
}

type Props = { lead: Lead }

export function BudgetCard({ lead }: Props) {
  const { budget, financingPreference, purchaseTimeline } = lead

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: budget.currency, maximumFractionDigits: 0 }).format(n)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <h3 className="font-semibold text-gray-900">Budget & Timeline</h3>

      <div className="space-y-3">
        <Row label="Max Budget" value={fmt(budget.max)} />
        <Row label="Monthly Target" value={`${fmt(budget.monthlyPaymentTarget)}/mo`} />
        <Row label="Financing" value={financingPreference.charAt(0).toUpperCase() + financingPreference.slice(1)} />
        <Row label="Purchase Timeline" value={TIMELINE_LABEL[purchaseTimeline] ?? purchaseTimeline} />
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  )
}
