// src/components/leads/LeadFilters.tsx
import { useSearchParams } from 'react-router-dom';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

const SOURCE_OPTIONS = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'walk-in', label: 'Walk-in' },
  { value: 'phone', label: 'Phone' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'dealer-event', label: 'Dealer Event' },
  { value: 'other', label: 'Other' },
];

const ALL_SOURCES = '__all__';

export function LeadFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  function handleChange(key: string, value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete('page'); // reset to page 1 on filter change
      return next;
    });
  }

  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="source-filter" className="text-xs font-medium text-gray-600">
          Source
        </label>
        <Select
          value={searchParams.get('source') || ALL_SOURCES}
          onValueChange={(v) => handleChange('source', v === null || v === ALL_SOURCES ? '' : v)}
        >
          <SelectTrigger id="source-filter" aria-label="Source" className="h-8 min-w-36 text-sm">
            <SelectValue>
              {searchParams.get('source')
                ? SOURCE_OPTIONS.find((o) => o.value === searchParams.get('source'))?.label
                : 'All sources'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_SOURCES}>All sources</SelectItem>
            {SOURCE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
