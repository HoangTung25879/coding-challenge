import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

type Props = {
  value?: string; // ISO datetime string e.g. "2026-03-24T09:00"
  onChange: (val: string | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
};

function toTimeStr(iso: string) {
  return iso.slice(11, 16);
}
function combine(date: Date, time: string) {
  return `${format(date, 'yyyy-MM-dd')}T${time || '00:00'}`;
}

export function DateTimePicker({ value, onChange, disabled, placeholder = 'Date' }: Props) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const selectedDate = value ? parseISO(value) : undefined;
  const timeValue = value ? toTimeStr(value) : '';

  function handleDaySelect(day: Date | undefined) {
    if (!day) return;
    onChange(combine(day, timeValue || '00:00'));
    setCalendarOpen(false);
  }

  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const t = e.target.value;
    if (selectedDate) {
      onChange(combine(selectedDate, t));
    } else {
      onChange(combine(new Date(), t));
    }
  }

  function handleClearDate(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(undefined);
  }

  return (
    <div className="flex gap-2">
      {/* Date picker */}
      <Popover open={calendarOpen} onOpenChange={disabled ? undefined : setCalendarOpen}>
        <PopoverTrigger
          disabled={disabled}
          className={cn(
            'flex h-9 flex-1 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm transition-colors',
            'hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400',
            !selectedDate && 'text-gray-400'
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 text-gray-400" />
          <span className="flex-1 truncate text-left">
            {selectedDate ? format(selectedDate, 'MMM d, yyyy') : placeholder}
          </span>
          {selectedDate && !disabled && (
            <button
              type="button"
              onClick={handleClearDate}
              className="shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-600"
              aria-label="Clear date"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" side="bottom">
          <Calendar mode="single" selected={selectedDate} onSelect={handleDaySelect} />
        </PopoverContent>
      </Popover>

      {/* Time input */}
      <Input
        type="time"
        value={timeValue}
        onChange={handleTimeChange}
        disabled={disabled}
        className="h-9 w-32 shrink-0"
      />
    </div>
  );
}
