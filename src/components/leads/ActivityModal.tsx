import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2 } from 'lucide-react';
import { useLogActivity } from '@/hooks/useLogActivity';
import { useUpdateActivity } from '@/hooks/useUpdateActivity';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import type { Activity } from '@/types';

const TYPE_LABELS: Record<string, string> = {
  call: 'Call',
  email: 'Email',
  text: 'Text',
  appointment: 'Appointment',
  note: 'Note',
  'walk-in': 'Walk-in',
};

const schema = z.object({
  type: z.enum(['call', 'email', 'text', 'appointment', 'note', 'walk-in']),
  subject: z.string().min(1, 'Subject is required'),
  note: z.string().min(1, 'Note is required'),
  scheduledAt: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  leadId: string;
  activity?: Activity;
  onClose: () => void;
};

export function ActivityModal({ leadId, activity, onClose }: Props) {
  const isEdit = !!activity;
  const { mutate: logActivity, isPending: isLogging } = useLogActivity();
  const { mutate: updateActivity, isPending: isUpdating } = useUpdateActivity(leadId);
  const isPending = isLogging || isUpdating;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: activity
      ? {
          type: activity.type,
          subject: activity.subject,
          note: activity.note,
          scheduledAt: activity.scheduledAt ?? '',
        }
      : { type: 'call', subject: '', note: '', scheduledAt: '' },
  });

  const isCompleted = !!activity?.completedAt;

  useEffect(() => {
    if (activity) {
      reset({
        type: activity.type,
        subject: activity.subject,
        note: activity.note,
        scheduledAt: activity.scheduledAt ?? '',
      });
    }
  }, [activity, reset]);

  function onSubmit(data: FormValues) {
    const payload = {
      ...data,
      scheduledAt: data.scheduledAt || undefined,
    };
    if (isEdit) {
      updateActivity({ activityId: activity.id, patch: payload }, { onSuccess: onClose });
    } else {
      logActivity({ leadId, ...payload, createdBy: 'current-user' }, { onSuccess: onClose });
    }
  }

  function handleMarkDone() {
    if (!activity) return;
    updateActivity(
      { activityId: activity.id, patch: { completedAt: new Date().toISOString() } },
      { onSuccess: onClose }
    );
  }

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open && !isPending) onClose();
      }}
    >
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Activity' : 'Add Activity'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-4">
          <div>
            <label htmlFor="act-type" className="mb-1 block text-sm font-medium text-gray-700">
              Type <span className="text-red-500">*</span>
            </label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isPending || isCompleted}
                >
                  <SelectTrigger id="act-type" aria-label="Type" className="w-full">
                    <SelectValue>{TYPE_LABELS[field.value] ?? field.value}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="walk-in">Walk-in</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {errors.type.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
            <Controller
              name="scheduledAt"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  value={field.value || undefined}
                  onChange={(v) => field.onChange(v ?? '')}
                  disabled={isPending || isCompleted}
                  placeholder="Pick date & time"
                />
              )}
            />
          </div>

          <div>
            <label htmlFor="act-subject" className="mb-1 block text-sm font-medium text-gray-700">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              id="act-subject"
              aria-label="Subject"
              {...register('subject')}
              disabled={isPending || isCompleted}
              placeholder="e.g. Follow-up call"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
            />
            {errors.subject && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {errors.subject.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="act-note" className="mb-1 block text-sm font-medium text-gray-700">
              Note <span className="text-red-500">*</span>
            </label>
            <textarea
              id="act-note"
              aria-label="Note"
              {...register('note')}
              disabled={isPending || isCompleted}
              rows={3}
              placeholder="Add details..."
              className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
            />
            {errors.note && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {errors.note.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              {isCompleted ? (
                <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Completed
                </span>
              ) : (
                isEdit &&
                activity?.completedAt === null && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleMarkDone}
                    disabled={isPending}
                    className="flex items-center gap-1 rounded bg-green-50 px-1.5 py-0.5 text-xs text-green-600"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mark as done
                  </Button>
                )
              )}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={onClose}
                disabled={isPending}
                aria-label="Cancel"
              >
                {isCompleted ? 'Close' : 'Cancel'}
              </Button>
              {!isCompleted && (
                <Button type="submit" variant="default" size="default" disabled={isPending}>
                  {isEdit ? 'Save' : 'Submit'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
