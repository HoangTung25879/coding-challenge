// src/pages/LeadDetailPage.tsx
import { useParams } from 'react-router-dom'
import { useLead } from '@/hooks/useLead'
import { useActivities } from '@/hooks/useActivities'
import { LeadHeader } from '@/components/lead-detail/LeadHeader'
import { ContactProfileCard } from '@/components/lead-detail/ContactProfileCard'
import { VehicleCard } from '@/components/lead-detail/VehicleCard'
import { BudgetCard } from '@/components/lead-detail/BudgetCard'
import { ActivityFeed } from '@/components/lead-detail/ActivityFeed'
import { ActivityForm } from '@/components/lead-detail/ActivityForm'
import { DetailSkeleton } from '@/components/ui/Skeleton'
import { Link } from 'react-router-dom'

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-800">
        <p className="font-medium">Invalid lead ID</p>
      </div>
    )
  }

  // Parallel queries — both fire simultaneously, no waterfall
  const leadQuery = useLead(id)
  const activitiesQuery = useActivities(id)

  if (leadQuery.isLoading) {
    return <DetailSkeleton />
  }

  if (leadQuery.isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-800">
        <p className="font-medium">Lead not found</p>
        <p className="text-sm mt-1">{(leadQuery.error as Error).message}</p>
        <Link to="/leads" className="text-sm text-blue-600 hover:underline mt-3 block">
          ← Back to inbox
        </Link>
      </div>
    )
  }

  const lead = leadQuery.data!
  const activities = activitiesQuery.data?.data ?? []

  return (
    <div className="space-y-6">
      <LeadHeader lead={lead} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ContactProfileCard lead={lead} />
        <BudgetCard lead={lead} />
      </div>

      {lead.vehiclesOfInterest.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Vehicles of Interest</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lead.vehiclesOfInterest.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Activity History</h3>
          {activitiesQuery.isLoading ? (
            <div className="text-sm text-gray-400">Loading activities…</div>
          ) : (
            <ActivityFeed activities={activities} />
          )}
        </div>
        <div>
          <ActivityForm leadId={lead.id} />
        </div>
      </div>
    </div>
  )
}
