import { useState, useEffect, useCallback, useRef } from 'react'
import { X, AlertCircle, CheckCircle2, Phone, Mail, MessageSquare, Calendar, FileText, User } from 'lucide-react'
import { useLead } from '@/hooks/useLead'
import { useActivities } from '@/hooks/useActivities'
import { useUpdateLead } from '@/hooks/useUpdateLead'
import { InlineEditField } from './InlineEditField'
import { formatDistanceToNow } from 'date-fns'
import { useUpdateActivity } from '@/hooks/useUpdateActivity'
import { ActivityModal } from './ActivityModal'
import { Button } from '@/components/ui/Button'
import type { Lead, Activity } from '@/types'

const OPTION_LABELS: Record<string, string> = {
  // Lead type
  cold: 'Cold', warm: 'Warm', hot: 'Hot',
  // Status
  new: 'New', contacted: 'Contacted', qualified: 'Qualified', unqualified: 'Unqualified',
  // Source
  website: 'Website', referral: 'Referral', 'walk-in': 'Walk-in', phone: 'Phone',
  'social-media': 'Social Media', 'dealer-event': 'Dealer Event', other: 'Other',
  // Sales model
  direct: 'Direct', indirect: 'Indirect',
  // Financing
  cash: 'Cash', lease: 'Lease', loan: 'Loan', undecided: 'Undecided',
  // Timeline
  immediate: 'Immediate', 'within-1-month': 'Within 1 Month',
  'within-3-months': 'Within 3 Months', 'within-6-months': 'Within 6 Months', exploring: 'Exploring',
  // Communication
  call: 'Call', text: 'Text', email: 'Email', 'in-person': 'In-person',
}

type Props = {
  leadId: string
  onClose: () => void
}

export function LeadDetailDrawer({ leadId, onClose }: Props) {
  const { data: lead, isLoading, isError, error } = useLead(leadId)
  const { data: activitiesData, isLoading: activitiesLoading } = useActivities(leadId)
  const { mutateAsync: updateLead, isPending: isUpdating } = useUpdateLead()

  const [activeField, setActiveField] = useState<string | null>(null)

  const leadRef = useRef(lead)
  useEffect(() => { leadRef.current = lead }, [lead])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Reset editing state when the lead changes
  useEffect(() => {
    setActiveField(null)
  }, [leadId])

  const requestEdit = useCallback((key: string) => {
    if (isUpdating) return
    setActiveField(key)
  }, [isUpdating])

  const cancelEdit = useCallback(() => setActiveField(null), [])

  function makeOnSave(fieldKey: keyof Lead) {
    return async (newValue: unknown) => {
      await updateLead({ id: leadId, patch: { [fieldKey]: newValue } as Partial<Lead> })
    }
  }

  const makeAddressSave = useCallback((addressKey: keyof Lead['address']) => {
    return async (newValue: string) => {
      if (!leadRef.current) return
      await updateLead({
        id: leadId,
        patch: { address: { ...leadRef.current.address, [addressKey]: newValue } },
      })
    }
  }, [leadId, updateLead])

  const makeProfileSave = useCallback((profileKey: string) => {
    return async (newValue: string | number) => {
      if (!leadRef.current?.clientProfile) return
      await updateLead({
        id: leadId,
        patch: { clientProfile: { ...leadRef.current.clientProfile, [profileKey]: newValue } as Lead['clientProfile'] },
      })
    }
  }, [leadId, updateLead])

  const activities = activitiesData?.data ?? []

  const { mutate: markActivity } = useUpdateActivity(leadId)
  const [activityModal, setActivityModal] = useState<{ open: boolean; activityId?: string }>({ open: false })
  const modalActivity = activityModal.activityId
    ? activities.find(a => a.id === activityModal.activityId)
    : undefined

  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full w-full max-w-[860px] flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">
            {lead ? lead.fullName : 'Lead Details'}
          </h2>
          <button type="button" aria-label="Close drawer" onClick={onClose}
            className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading && <DrawerSkeleton />}

        {isError && (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center p-8">
            <AlertCircle className="h-10 w-10 text-red-400" />
            <p className="text-gray-600">{error instanceof Error ? error.message : 'Lead not found.'}</p>
            <Button variant="secondary" size="md" onClick={onClose}>Close</Button>
          </div>
        )}

        {lead && (
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 md:border-r md:border-gray-100">

              <Section title="Contact">
                <Field label="Full Name" fieldKey="fullName" value={lead.fullName}
                  active={activeField} onEdit={requestEdit} onCancel={cancelEdit} onSave={makeOnSave('fullName')} />
                <Field label="Email" fieldKey="email" value={lead.email}
                  active={activeField} onEdit={requestEdit} onCancel={cancelEdit} onSave={makeOnSave('email')} />
                <Field label="Phone" fieldKey="phone" value={lead.phone ?? ''}
                  active={activeField} onEdit={requestEdit} onCancel={cancelEdit} onSave={makeOnSave('phone')} />
                <Field label="Best Time to Contact" fieldKey="bestTimeToContact" value={lead.bestTimeToContact ?? ''}
                  active={activeField} onEdit={requestEdit} onCancel={cancelEdit} onSave={makeOnSave('bestTimeToContact')} />
              </Section>

              <Section title="Address">
                {(['street', 'city', 'state', 'country', 'postalCode'] as const).map(key => (
                  <Field key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}
                    fieldKey={`address.${key}`} value={lead.address[key] ?? ''}
                    active={activeField} onEdit={requestEdit} onCancel={cancelEdit} onSave={makeAddressSave(key)} />
                ))}
              </Section>

              <Section title="Lead Info">
                <SelectField label="Lead Type" fieldKey="leadType" value={lead.leadType}
                  options={['cold', 'warm', 'hot']}
                  active={activeField} onEdit={requestEdit} onCancel={cancelEdit} onSave={makeOnSave('leadType')} />
                <SelectField label="Status" fieldKey="status" value={lead.status}
                  options={['new', 'contacted', 'qualified', 'unqualified']}
                  active={activeField} onEdit={requestEdit} onCancel={cancelEdit} onSave={makeOnSave('status')} />
                <SelectField label="Source" fieldKey="source" value={lead.source}
                  options={['website', 'referral', 'walk-in', 'phone', 'social-media', 'dealer-event', 'other']}
                  active={activeField} onEdit={requestEdit} onCancel={cancelEdit} onSave={makeOnSave('source')} />
                <SelectField label="Sales Model" fieldKey="salesModel" value={lead.salesModel}
                  options={['direct', 'indirect']}
                  active={activeField} onEdit={requestEdit} onCancel={cancelEdit} onSave={makeOnSave('salesModel')} />
                <Field label="Assigned Sales Rep" fieldKey="assignedSalesRepId" value={lead.assignedSalesRepId ?? ''}
                  active={activeField} onEdit={requestEdit} onCancel={cancelEdit} onSave={makeOnSave('assignedSalesRepId')} />
              </Section>

              <Section title="Preferences">
                <SelectField label="Financing" fieldKey="financingPreference" value={lead.financingPreference}
                  options={['cash', 'lease', 'loan', 'undecided']}
                  active={activeField} onEdit={requestEdit} onCancel={cancelEdit} onSave={makeOnSave('financingPreference')} />
                <SelectField label="Purchase Timeline" fieldKey="purchaseTimeline" value={lead.purchaseTimeline}
                  options={['immediate', 'within-1-month', 'within-3-months', 'within-6-months', 'exploring']}
                  active={activeField} onEdit={requestEdit} onCancel={cancelEdit} onSave={makeOnSave('purchaseTimeline')} />
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Preferred Communication</p>
                  <InlineEditField<string[]>
                    label="Preferred Communication"
                    value={lead.preferredCommunication}
                    displayValue={lead.preferredCommunication.map(c => OPTION_LABELS[c] ?? c).join(', ') || undefined}
                    isEditing={activeField === 'preferredCommunication'}
                    onEditRequest={() => requestEdit('preferredCommunication')}
                    onCancel={cancelEdit}
                    renderInput={({ value: val, onChange }) => (
                      <div className="flex flex-wrap gap-2">
                        {(['call', 'text', 'email', 'in-person'] as const).map(opt => (
                          <label key={opt} className="flex items-center gap-1 text-sm cursor-pointer">
                            <input type="checkbox" checked={val.includes(opt)}
                              onChange={e => onChange(e.target.checked ? [...val, opt] : val.filter(v => v !== opt))} />
                            {OPTION_LABELS[opt]}
                          </label>
                        ))}
                      </div>
                    )}
                    onSave={makeOnSave('preferredCommunication')}
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                  <InlineEditField<string>
                    label="Notes"
                    value={lead.notes ?? ''}
                    isEditing={activeField === 'notes'}
                    onEditRequest={() => requestEdit('notes')}
                    onCancel={cancelEdit}
                    renderInput={({ value: val, onChange }) => (
                      <textarea value={val} onChange={e => onChange(e.target.value)} rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                    )}
                    onSave={makeOnSave('notes')}
                  />
                </div>
              </Section>

              <Section title="Budget">
                <NumberField label="Max Budget" fieldKey="budget.max" value={lead.budget.max}
                  active={activeField} onEdit={requestEdit} onCancel={cancelEdit}
                  onSave={async (v: number) => updateLead({ id: leadId, patch: { budget: { ...lead.budget, max: v } } })} />
                <NumberField label="Monthly Payment Target" fieldKey="budget.monthlyPaymentTarget" value={lead.budget.monthlyPaymentTarget}
                  active={activeField} onEdit={requestEdit} onCancel={cancelEdit}
                  onSave={async (v: number) => updateLead({ id: leadId, patch: { budget: { ...lead.budget, monthlyPaymentTarget: v } } })} />
                <Field label="Currency" fieldKey="budget.currency" value={lead.budget.currency}
                  active={activeField} onEdit={requestEdit} onCancel={cancelEdit}
                  onSave={async (v: string) => updateLead({ id: leadId, patch: { budget: { ...lead.budget, currency: v } } })} />
              </Section>

              <Section title="Profile">
                {!lead.clientProfile ? (
                  <p className="text-sm text-gray-400 italic">No profile recorded.</p>
                ) : lead.clientProfile.type === 'individual' ? (
                  <Field label="Job Title" fieldKey="profile.jobTitle" value={lead.clientProfile.jobTitle}
                    active={activeField} onEdit={requestEdit} onCancel={cancelEdit} onSave={makeProfileSave('jobTitle')} />
                ) : (
                  <>
                    <Field label="Company Name" fieldKey="profile.companyName" value={lead.clientProfile.companyName}
                      active={activeField} onEdit={requestEdit} onCancel={cancelEdit} onSave={makeProfileSave('companyName')} />
                    <Field label="Industry" fieldKey="profile.industry" value={lead.clientProfile.industry}
                      active={activeField} onEdit={requestEdit} onCancel={cancelEdit} onSave={makeProfileSave('industry')} />
                    <NumberField label="Employees" fieldKey="profile.numberOfEmployees" value={lead.clientProfile.numberOfEmployees}
                      active={activeField} onEdit={requestEdit} onCancel={cancelEdit} onSave={makeProfileSave('numberOfEmployees')} />
                    <NumberField label="Annual Revenue" fieldKey="profile.annualRevenue" value={lead.clientProfile.annualRevenue}
                      active={activeField} onEdit={requestEdit} onCancel={cancelEdit} onSave={makeProfileSave('annualRevenue')} />
                    <Field label="Region" fieldKey="profile.companyRegion" value={lead.clientProfile.companyRegion}
                      active={activeField} onEdit={requestEdit} onCancel={cancelEdit} onSave={makeProfileSave('companyRegion')} />
                  </>
                )}
              </Section>

              <Section title="Vehicles of Interest">
                {lead.vehiclesOfInterest.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No vehicles of interest recorded.</p>
                ) : (
                  <div className="space-y-2">
                    {lead.vehiclesOfInterest.map(v => (
                      <div key={v.id} className="text-sm border border-gray-100 rounded-lg p-3 bg-gray-50">
                        <p className="font-medium">{v.brand} {v.model} {v.year ? `(${v.year})` : ''}</p>
                        <p className="text-gray-500 text-xs">{v.condition} · Interest: {v.interestLevel ?? '—'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>

            <div className="w-full md:w-[40%] shrink-0 flex flex-col overflow-hidden border-t md:border-t-0 md:border-l border-gray-100">
              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
                <h3 className="text-sm font-semibold text-gray-700">Activity</h3>
                <button
                  type="button"
                  className="text-xs font-medium text-blue-600 hover:text-blue-800"
                  onClick={() => setActivityModal({ open: true })}
                >
                  + Add Activity
                </button>
              </div>

              {/* Chronological activity log */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {activitiesLoading ? (
                  <>
                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />)}
                  </>
                ) : sortedActivities.length === 0 ? (
                  <p className="text-sm text-gray-400 italic text-center py-8">No activities yet.</p>
                ) : (
                  sortedActivities.map(a => (
                    <ActivityCard
                      key={a.id}
                      activity={a}
                      onMarkDone={() => markActivity({ activityId: a.id, patch: { completedAt: new Date().toISOString() } })}
                      onClick={() => setActivityModal({ open: true, activityId: a.id })}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        {activityModal.open && (
          <ActivityModal
            leadId={leadId}
            activity={modalActivity}
            onClose={() => setActivityModal({ open: false, activityId: undefined })}
          />
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

type FieldRowProps = {
  label: string
  fieldKey: string
  active: string | null
  onEdit: (key: string) => void
  onCancel: () => void
}

function Field({ label, fieldKey, value, active, onEdit, onCancel, onSave }: FieldRowProps & { value: string; onSave: (v: string) => Promise<void> }) {
  return (
    <div className="rounded-md px-2 py-1 -mx-2 hover:bg-gray-50 transition-colors">
      <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
      <InlineEditField<string>
        label={label}
        value={value}
        isEditing={active === fieldKey}
        onEditRequest={() => onEdit(fieldKey)}
        onCancel={onCancel}
        renderInput={({ value: v, onChange }) => (
          <input value={v} onChange={e => onChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        )}
        onSave={onSave}
      />
    </div>
  )
}

function SelectField({ label, fieldKey, value, options, active, onEdit, onCancel, onSave }: FieldRowProps & { value: string; options: string[]; onSave: (v: string) => Promise<void> }) {
  return (
    <div className="rounded-md px-2 py-1 -mx-2 hover:bg-gray-50 transition-colors">
      <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
      <InlineEditField<string>
        label={label}
        value={value}
        displayValue={OPTION_LABELS[value] ?? value}
        isEditing={active === fieldKey}
        onEditRequest={() => onEdit(fieldKey)}
        onCancel={onCancel}
        renderInput={({ value: v, onChange }) => (
          <select value={v} onChange={e => onChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {options.map(o => <option key={o} value={o}>{OPTION_LABELS[o] ?? o}</option>)}
          </select>
        )}
        onSave={onSave}
      />
    </div>
  )
}

function NumberField({ label, fieldKey, value, active, onEdit, onCancel, onSave }: FieldRowProps & { value: number; onSave: (v: number) => Promise<void> }) {
  return (
    <div className="rounded-md px-2 py-1 -mx-2 hover:bg-gray-50 transition-colors">
      <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
      <InlineEditField<number>
        label={label}
        value={value}
        isEditing={active === fieldKey}
        onEditRequest={() => onEdit(fieldKey)}
        onCancel={onCancel}
        renderInput={({ value: v, onChange }) => (
          <input type="number" value={v} onChange={e => onChange(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        )}
        onSave={onSave}
      />
    </div>
  )
}

function DrawerSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-1">
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="h-5 w-2/3 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  )
}

const TYPE_CONFIG: Record<Activity['type'], { icon: React.ElementType; color: string }> = {
  call: { icon: Phone, color: 'text-blue-500' },
  email: { icon: Mail, color: 'text-purple-500' },
  text: { icon: MessageSquare, color: 'text-green-500' },
  appointment: { icon: Calendar, color: 'text-orange-500' },
  note: { icon: FileText, color: 'text-gray-500' },
  'walk-in': { icon: User, color: 'text-pink-500' },
}

function ActivityIcon({ type, className }: { type: Activity['type']; className?: string }) {
  const { icon: Icon, color } = TYPE_CONFIG[type]
  return <Icon className={`${color} ${className ?? ''}`} />
}

function ActivityCard({
  activity,
  onMarkDone,
  onClick,
}: {
  activity: Activity
  onMarkDone: () => void
  onClick: () => void
}) {
  return (
    <div
      className="border border-gray-200 rounded-lg p-3 bg-white hover:border-blue-200 hover:bg-blue-50/30 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <ActivityIcon type={activity.type} className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{activity.subject}</p>
          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{activity.note}</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
            </p>
            {activity.completedAt ? (
              <span className="flex items-center gap-1 text-xs text-green-600 px-1.5 py-0.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Done
              </span>
            ) : (
              <button
                type="button"
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-600 px-1.5 py-0.5 rounded hover:bg-green-50"
                onClick={e => { e.stopPropagation(); onMarkDone() }}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
