// src/components/leads/LeadList.tsx
import type { Lead } from '@/types'
import { LeadCard } from './LeadCard'

type Props = { leads: Lead[] }

export function LeadList({ leads }: Props) {
  if (leads.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg font-medium">No leads found</p>
        <p className="text-sm mt-1">Try adjusting your filters.</p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {leads.map(lead => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  )
}
