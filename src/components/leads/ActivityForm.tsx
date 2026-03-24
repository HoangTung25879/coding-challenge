// leadflow/src/components/leads/ActivityForm.tsx
import { useState } from 'react';
import { useLogActivity } from '@/hooks/useLogActivity';
import type { ActivityType } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: 'call', label: '📞 Call' },
  { value: 'email', label: '✉️ Email' },
  { value: 'text', label: '💬 Text' },
  { value: 'appointment', label: '📅 Appointment' },
  { value: 'note', label: '📝 Note' },
  { value: 'walk-in', label: '🚶 Walk-in' },
];

type Props = { leadId: string };

export function ActivityForm({ leadId }: Props) {
  const { mutate, isPending, isError, error } = useLogActivity();
  const [type, setType] = useState<ActivityType>('call');
  const [subject, setSubject] = useState('');
  const [note, setNote] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !note.trim()) return;
    mutate(
      { leadId, type, subject: subject.trim(), note: note.trim(), createdBy: 'salesperson-1' },
      {
        onSuccess: () => {
          setSubject('');
          setNote('');
          setType('call');
        },
      }
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-gray-200 bg-white p-4"
    >
      <h3 className="text-sm font-semibold text-gray-900">Log Activity</h3>
      <div className="space-y-2">
        <div>
          <label
            htmlFor="activity-type-drawer"
            className="mb-1 block text-xs font-medium text-gray-700"
          >
            Type
          </label>
          <Select value={type} onValueChange={(v) => setType(v as ActivityType)}>
            <SelectTrigger id="activity-type-drawer" aria-label="Type" className="w-full text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label
            htmlFor="activity-subject-drawer"
            className="mb-1 block text-xs font-medium text-gray-700"
          >
            Subject
          </label>
          <Input
            id="activity-subject-drawer"
            aria-label="Subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief summary"
            required
          />
        </div>
        <div>
          <label
            htmlFor="activity-note-drawer"
            className="mb-1 block text-xs font-medium text-gray-700"
          >
            Note
          </label>
          <Textarea
            id="activity-note-drawer"
            aria-label="Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Details"
            rows={2}
            required
            className="resize-none"
          />
        </div>
      </div>
      {isError && error instanceof Error && <p className="text-xs text-red-600">{error.message}</p>}
      <Button
        type="submit"
        variant="default"
        size="default"
        disabled={isPending || !subject.trim() || !note.trim()}
        aria-label="Log Activity"
        className="w-full"
      >
        Log Activity
      </Button>
    </form>
  );
}
