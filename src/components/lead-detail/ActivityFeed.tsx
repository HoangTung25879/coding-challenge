// src/components/lead-detail/ActivityFeed.tsx
import { formatDistanceToNow, format } from 'date-fns'
import type { Activity } from '@/types'

const TYPE_ICON: Record<string, string> = {
  call: '📞',
  email: '✉️',
  text: '💬',
  appointment: '📅',
  note: '📝',
  'walk-in': '🚶',
}

type Props = { activities: Activity[] }

export function ActivityFeed({ activities }: Props) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">No activities yet.</div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map(activity => (
        <div key={activity.id} className="flex gap-3 bg-white border border-gray-200 rounded-lg p-4">
          <span className="text-xl flex-shrink-0">{TYPE_ICON[activity.type] ?? '📌'}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-900">{activity.subject}</span>
              <span className="text-xs text-gray-400 capitalize">{activity.type}</span>
            </div>
            {activity.note && (
              <p className="text-sm text-gray-600 mt-1">{activity.note}</p>
            )}
            <p className="text-xs text-gray-400 mt-1" title={format(new Date(activity.createdAt), 'PPpp')}>
              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
