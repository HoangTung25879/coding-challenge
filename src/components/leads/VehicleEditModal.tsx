import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, ArrowLeft, Car, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Input } from '@/components/ui/Input';
import { useUpdateLead } from '@/hooks/useUpdateLead';
import { vehicleCatalog } from '@/mocks/data/vehicles';
import type { VehicleInterest } from '@/types';

const detailSchema = z.object({
  condition: z.enum(['new', 'used', 'certified-pre-owned']),
  color: z.string().min(1, 'Color is required'),
  fuelType: z.enum(['petrol', 'diesel', 'electric', 'hybrid']),
  transmission: z.enum(['manual', 'automatic', 'cvt']),
  interestLevel: z.coerce.number().min(1).max(5) as z.ZodType<1 | 2 | 3 | 4 | 5>,
  vin: z.string().optional(),
  odometer: z.coerce.number().nonnegative().optional(),
  odometerUnit: z.enum(['km', 'miles']),
  notes: z.string(),
});

type DetailForm = z.infer<typeof detailSchema>;
type CatalogItem = (typeof vehicleCatalog)[number];

const CONDITION_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
  { value: 'certified-pre-owned', label: 'Certified Pre-Owned' },
] as const;

const FUEL_TYPE_OPTIONS = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
] as const;

const TRANSMISSION_OPTIONS = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual', label: 'Manual' },
  { value: 'cvt', label: 'CVT' },
] as const;

const INTEREST_LEVEL_OPTIONS = [
  { value: '1', label: '1 — Curious' },
  { value: '2', label: '2 — Interested' },
  { value: '3', label: '3 — Considering' },
  { value: '4', label: '4 — Very Interested' },
  { value: '5', label: '5 — Ready to Buy' },
] as const;

const ODOMETER_UNIT_OPTIONS = [
  { value: 'km', label: 'km' },
  { value: 'miles', label: 'miles' },
] as const;

type Props = {
  leadId: string;
  currentVehicles: VehicleInterest[];
  vehicle: VehicleInterest | null;
  onClose: () => void;
};

export function VehicleEditModal({ leadId, currentVehicles, vehicle, onClose }: Props) {
  const isEdit = vehicle !== null;
  const { mutateAsync: updateLead, isPending } = useUpdateLead();

  const [step, setStep] = useState<'pick' | 'details'>(isEdit ? 'details' : 'pick');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CatalogItem | null>(() => {
    if (!vehicle) return null;
    return (
      vehicleCatalog.find((c) => c.id === vehicle.id) ??
      vehicleCatalog.find((c) => c.brand === vehicle.brand && c.model === vehicle.model) ??
      null
    );
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<DetailForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(detailSchema) as any,
    defaultValues: vehicle
      ? {
          condition: vehicle.condition,
          color: vehicle.color,
          fuelType: vehicle.fuelType,
          transmission: vehicle.transmission,
          interestLevel: vehicle.interestLevel,
          vin: vehicle.vin ?? '',
          odometer: vehicle.odometer,
          odometerUnit: vehicle.odometerUnit,
          notes: vehicle.notes,
        }
      : {
          condition: 'new',
          color: '',
          fuelType: 'petrol',
          transmission: 'automatic',
          interestLevel: 3,
          vin: '',
          odometer: undefined,
          odometerUnit: 'km',
          notes: '',
        },
  });

  function pickCar(item: CatalogItem) {
    setSelected(item);
    setValue('condition', item.condition);
    setValue('color', item.color);
    setValue('fuelType', item.fuelType);
    setValue('transmission', item.transmission);
    setValue('odometerUnit', item.odometerUnit);
    setStep('details');
  }

  async function onSubmit(data: DetailForm) {
    const baseId = isEdit ? vehicle.id : `v-${Date.now()}`;
    const brand = selected?.brand ?? vehicle?.brand ?? '';
    const model = selected?.model ?? vehicle?.model ?? '';
    const year = selected?.year ?? vehicle?.year ?? new Date().getFullYear();
    const imageUrl = selected?.imageUrl ?? vehicle?.imageUrl ?? '';

    const updated: VehicleInterest = {
      id: baseId,
      name: `${year} ${brand} ${model}`,
      brand,
      model,
      year,
      imageUrl,
      condition: data.condition,
      color: data.color,
      fuelType: data.fuelType,
      transmission: data.transmission,
      interestLevel: data.interestLevel,
      vin: data.vin || undefined,
      odometer: data.odometer,
      odometerUnit: data.odometerUnit,
      notes: data.notes,
    };

    const updatedVehicles = isEdit
      ? currentVehicles.map((v) => (v.id === vehicle.id ? updated : v))
      : [...currentVehicles, updated];

    await updateLead({ id: leadId, patch: { vehiclesOfInterest: updatedVehicles } });
    onClose();
  }

  const filtered = vehicleCatalog.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.brand.toLowerCase().includes(q) ||
      c.model.toLowerCase().includes(q)
    );
  });

  const activeImage = selected?.imageUrl ?? vehicle?.imageUrl;

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open && !isPending) onClose();
      }}
    >
      {/* Fixed height so flex-1 children can fill and scroll */}
      <DialogContent className="flex h-[85vh] flex-col gap-0 p-0 sm:max-w-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center gap-2 border-b border-gray-200 px-6 py-4">
          {step === 'details' && (
            <button
              type="button"
              onClick={() => setStep('pick')}
              className="rounded p-1 text-gray-500 hover:bg-gray-100"
              aria-label="Back to car selection"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <DialogTitle className="flex-1">
            {step === 'pick'
              ? 'Select a Vehicle'
              : isEdit
                ? 'Edit Vehicle of Interest'
                : 'Add Vehicle of Interest'}
          </DialogTitle>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step 1: Car picker */}
        {step === 'pick' && (
          <div className="flex min-h-0 flex-1 flex-col px-6 py-4">
            {/* Search */}
            <div className="mb-4 shrink-0">
              <Input
                type="text"
                placeholder="Search by brand or model..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>

            {/* Scrollable grid */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 gap-3 pb-2 sm:grid-cols-2">
                {filtered.map((car) => (
                  <button
                    key={car.id}
                    type="button"
                    onClick={() => pickCar(car)}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-blue-400 hover:bg-blue-50"
                  >
                    <div className="h-14 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
                      <img
                        src={car.imageUrl}
                        alt={car.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{car.name}</p>
                      <span className="mt-0.5 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 capitalize">
                        {car.condition}
                      </span>
                    </div>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="col-span-2 flex flex-col items-center gap-2 py-12 text-gray-400">
                    <Car className="h-8 w-8" />
                    <p className="text-sm">No vehicles match your search.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Detail form */}
        {step === 'details' && (
          <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
            {/* Scrollable body */}
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
              {/* Car image banner */}
              {activeImage && (
                <div className="relative h-32 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  <img src={activeImage} alt="Vehicle" className="h-full w-full object-cover" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <p className="absolute bottom-2 left-3 text-sm font-semibold text-white">
                    {selected?.name ?? vehicle?.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep('pick')}
                    className="absolute top-2 right-2 rounded bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-white"
                  >
                    Change Car
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Condition */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Condition</label>
                  <Controller
                    name="condition"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isPending}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {CONDITION_OPTIONS.find((o) => o.value === field.value)?.label}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {CONDITION_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Interest Level */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Interest Level
                  </label>
                  <Controller
                    name="interestLevel"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={String(field.value)}
                        onValueChange={(v) => field.onChange(Number(v))}
                        disabled={isPending}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {INTEREST_LEVEL_OPTIONS.find((o) => o.value === String(field.value))?.label}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {INTEREST_LEVEL_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.interestLevel && (
                    <p className="mt-1 text-xs text-red-600">{errors.interestLevel.message}</p>
                  )}
                </div>

                {/* Color */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Color</label>
                  <Input
                    {...register('color')}
                    disabled={isPending}
                    placeholder="e.g. Midnight Black"
                  />
                  {errors.color && (
                    <p className="mt-1 text-xs text-red-600">{errors.color.message}</p>
                  )}
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Fuel Type</label>
                  <Controller
                    name="fuelType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isPending}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {FUEL_TYPE_OPTIONS.find((o) => o.value === field.value)?.label}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {FUEL_TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Transmission */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Transmission
                  </label>
                  <Controller
                    name="transmission"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isPending}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {TRANSMISSION_OPTIONS.find((o) => o.value === field.value)?.label}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {TRANSMISSION_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Odometer */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Odometer</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      {...register('odometer')}
                      disabled={isPending}
                      placeholder="0"
                      min={0}
                      className="min-w-0 flex-1"
                    />
                    <Controller
                      name="odometerUnit"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isPending}
                        >
                          <SelectTrigger className="w-24 shrink-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ODOMETER_UNIT_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                {/* VIN */}
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    VIN <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <Input
                    {...register('vin')}
                    disabled={isPending}
                    placeholder="e.g. 1HGBH41JXMN109186"
                    className="font-mono"
                  />
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    {...register('notes')}
                    disabled={isPending}
                    rows={2}
                    placeholder="Any specific requirements or notes..."
                    className="w-full resize-none rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <DialogFooter className="shrink-0">
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" variant="default" size="default" disabled={isPending}>
                {isEdit ? 'Save Changes' : 'Add Vehicle'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
