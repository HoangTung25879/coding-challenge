import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useLogActivity } from '@/hooks/useLogActivity'
import { useUpdateActivity } from '@/hooks/useUpdateActivity'
import { Button } from '@/components/ui/Button'
import type { Activity } from '@/types'

const schema = z.object({
  type: z.enum(['call', 'email', 'text', 'appointment', 'note', 'walk-in'], { required_error: 'Type is required' }),
  subject: z.string().min(1, 'Subject is required'),
  note: z.string().min(1, 'Note is required'),
})

type FormValues = z.infer<typeof schema>

type Props = {
  leadId: string
  activity?: Activity
  onClose: () => void
}

export function ActivityModal({ leadId, activity, onClose }: Props) {
  const isEdit = !!activity
  const { mutate: logActivity, isPending: isLogging } = useLogActivity()
  const { mutate: updateActivity, isPending: isUpdating } = useUpdateActivity(leadId)
  const isPending = isLogging || isUpdating

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: activity
      ? { type: activity.type, subject: activity.subject, note: activity.note }
      : { type: 'call', subject: '', note: '' },
  })

  useEffect(() => {
    if (activity) {
      reset({ type: activity.type, subject: activity.subject, note: activity.note })
    }
  }, [activity, reset])

  function onSubmit(data: FormValues) {
    if (isEdit) {
      updateActivity({ activityId: activity.id, patch: data }, { onSuccess: onClose })
    } else {
      logActivity({ leadId, ...data, createdBy: 'current-user' }, { onSuccess: onClose })
    }
  }

  function handleMarkDone() {
    if (!activity) return
    updateActivity(
      { activityId: activity.id, patch: { completedAt: new Date().toISOString() } },
      { onSuccess: onClose }
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={e => { if (e.target === e.currentTarget && !isPending) onClose() }}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-modal-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 id="activity-modal-title" className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit Activity' : 'Add Activity'}
          </h2>
          <button type="button" aria-label="Close" onClick={onClose} className="p-1 rounded text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
          <div>
            <label htmlFor="act-type" className="block text-sm font-medium text-gray-700 mb-1">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              id="act-type"
              aria-label="Type"
              {...register('type')}
              disabled={isPending}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="text">Text</option>
              <option value="appointment">Appointment</option>
              <option value="note">Note</option>
              <option value="walk-in">Walk-in</option>
            </select>
            {errors.type && <p role="alert" className="mt-1 text-xs text-red-600">{errors.type.message}</p>}
          </div>

          <div>
            <label htmlFor="act-subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              id="act-subject"
              aria-label="Subject"
              {...register('subject')}
              disabled={isPending}
              placeholder="e.g. Follow-up call"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.subject && <p role="alert" className="mt-1 text-xs text-red-600">{errors.subject.message}</p>}
          </div>

          <div>
            <label htmlFor="act-note" className="block text-sm font-medium text-gray-700 mb-1">
              Note <span className="text-red-500">*</span>
            </label>
            <textarea
              id="act-note"
              aria-label="Note"
              {...register('note')}
              disabled={isPending}
              rows={3}
              placeholder="Add details..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            {errors.note && <p role="alert" className="mt-1 text-xs text-red-600">{errors.note.message}</p>}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              {isEdit && activity?.completedAt === null && (
                <Button type="button" variant="secondary" size="md" onClick={handleMarkDone} disabled={isPending}>
                  Mark as done
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={isPending} aria-label="Cancel">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" loading={isPending} disabled={isPending}>
                {isEdit ? 'Save' : 'Submit'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
