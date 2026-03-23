// src/components/leads/LeadCard.tsx
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import type { Lead } from '@/types'
import { StatusBadge } from '@/components/ui/StatusBadge'

const TYPE_ICON: Record<string, string> = {
  cold: '🧊',
  warm: '☀️',
  hot: '🔥',
}

type Props = { lead: Lead }

export function LeadCard({ lead }: Props) {
  const primaryVehicle = lead.vehiclesOfInterest[0]
  const vehicleLabel = primaryVehicle
    ? `${primaryVehicle.year} ${primaryVehicle.brand} ${primaryVehicle.model}`
    : '—'

  return (
    <Link
      to={`/leads/${lead.id}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 truncate">{lead.fullName}</span>
            <span title={`Type: ${lead.leadType}`}>
              {TYPE_ICON[lead.leadType]}
            </span>
            <StatusBadge status={lead.status} />
          </div>
          <p className="text-sm text-gray-500 mt-1 truncate">{vehicleLabel}</p>
          <p className="text-xs text-gray-400 mt-1">
            {lead.source.replace(/-/g, ' ')} · {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
          </p>
        </div>
        <span className="text-gray-400 text-sm flex-shrink-0">›</span>
      </div>
    </Link>
  )
}
