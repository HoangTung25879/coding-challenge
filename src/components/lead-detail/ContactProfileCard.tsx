// src/components/lead-detail/ContactProfileCard.tsx
import type { Lead } from '@/types'

type Props = { lead: Lead }

export function ContactProfileCard({ lead }: Props) {
  const { clientProfile, address } = lead

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <h3 className="font-semibold text-gray-900">Contact Profile</h3>

      {clientProfile.type === 'individual' ? (
        <div className="space-y-2">
          <Row label="Type" value="Individual" />
          <Row label="Job Title" value={clientProfile.jobTitle} />
        </div>
      ) : (
        <div className="space-y-2">
          <Row label="Type" value="Organization" />
          <Row label="Company" value={clientProfile.companyName} />
          <Row label="Industry" value={clientProfile.industry} />
          <Row label="Employees" value={clientProfile.numberOfEmployees.toLocaleString()} />
          <Row label="Region" value={clientProfile.companyRegion} />
        </div>
      )}

      <div className="pt-3 border-t border-gray-100 space-y-1">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Address</p>
        <p className="text-sm text-gray-700">{address.street}</p>
        <p className="text-sm text-gray-700">{address.city}, {address.state} {address.postalCode}</p>
        <p className="text-sm text-gray-700">{address.country}</p>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
  )
}
