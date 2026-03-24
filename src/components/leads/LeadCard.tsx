// src/components/leads/LeadCard.tsx
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import type { Lead } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';

const TYPE_ICON: Record<string, string> = {
  cold: '🧊',
  warm: '☀️',
  hot: '🔥',
};

type Props = { lead: Lead };

export function LeadCard({ lead }: Props) {
  const primaryVehicle = lead.vehiclesOfInterest[0];
  const vehicleLabel = primaryVehicle
    ? `${primaryVehicle.year} ${primaryVehicle.brand} ${primaryVehicle.model}`
    : '—';

  return (
    <Link
      to={`/leads/${lead.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-400 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium text-gray-900">{lead.fullName}</span>
            <span title={`Type: ${lead.leadType}`}>{TYPE_ICON[lead.leadType]}</span>
            <StatusBadge status={lead.status} />
          </div>
          <p className="mt-1 truncate text-sm text-gray-500">{vehicleLabel}</p>
          <p className="mt-1 text-xs text-gray-400">
            {lead.source.replace(/-/g, ' ')} ·{' '}
            {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
          </p>
        </div>
        <span className="flex-shrink-0 text-sm text-gray-400">›</span>
      </div>
    </Link>
  );
}
