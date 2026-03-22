// src/components/leads/LeadFilters.tsx
import { useSearchParams } from 'react-router-dom'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'lost', label: 'Lost' },
  { value: 'won', label: 'Won' },
]

const SOURCE_OPTIONS = [
  { value: '', label: 'All sources' },
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'walk-in', label: 'Walk-in' },
  { value: 'phone', label: 'Phone' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'dealer-event', label: 'Dealer Event' },
  { value: 'other', label: 'Other' },
]

export function LeadFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  function handleChange(key: string, value: string) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('page') // reset to page 1 on filter change
      return next
    })
  }

  return (
    <div className="flex gap-3 flex-wrap">
      <div className="flex flex-col gap-1">
        <label htmlFor="status-filter" className="text-xs font-medium text-gray-600">Status</label>
        <select
          id="status-filter"
          aria-label="Status"
          value={searchParams.get('status') ?? ''}
          onChange={e => handleChange('status', e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="source-filter" className="text-xs font-medium text-gray-600">Source</label>
        <select
          id="source-filter"
          aria-label="Source"
          value={searchParams.get('source') ?? ''}
          onChange={e => handleChange('source', e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {SOURCE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
