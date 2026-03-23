// src/components/lead-detail/ActivityForm.tsx
import { useState, useEffect } from 'react'
import { useLogActivity } from '@/hooks/useLogActivity'
import type { ActivityType } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: 'call', label: '📞 Call' },
  { value: 'email', label: '✉️ Email' },
  { value: 'text', label: '💬 Text' },
  { value: 'appointment', label: '📅 Appointment' },
  { value: 'note', label: '📝 Note' },
  { value: 'walk-in', label: '🚶 Walk-in' },
]

type Props = { leadId: string }

export function ActivityForm({ leadId }: Props) {
  const { mutate, isPending, isSuccess, isError, error } = useLogActivity()
  const [type, setType] = useState<ActivityType>('call')
  const [subject, setSubject] = useState('')
  const [note, setNote] = useState('')

  // Reset form fields on successful submission (onSuccess in hook handles data layer)
  useEffect(() => {
    if (isSuccess) {
      setSubject('')
      setNote('')
      setType('call')
    }
  }, [isSuccess])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim() || !note.trim()) return
    mutate({ leadId, type, subject: subject.trim(), note: note.trim(), createdBy: 'salesperson-1' })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <h3 className="font-semibold text-gray-900">Log Activity</h3>

      <div className="space-y-3">
        <div>
          <label htmlFor="activity-type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            id="activity-type"
            aria-label="Type"
            value={type}
            onChange={e => setType(e.target.value as ActivityType)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ACTIVITY_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="activity-subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <Input
            id="activity-subject"
            aria-label="Subject"
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Brief summary"
            required
          />
        </div>

        <div>
          <label htmlFor="activity-note" className="block text-sm font-medium text-gray-700 mb-1">Note</label>
          <textarea
            id="activity-note"
            aria-label="Note"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Details of the interaction"
            rows={3}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>

      {isError && (
        <p className="text-sm text-red-600">{(error as Error).message}</p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isPending || !subject.trim() || !note.trim()}
        loading={isPending}
        aria-label="Log Activity"
        className="w-full"
      >
        Log Activity
      </Button>
    </form>
  )
}
