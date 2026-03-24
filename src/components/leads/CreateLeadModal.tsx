import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useCreateLead } from '@/hooks/useCreateLead'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const nonEmptyEnum = <T extends [string, ...string[]]>(values: T, message: string) =>
  z.preprocess(v => (v === '' ? undefined : v), z.enum(values, { required_error: message }))

const schema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().min(1, 'Email is required').email('Valid email required'),
  phone: z.string().optional(),
  leadType: nonEmptyEnum(['cold', 'warm', 'hot'] as const, 'Lead type is required'),
  source: nonEmptyEnum(['website', 'referral', 'walk-in', 'phone', 'social-media', 'dealer-event', 'other'] as const, 'Source is required'),
  status: nonEmptyEnum(['new', 'contacted', 'qualified', 'lost', 'won'] as const, 'Status is required'),
})

type FormValues = z.infer<typeof schema>

type Props = { onClose: () => void }

export function CreateLeadModal({ onClose }: Props) {
  const { mutate, isPending, isSuccess, error } = useCreateLead()
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  })

  // Close on success
  useEffect(() => { if (isSuccess) onClose() }, [isSuccess, onClose])

  function onSubmit(data: FormValues) {
    mutate(data)
  }

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={e => { if (e.target === e.currentTarget && !isPending) onClose() }}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg" role="dialog" aria-modal="true" aria-labelledby="create-lead-title">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 id="create-lead-title" className="text-lg font-semibold text-gray-900">Create Lead</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="p-1 rounded text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Server error */}
        {error && (
          <div role="alert" className="mx-6 mt-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error.message || 'Failed to create lead. Please try again.'}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
              <Input id="fullName" aria-label="Full Name" {...register('fullName')} placeholder="Jane Smith" disabled={isPending} />
              {errors.fullName && <p role="alert" className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
              <Input id="email" aria-label="Email" type="email" {...register('email')} placeholder="jane@example.com" disabled={isPending} />
              {errors.email && <p role="alert" className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <Input id="phone" aria-label="Phone" type="tel" {...register('phone')} placeholder="+1 555 000 0000" disabled={isPending} />
              {errors.phone && <p role="alert" className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
            </div>

            {/* Lead Type */}
            <div>
              <label htmlFor="leadType" className="block text-sm font-medium text-gray-700 mb-1">Lead Type <span className="text-red-500">*</span></label>
              <select id="leadType" aria-label="Lead Type" {...register('leadType')} disabled={isPending}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select...</option>
                <option value="cold">Cold</option>
                <option value="warm">Warm</option>
                <option value="hot">Hot</option>
              </select>
              {errors.leadType && <p role="alert" className="mt-1 text-xs text-red-600">{errors.leadType.message}</p>}
            </div>

            {/* Source */}
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">Source <span className="text-red-500">*</span></label>
              <select id="source" aria-label="Source" {...register('source')} disabled={isPending}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select...</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="walk-in">Walk-in</option>
                <option value="phone">Phone</option>
                <option value="social-media">Social Media</option>
                <option value="dealer-event">Dealer Event</option>
                <option value="other">Other</option>
              </select>
              {errors.source && <p role="alert" className="mt-1 text-xs text-red-600">{errors.source.message}</p>}
            </div>

            {/* Status */}
            <div className="sm:col-span-2">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
              <select id="status" aria-label="Status" {...register('status')} disabled={isPending}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select...</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="lost">Lost</option>
                <option value="won">Won</option>
              </select>
              {errors.status && <p role="alert" className="mt-1 text-xs text-red-600">{errors.status.message}</p>}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={isPending} aria-label="Cancel">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" loading={isPending} disabled={isPending} aria-label="Create Lead">
              Create Lead
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
