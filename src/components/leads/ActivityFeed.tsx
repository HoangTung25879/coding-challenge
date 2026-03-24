import { formatDistanceToNow } from 'date-fns'
import { Phone, Mail, MessageSquare, Calendar, MapPin, FileText } from 'lucide-react'
import type { Activity } from '@/types'

const TYPE_CONFIG: Record<Activity['type'], { icon: React.ElementType; color: string }> = {
  call:        { icon: Phone,         color: 'text-blue-500' },
  email:       { icon: Mail,          color: 'text-green-500' },
  text:        { icon: MessageSquare, color: 'text-teal-500' },
  appointment: { icon: Calendar,      color: 'text-purple-500' },
  'walk-in':   { icon: MapPin,        color: 'text-orange-500' },
  note:        { icon: FileText,      color: 'text-gray-400' },
}

type Props = {
  activities: Activity[]
  isLoading: boolean
}

export function ActivityFeed({ activities, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-4 pl-4 border-l-2 border-gray-200">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} data-testid="activity-skeleton" className="relative">
            <div className="absolute -left-[21px] w-4 h-4 rounded-full bg-gray-200 animate-pulse" />
            <div className="space-y-1.5 ml-2">
              <div className="h-3 w-1/3 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-gray-400">
        No activity recorded yet.
      </div>
    )
  }

  return (
    <div className="pl-4 border-l-2 border-gray-200 space-y-5">
      {activities.map(activity => {
        const config = TYPE_CONFIG[activity.type] ?? TYPE_CONFIG.note
        const Icon = config.icon
        return (
          <div key={activity.id} className="relative">
            {/* Timeline dot */}
            <div className="absolute -left-[21px] w-4 h-4 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
              <Icon className={`h-2.5 w-2.5 ${config.color}`} />
            </div>
            <div className="ml-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold text-gray-900">{activity.subject}</span>
                <span className="text-xs text-gray-400 shrink-0">
                  {(() => {
                    const d = new Date(activity.createdAt)
                    return isNaN(d.getTime()) ? '—' : formatDistanceToNow(d, { addSuffix: true })
                  })()}
                </span>
              </div>
              {activity.note && (
                <p className="text-sm text-gray-500 mt-0.5">{activity.note}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
