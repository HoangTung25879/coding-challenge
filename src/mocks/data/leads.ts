import type { Lead, LeadSummary } from '@/types'
import seedData from './leads.json'

export const leadsStore: Lead[] = seedData as Lead[]

export function toLeadSummary(lead: Lead): LeadSummary {
  return {
    id: lead.id,
    fullName: lead.fullName,
    email: lead.email,
    phone: lead.phone,
    status: lead.status,
    source: lead.source,
    primaryVehicleInterest: lead.vehiclesOfInterest[0]?.name ?? 'N/A',
    leadType: lead.leadType,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  }
}
