// src/components/lead-detail/LeadHeader.tsx
import { Link } from 'react-router-dom'
import type { Lead } from '@/types'
import { StatusBadge } from '@/components/ui/StatusBadge'

const TYPE_LABEL: Record<string, string> = {
  cold: '🧊 Cold',
  warm: '☀️ Warm',
  hot: '🔥 Hot',
}

const COMM_ICON: Record<string, string> = {
  call: '📞',
  text: '💬',
  email: '✉️',
  'in-person': '🤝',
}

type Props = { lead: Lead }

export function LeadHeader({ lead }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link to="/leads" className="text-sm text-blue-600 hover:underline">← Back to inbox</Link>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">{lead.fullName}</h2>
          <p className="text-gray-500 text-sm mt-0.5">{lead.email} · {lead.phone}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={lead.status} />
          <span className="text-sm font-medium text-gray-600">{TYPE_LABEL[lead.leadType]}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Best time to contact</p>
          <p className="text-sm font-medium text-gray-800 mt-1">{lead.bestTimeToContact}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Source</p>
          <p className="text-sm font-medium text-gray-800 mt-1 capitalize">{lead.source.replace(/-/g, ' ')}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Preferred contact</p>
          <p className="text-sm font-medium text-gray-800 mt-1">
            {lead.preferredCommunication.map(c => COMM_ICON[c] ?? c).join(' ')}
          </p>
        </div>
      </div>

      {lead.notes && (
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Notes</p>
          <p className="text-sm text-gray-700">{lead.notes}</p>
        </div>
      )}
    </div>
  )
}
