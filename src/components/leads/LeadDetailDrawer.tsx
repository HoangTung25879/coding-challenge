import { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  User,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
} from 'lucide-react';
import { useLead } from '@/hooks/useLead';
import { useActivities } from '@/hooks/useActivities';
import { useUpdateLead } from '@/hooks/useUpdateLead';
import { InlineEditField } from './InlineEditField';
import { formatDistanceToNow, format } from 'date-fns';
import { useUpdateActivity } from '@/hooks/useUpdateActivity';
import { ActivityModal } from './ActivityModal';
import { VehicleEditModal } from './VehicleEditModal';
import { Button } from '@/components/ui/Button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import type { Lead, Activity, VehicleInterest, LeadType } from '@/types';

const OPTION_LABELS: Record<string, string> = {
  // Lead type
  cold: 'Cold',
  warm: 'Warm',
  hot: 'Hot',
  // Status
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  unqualified: 'Unqualified',
  // Source
  website: 'Website',
  referral: 'Referral',
  'walk-in': 'Walk-in',
  phone: 'Phone',
  'social-media': 'Social Media',
  'dealer-event': 'Dealer Event',
  other: 'Other',
  // Sales model
  direct: 'Direct',
  indirect: 'Indirect',
  // Financing
  cash: 'Cash',
  lease: 'Lease',
  loan: 'Loan',
  undecided: 'Undecided',
  // Timeline
  immediate: 'Immediate',
  'within-1-month': 'Within 1 Month',
  'within-3-months': 'Within 3 Months',
  'within-6-months': 'Within 6 Months',
  exploring: 'Exploring',
  // Communication
  call: 'Call',
  text: 'Text',
  email: 'Email',
  'in-person': 'In-person',
};

type Props = {
  leadId: string;
  onClose: () => void;
};

export function LeadDetailDrawer({ leadId, onClose }: Props) {
  const { data: lead, isLoading, isError, error } = useLead(leadId);
  const { data: activitiesData, isLoading: activitiesLoading } = useActivities(leadId);
  const { mutateAsync: updateLead, isPending: isUpdating } = useUpdateLead();

  const [activeField, setActiveField] = useState<string | null>(null);

  const leadRef = useRef(lead);
  useEffect(() => {
    leadRef.current = lead;
  }, [lead]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Reset editing state when the lead changes
  useEffect(() => {
    setActiveField(null);
  }, [leadId]);

  const requestEdit = useCallback(
    (key: string) => {
      if (isUpdating) return;
      setActiveField(key);
    },
    [isUpdating]
  );

  const cancelEdit = useCallback(() => setActiveField(null), []);

  function makeOnSave(fieldKey: keyof Lead) {
    return async (newValue: unknown) => {
      await updateLead({ id: leadId, patch: { [fieldKey]: newValue } as Partial<Lead> });
    };
  }

  const makeAddressSave = useCallback(
    (addressKey: keyof Lead['address']) => {
      return async (newValue: string) => {
        if (!leadRef.current) return;
        await updateLead({
          id: leadId,
          patch: { address: { ...leadRef.current.address, [addressKey]: newValue } },
        });
      };
    },
    [leadId, updateLead]
  );

  const makeProfileSave = useCallback(
    (profileKey: string) => {
      return async (newValue: string | number) => {
        if (!leadRef.current?.clientProfile) return;
        await updateLead({
          id: leadId,
          patch: {
            clientProfile: {
              ...leadRef.current.clientProfile,
              [profileKey]: newValue,
            } as Lead['clientProfile'],
          },
        });
      };
    },
    [leadId, updateLead]
  );

  const activities = activitiesData?.data ?? [];

  const { mutate: markActivity } = useUpdateActivity(leadId);
  const [activitySort, setActivitySort] = useState<'createdAt' | 'startAt'>('createdAt');
  const [activitySortDir, setActivitySortDir] = useState<'desc' | 'asc'>('desc');
  const [activityModal, setActivityModal] = useState<{ open: boolean; activityId?: string }>({
    open: false,
  });
  const [vehicleModal, setVehicleModal] = useState<{
    open: boolean;
    vehicle: VehicleInterest | null;
  }>({ open: false, vehicle: null });
  const [vehicleToDelete, setVehicleToDelete] = useState<VehicleInterest | null>(null);

  async function handleDeleteVehicle() {
    if (!vehicleToDelete || !lead) return;
    const updated = lead.vehiclesOfInterest.filter((v) => v.id !== vehicleToDelete.id);
    await updateLead({ id: leadId, patch: { vehiclesOfInterest: updated } });
    setVehicleToDelete(null);
  }
  const modalActivity = activityModal.activityId
    ? activities.find((a) => a.id === activityModal.activityId)
    : undefined;

  const sortedActivities = [...activities].sort((a, b) => {
    const dir = activitySortDir === 'desc' ? -1 : 1;
    if (activitySort === 'startAt') {
      if (!a.scheduledAt && !b.scheduledAt) return 0;
      if (!a.scheduledAt) return 1;
      if (!b.scheduledAt) return -1;
      return dir * (new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
    }
    return dir * (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full w-full max-w-[860px] flex-col bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {lead ? lead.fullName : 'Lead Details'}
          </h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close drawer">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {isLoading && <DrawerSkeleton />}

        {isError && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-400" />
            <p className="text-gray-600">
              {error instanceof Error ? error.message : 'Lead not found.'}
            </p>
            <Button variant="secondary" size="default" onClick={onClose}>
              Close
            </Button>
          </div>
        )}

        {lead && (
          <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-3 md:border-r md:border-gray-100">
              <Section title="Contact">
                <Field
                  label="Full Name"
                  fieldKey="fullName"
                  value={lead.fullName}
                  active={activeField}
                  onEdit={requestEdit}
                  onCancel={cancelEdit}
                  onSave={makeOnSave('fullName')}
                />
                <Field
                  label="Email"
                  fieldKey="email"
                  value={lead.email}
                  active={activeField}
                  onEdit={requestEdit}
                  onCancel={cancelEdit}
                  onSave={makeOnSave('email')}
                />
                <Field
                  label="Phone"
                  fieldKey="phone"
                  value={lead.phone ?? ''}
                  active={activeField}
                  onEdit={requestEdit}
                  onCancel={cancelEdit}
                  onSave={makeOnSave('phone')}
                />
                <Field
                  label="Best Time to Contact"
                  fieldKey="bestTimeToContact"
                  value={lead.bestTimeToContact ?? ''}
                  active={activeField}
                  onEdit={requestEdit}
                  onCancel={cancelEdit}
                  onSave={makeOnSave('bestTimeToContact')}
                />
              </Section>

              <Section title="Address">
                {(['street', 'city', 'state', 'country', 'postalCode'] as const).map((key) => (
                  <Field
                    key={key}
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    fieldKey={`address.${key}`}
                    value={lead.address[key] ?? ''}
                    active={activeField}
                    onEdit={requestEdit}
                    onCancel={cancelEdit}
                    onSave={makeAddressSave(key)}
                  />
                ))}
              </Section>

              <Section title="Lead Info">
                <SelectField
                  label="Lead Type"
                  fieldKey="leadType"
                  value={lead.leadType}
                  options={['cold', 'warm', 'hot']}
                  active={activeField}
                  onEdit={requestEdit}
                  onCancel={cancelEdit}
                  onSave={makeOnSave('leadType')}
                  renderDisplay={() => <LeadTypeBadge type={lead.leadType} />}
                />
                <SelectField
                  label="Status"
                  fieldKey="status"
                  value={lead.status}
                  options={['new', 'contacted', 'qualified', 'unqualified']}
                  active={activeField}
                  onEdit={requestEdit}
                  onCancel={cancelEdit}
                  onSave={makeOnSave('status')}
                  renderDisplay={() => <StatusBadge status={lead.status} />}
                />
                <SelectField
                  label="Source"
                  fieldKey="source"
                  value={lead.source}
                  options={[
                    'website',
                    'referral',
                    'walk-in',
                    'phone',
                    'social-media',
                    'dealer-event',
                    'other',
                  ]}
                  active={activeField}
                  onEdit={requestEdit}
                  onCancel={cancelEdit}
                  onSave={makeOnSave('source')}
                />
                <SelectField
                  label="Sales Model"
                  fieldKey="salesModel"
                  value={lead.salesModel}
                  options={['direct', 'indirect']}
                  active={activeField}
                  onEdit={requestEdit}
                  onCancel={cancelEdit}
                  onSave={makeOnSave('salesModel')}
                />
                <Field
                  label="Assigned Sales Rep"
                  fieldKey="assignedSalesRepId"
                  value={lead.assignedSalesRepId ?? ''}
                  active={activeField}
                  onEdit={requestEdit}
                  onCancel={cancelEdit}
                  onSave={makeOnSave('assignedSalesRepId')}
                />
              </Section>

              <Section title="Preferences">
                <SelectField
                  label="Financing"
                  fieldKey="financingPreference"
                  value={lead.financingPreference}
                  options={['cash', 'lease', 'loan', 'undecided']}
                  active={activeField}
                  onEdit={requestEdit}
                  onCancel={cancelEdit}
                  onSave={makeOnSave('financingPreference')}
                />
                <SelectField
                  label="Purchase Timeline"
                  fieldKey="purchaseTimeline"
                  value={lead.purchaseTimeline}
                  options={[
                    'immediate',
                    'within-1-month',
                    'within-3-months',
                    'within-6-months',
                    'exploring',
                  ]}
                  active={activeField}
                  onEdit={requestEdit}
                  onCancel={cancelEdit}
                  onSave={makeOnSave('purchaseTimeline')}
                />
                <div className="-mx-2 px-2 py-0.5">
                  <p className="mb-0.5 text-xs font-medium text-gray-500">
                    Preferred Communication
                  </p>
                  <InlineEditField<string[]>
                    label="Preferred Communication"
                    value={lead.preferredCommunication}
                    displayValue={
                      lead.preferredCommunication.map((c) => OPTION_LABELS[c] ?? c).join(', ') ||
                      undefined
                    }
                    isEditing={activeField === 'preferredCommunication'}
                    onEditRequest={() => requestEdit('preferredCommunication')}
                    onCancel={cancelEdit}
                    renderInput={({ value: val, onChange }) => (
                      <div className="flex flex-wrap gap-2">
                        {(['call', 'text', 'email', 'in-person'] as const).map((opt) => (
                          <label
                            key={opt}
                            className="flex cursor-pointer items-center gap-1.5 text-sm"
                          >
                            <Checkbox
                              checked={val.includes(opt)}
                              onCheckedChange={(checked) =>
                                onChange(checked ? [...val, opt] : val.filter((v) => v !== opt))
                              }
                            />
                            {OPTION_LABELS[opt]}
                          </label>
                        ))}
                      </div>
                    )}
                    onSave={makeOnSave('preferredCommunication')}
                  />
                </div>
                <div className="-mx-2 px-2 py-0.5">
                  <p className="mb-0.5 text-xs font-medium text-gray-500">Notes</p>
                  <InlineEditField<string>
                    label="Notes"
                    value={lead.notes ?? ''}
                    isEditing={activeField === 'notes'}
                    onEditRequest={() => requestEdit('notes')}
                    onCancel={cancelEdit}
                    renderInput={({ value: val, onChange }) => (
                      <textarea
                        value={val}
                        onChange={(e) => onChange(e.target.value)}
                        rows={3}
                        className="w-full resize-none rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    )}
                    onSave={makeOnSave('notes')}
                  />
                </div>
              </Section>

              <Section title="Budget">
                <NumberField
                  label="Max Budget"
                  fieldKey="budget.max"
                  value={lead.budget.max}
                  active={activeField}
                  onEdit={requestEdit}
                  onCancel={cancelEdit}
                  onSave={async (v: number) => {
                    await updateLead({ id: leadId, patch: { budget: { ...lead.budget, max: v } } });
                  }}
                />
                <NumberField
                  label="Monthly Payment Target"
                  fieldKey="budget.monthlyPaymentTarget"
                  value={lead.budget.monthlyPaymentTarget}
                  active={activeField}
                  onEdit={requestEdit}
                  onCancel={cancelEdit}
                  onSave={async (v: number) => {
                    await updateLead({
                      id: leadId,
                      patch: { budget: { ...lead.budget, monthlyPaymentTarget: v } },
                    });
                  }}
                />
                <Field
                  label="Currency"
                  fieldKey="budget.currency"
                  value={lead.budget.currency}
                  active={activeField}
                  onEdit={requestEdit}
                  onCancel={cancelEdit}
                  onSave={async (v: string) => {
                    await updateLead({
                      id: leadId,
                      patch: { budget: { ...lead.budget, currency: v } },
                    });
                  }}
                />
              </Section>

              <Section title="Profile">
                {!lead.clientProfile ? (
                  <p className="text-sm text-gray-400 italic">No profile recorded.</p>
                ) : lead.clientProfile.type === 'individual' ? (
                  <Field
                    label="Job Title"
                    fieldKey="profile.jobTitle"
                    value={lead.clientProfile.jobTitle}
                    active={activeField}
                    onEdit={requestEdit}
                    onCancel={cancelEdit}
                    onSave={makeProfileSave('jobTitle')}
                  />
                ) : (
                  <>
                    <Field
                      label="Company Name"
                      fieldKey="profile.companyName"
                      value={lead.clientProfile.companyName}
                      active={activeField}
                      onEdit={requestEdit}
                      onCancel={cancelEdit}
                      onSave={makeProfileSave('companyName')}
                    />
                    <Field
                      label="Industry"
                      fieldKey="profile.industry"
                      value={lead.clientProfile.industry}
                      active={activeField}
                      onEdit={requestEdit}
                      onCancel={cancelEdit}
                      onSave={makeProfileSave('industry')}
                    />
                    <NumberField
                      label="Employees"
                      fieldKey="profile.numberOfEmployees"
                      value={lead.clientProfile.numberOfEmployees}
                      active={activeField}
                      onEdit={requestEdit}
                      onCancel={cancelEdit}
                      onSave={makeProfileSave('numberOfEmployees')}
                    />
                    <NumberField
                      label="Annual Revenue"
                      fieldKey="profile.annualRevenue"
                      value={lead.clientProfile.annualRevenue}
                      active={activeField}
                      onEdit={requestEdit}
                      onCancel={cancelEdit}
                      onSave={makeProfileSave('annualRevenue')}
                    />
                    <Field
                      label="Region"
                      fieldKey="profile.companyRegion"
                      value={lead.clientProfile.companyRegion}
                      active={activeField}
                      onEdit={requestEdit}
                      onCancel={cancelEdit}
                      onSave={makeProfileSave('companyRegion')}
                    />
                  </>
                )}
              </Section>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Vehicles of Interest
                  </h3>
                  <button
                    type="button"
                    className="text-xs font-medium text-blue-600 hover:text-blue-800"
                    onClick={() => setVehicleModal({ open: true, vehicle: null })}
                  >
                    + Add Vehicle
                  </button>
                </div>
                {lead.vehiclesOfInterest.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No vehicles of interest recorded.</p>
                ) : (
                  <div className="space-y-2">
                    {lead.vehiclesOfInterest.map((v) => (
                      <div
                        key={v.id}
                        className="overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
                      >
                        {v.imageUrl && (
                          <div className="h-28 w-full overflow-hidden bg-gray-200">
                            <img
                              src={v.imageUrl}
                              alt={v.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="flex items-start justify-between p-3">
                          <div className="text-sm">
                            <p className="font-medium">
                              {v.brand} {v.model} {v.year ? `(${v.year})` : ''}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500 capitalize">
                              {v.condition} · Interest: {v.interestLevel ?? '—'}/5
                            </p>
                            {v.color && <p className="text-xs text-gray-400">{v.color}</p>}
                          </div>
                          <div className="ml-2 flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              aria-label={`Edit ${v.name}`}
                              onClick={() => setVehicleModal({ open: true, vehicle: v })}
                              className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              aria-label={`Delete ${v.name}`}
                              onClick={() => setVehicleToDelete(v)}
                              className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex w-full shrink-0 flex-col overflow-hidden border-t border-gray-100 md:w-[40%] md:border-t-0 md:border-l">
              {/* Panel header */}
              <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-700">Activity</h3>
                <div className="flex items-center gap-2">
                  <Select
                    value={activitySort}
                    onValueChange={(v) => {
                      if (v) setActivitySort(v as 'createdAt' | 'startAt');
                    }}
                  >
                    <SelectTrigger size="sm" className="h-7 gap-1 text-xs">
                      <SelectValue>
                        {activitySort === 'createdAt' ? 'Created' : 'Start date'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Created</SelectItem>
                      <SelectItem value="startAt">Start date</SelectItem>
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    aria-label={activitySortDir === 'desc' ? 'Sort descending' : 'Sort ascending'}
                    onClick={() => setActivitySortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
                  >
                    {activitySortDir === 'desc' ? (
                      <ArrowDown className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowUp className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <Button
                    variant="default"
                    size="default"
                    onClick={() => setActivityModal({ open: true })}
                    aria-label="Create Lead"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Chronological activity log */}
              <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
                {activitiesLoading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
                    ))}
                  </>
                ) : sortedActivities.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-400 italic">
                    No activities yet.
                  </p>
                ) : (
                  sortedActivities.map((a) => (
                    <ActivityCard
                      key={a.id}
                      activity={a}
                      onMarkDone={() =>
                        markActivity({
                          activityId: a.id,
                          patch: { completedAt: new Date().toISOString() },
                        })
                      }
                      onClick={
                        a.completedAt
                          ? undefined
                          : () => setActivityModal({ open: true, activityId: a.id })
                      }
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
        {vehicleModal.open && (
          <VehicleEditModal
            leadId={leadId}
            currentVehicles={lead?.vehiclesOfInterest ?? []}
            vehicle={vehicleModal.vehicle}
            onClose={() => setVehicleModal({ open: false, vehicle: null })}
          />
        )}
        <AlertDialog
          open={vehicleToDelete !== null}
          onOpenChange={(open) => {
            if (!open) setVehicleToDelete(null);
          }}
        >
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Vehicle?</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogBody>
              <AlertDialogDescription>
                Remove <span className="font-medium text-gray-900">{vehicleToDelete?.name}</span>{' '}
                from vehicles of interest? This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogBody>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                size="default"
                onClick={handleDeleteVehicle}
                disabled={isUpdating}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold tracking-wider text-gray-600 uppercase">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

type FieldRowProps = {
  label: string;
  fieldKey: string;
  active: string | null;
  onEdit: (key: string) => void;
  onCancel: () => void;
};

function Field({
  label,
  fieldKey,
  value,
  active,
  onEdit,
  onCancel,
  onSave,
}: FieldRowProps & { value: string; onSave: (v: string) => Promise<void> }) {
  return (
    <div className="-mx-2 px-2 py-0.5">
      <p className="mb-0.5 text-xs font-medium text-gray-500">{label}</p>
      <InlineEditField<string>
        label={label}
        value={value}
        isEditing={active === fieldKey}
        onEditRequest={() => onEdit(fieldKey)}
        onCancel={onCancel}
        renderInput={({ value: v, onChange }) => (
          <input
            value={v}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        )}
        onSave={onSave}
      />
    </div>
  );
}

function SelectField({
  label,
  fieldKey,
  value,
  options,
  active,
  onEdit,
  onCancel,
  onSave,
  renderDisplay,
}: FieldRowProps & {
  value: string;
  options: string[];
  onSave: (v: string) => Promise<void>;
  renderDisplay?: () => React.ReactNode;
}) {
  return (
    <div className="-mx-2 px-2 py-0.5">
      <p className="mb-0.5 text-xs font-medium text-gray-500">{label}</p>
      <InlineEditField<string>
        label={label}
        value={value}
        displayValue={OPTION_LABELS[value] ?? value}
        renderDisplay={renderDisplay}
        isEditing={active === fieldKey}
        onEditRequest={() => onEdit(fieldKey)}
        onCancel={onCancel}
        renderInput={({ value: v, onChange }) => (
          <Select
            value={v}
            onValueChange={(val) => {
              if (val !== null) onChange(val);
            }}
          >
            <SelectTrigger className="w-full text-sm">
              <SelectValue>{OPTION_LABELS[v] ?? v}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o} value={o}>
                  {OPTION_LABELS[o] ?? o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        onSave={onSave}
      />
    </div>
  );
}

function NumberField({
  label,
  fieldKey,
  value,
  active,
  onEdit,
  onCancel,
  onSave,
}: FieldRowProps & { value: number; onSave: (v: number) => Promise<void> }) {
  return (
    <div className="-mx-2 px-2 py-0.5">
      <p className="mb-0.5 text-xs font-medium text-gray-500">{label}</p>
      <InlineEditField<number>
        label={label}
        value={value}
        isEditing={active === fieldKey}
        onEditRequest={() => onEdit(fieldKey)}
        onCancel={onCancel}
        renderInput={({ value: v, onChange }) => (
          <input
            type="number"
            value={v}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        )}
        onSave={onSave}
      />
    </div>
  );
}

const LEAD_TYPE_CONFIG: Record<LeadType, { label: string; variant: 'blue' | 'yellow' | 'red' }> = {
  cold: { label: 'Cold', variant: 'blue' },
  warm: { label: 'Warm', variant: 'yellow' },
  hot: { label: 'Hot', variant: 'red' },
};

function LeadTypeBadge({ type }: { type: LeadType }) {
  const { label, variant } = LEAD_TYPE_CONFIG[type];
  return <Badge variant={variant}>{label}</Badge>;
}

function DrawerSkeleton() {
  return (
    <div className="flex-1 animate-pulse space-y-4 overflow-y-auto px-6 py-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-1">
          <div className="h-3 w-20 rounded bg-gray-200" />
          <div className="h-5 w-2/3 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

const TYPE_CONFIG: Record<Activity['type'], { icon: React.ElementType; color: string }> = {
  call: { icon: Phone, color: 'text-blue-500' },
  email: { icon: Mail, color: 'text-purple-500' },
  text: { icon: MessageSquare, color: 'text-green-500' },
  appointment: { icon: Calendar, color: 'text-orange-500' },
  note: { icon: FileText, color: 'text-gray-500' },
  'walk-in': { icon: User, color: 'text-pink-500' },
};

function ActivityIcon({ type, className }: { type: Activity['type']; className?: string }) {
  const { icon: Icon, color } = TYPE_CONFIG[type];
  return <Icon className={`${color} ${className ?? ''}`} />;
}

function formatScheduled(scheduledAt?: string | null): string | null {
  if (!scheduledAt) return null;
  return format(new Date(scheduledAt), 'MMM d, yyyy, h:mm a');
}

function ActivityCard({
  activity,
  onMarkDone,
  onClick,
}: {
  activity: Activity;
  onMarkDone: () => void;
  onClick?: () => void;
}) {
  const isCompleted = !!activity.completedAt;
  const dateLabel = formatScheduled(activity.scheduledAt);

  return (
    <div
      className={`rounded-lg border bg-white p-3 transition-colors ${
        isCompleted
          ? 'cursor-default border-gray-100 opacity-75'
          : 'cursor-pointer border-gray-200 hover:border-blue-200 hover:bg-blue-50/30'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <ActivityIcon type={activity.type} className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-800">{activity.subject}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{activity.note}</p>
          {dateLabel && <p className="mt-1 text-xs text-blue-600">{dateLabel}</p>}
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
            </p>
            {isCompleted ? (
              <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Done
              </span>
            ) : (
              <button
                type="button"
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-gray-500 hover:bg-green-50 hover:text-green-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkDone();
                }}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark as done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
