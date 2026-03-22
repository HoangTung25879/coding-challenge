// src/components/ui/StatusBadge.tsx
import type { LeadStatus } from '@/types'

const STATUS_CONFIG: Record<LeadStatus, { label: string; className: string }> = {
  new:       { label: 'New',       className: 'bg-blue-100 text-blue-800' },
  contacted: { label: 'Contacted', className: 'bg-yellow-100 text-yellow-800' },
  qualified: { label: 'Qualified', className: 'bg-purple-100 text-purple-800' },
  lost:      { label: 'Lost',      className: 'bg-red-100 text-red-800' },
  won:       { label: 'Won',       className: 'bg-emerald-100 text-emerald-800' },
}

type Props = { status: LeadStatus }

export function StatusBadge({ status }: Props) {
  const { label, className } = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
