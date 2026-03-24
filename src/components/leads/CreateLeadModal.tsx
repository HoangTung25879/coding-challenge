import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useCreateLead } from '@/hooks/useCreateLead';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

const nonEmptyEnum = <T extends [string, ...string[]]>(values: T, message: string) =>
  z.preprocess((v) => (v === '' ? undefined : v), z.enum(values, { error: message }));

const schema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().min(1, 'Email is required').email('Valid email required'),
  phone: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z
      .string()
      .regex(/^\+?[\d\s\-(). ]{7,20}$/, 'Enter a valid phone number')
      .optional()
  ),
  leadType: nonEmptyEnum(['cold', 'warm', 'hot'] as const, 'Lead type is required'),
  source: nonEmptyEnum(
    ['website', 'referral', 'walk-in', 'phone', 'social-media', 'dealer-event', 'other'] as const,
    'Source is required'
  ),
  status: nonEmptyEnum(
    ['new', 'contacted', 'qualified', 'unqualified'] as const,
    'Status is required'
  ),
});

type FormValues = z.infer<typeof schema>;

type Props = { onClose: () => void };

export function CreateLeadModal({ onClose }: Props) {
  const { mutate, isPending, isSuccess, error } = useCreateLead();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    mode: 'onBlur',
  });

  useEffect(() => {
    if (isSuccess) onClose();
  }, [isSuccess, onClose]);

  function onSubmit(data: FormValues) {
    mutate(data);
  }

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open && !isPending) onClose();
      }}
    >
      <DialogContent className="w-full max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Lead</DialogTitle>
        </DialogHeader>

        {error && (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error.message || 'Failed to create lead. Please try again.'}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="fullName"
                aria-label="Full Name"
                {...register('fullName')}
                placeholder="Jane Smith"
                disabled={isPending}
              />
              {errors.fullName && (
                <p role="alert" className="mt-1 text-xs text-red-600">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                aria-label="Email"
                type="email"
                {...register('email')}
                placeholder="jane@example.com"
                disabled={isPending}
              />
              {errors.email && (
                <p role="alert" className="mt-1 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
                Phone
              </label>
              <Input
                id="phone"
                aria-label="Phone"
                type="tel"
                {...register('phone')}
                placeholder="+1 555 000 0000"
                disabled={isPending}
              />
              {errors.phone && (
                <p role="alert" className="mt-1 text-xs text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="leadType" className="mb-1 block text-sm font-medium text-gray-700">
                Lead Type <span className="text-red-500">*</span>
              </label>
              <Controller
                name="leadType"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger id="leadType" aria-label="Lead Type" className="w-full">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cold">Cold</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="hot">Hot</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.leadType && (
                <p role="alert" className="mt-1 text-xs text-red-600">
                  {errors.leadType.message as string}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="source" className="mb-1 block text-sm font-medium text-gray-700">
                Source <span className="text-red-500">*</span>
              </label>
              <Controller
                name="source"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger id="source" aria-label="Source" className="w-full">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="walk-in">Walk-in</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="social-media">Social Media</SelectItem>
                      <SelectItem value="dealer-event">Dealer Event</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.source && (
                <p role="alert" className="mt-1 text-xs text-red-600">
                  {errors.source.message as string}
                </p>
              )}
            </div>

            <div className="col-span-2">
              <label htmlFor="status" className="mb-1 block text-sm font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger id="status" aria-label="Status" className="w-full">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="unqualified">Unqualified</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p role="alert" className="mt-1 text-xs text-red-600">
                  {errors.status.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={onClose}
              disabled={isPending}
              aria-label="Cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="default"
              disabled={isPending}
              aria-label="Create Lead"
            >
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
