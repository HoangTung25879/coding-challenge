import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  MapPin,
  FileText,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Activity } from '@/types';

const TYPE_CONFIG: Record<Activity['type'], { icon: React.ElementType; color: string }> = {
  call: { icon: Phone, color: 'text-blue-500' },
  email: { icon: Mail, color: 'text-green-500' },
  text: { icon: MessageSquare, color: 'text-teal-500' },
  appointment: { icon: Calendar, color: 'text-purple-500' },
  'walk-in': { icon: MapPin, color: 'text-orange-500' },
  note: { icon: FileText, color: 'text-gray-400' },
};

type SortBy = 'createdAt' | 'scheduledAt';
type SortDir = 'desc' | 'asc';

type Props = {
  activities: Activity[];
  isLoading: boolean;
};

export function ActivityFeed({ activities, isLoading }: Props) {
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const sorted = [...activities].sort((a, b) => {
    const dir = sortDir === 'desc' ? -1 : 1;
    if (sortBy === 'scheduledAt') {
      if (!a.scheduledAt && !b.scheduledAt) return 0;
      if (!a.scheduledAt) return 1;
      if (!b.scheduledAt) return -1;
      return dir * (new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    }
    return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  });
  const sortControls = (
    <div className="mb-4 flex items-center gap-2">
      <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
        <SelectTrigger size="sm" className="h-7 w-auto gap-1 text-xs">
          <SelectValue>{sortBy === 'createdAt' ? 'Created At' : 'Scheduled At'}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">Created At</SelectItem>
          <SelectItem value="scheduledAt">Scheduled At</SelectItem>
        </SelectContent>
      </Select>
      <button
        type="button"
        aria-label={sortDir === 'desc' ? 'Sort descending' : 'Sort ascending'}
        onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
      >
        {sortDir === 'desc' ? (
          <ArrowDown className="h-3.5 w-3.5" />
        ) : (
          <ArrowUp className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div>
        {sortControls}
        <div className="space-y-4 border-l-2 border-gray-200 pl-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} data-testid="activity-skeleton" className="relative">
              <div className="absolute -left-[21px] h-4 w-4 animate-pulse rounded-full bg-gray-200" />
              <div className="ml-2 space-y-1.5">
                <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div>
        {sortControls}
        <div className="flex items-center justify-center py-10 text-sm text-gray-400">
          No activity recorded yet.
        </div>
      </div>
    );
  }

  return (
    <div>
      {sortControls}
      <div className="space-y-5 border-l-2 border-gray-200 pl-4">
        {sorted.map((activity) => {
          const config = TYPE_CONFIG[activity.type] ?? TYPE_CONFIG.note;
          const Icon = config.icon;
          return (
            <div key={activity.id} className="relative">
              {/* Timeline dot */}
              <div className="absolute -left-[21px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-gray-200 bg-white">
                <Icon className={`h-2.5 w-2.5 ${config.color}`} />
              </div>
              <div className="ml-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-gray-900">{activity.subject}</span>
                  <span className="shrink-0 text-xs text-gray-400">
                    {(() => {
                      const d = new Date(activity.createdAt);
                      return isNaN(d.getTime()) ? '—' : formatDistanceToNow(d, { addSuffix: true });
                    })()}
                  </span>
                </div>
                {activity.note && <p className="mt-0.5 text-sm text-gray-500">{activity.note}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
