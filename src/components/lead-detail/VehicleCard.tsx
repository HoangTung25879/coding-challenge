// src/components/lead-detail/VehicleCard.tsx
import type { VehicleInterest } from '@/types'

const INTEREST_STARS = (level: number) => '★'.repeat(level) + '☆'.repeat(5 - level)

type Props = { vehicle: VehicleInterest }

export function VehicleCard({ vehicle }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {vehicle.imageUrl && (
        <div className="h-48 overflow-hidden bg-gray-100">
          <img
            src={vehicle.imageUrl}
            alt={vehicle.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900">{vehicle.name}</h3>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize flex-shrink-0">
            {vehicle.condition.replace(/-/g, ' ')}
          </span>
        </div>

        <p className="text-sm text-amber-500 tracking-wider">{INTEREST_STARS(vehicle.interestLevel)}</p>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <Spec label="Year" value={String(vehicle.year)} />
          <Spec label="Color" value={vehicle.color} />
          <Spec label="Fuel" value={vehicle.fuelType} />
          <Spec label="Transmission" value={vehicle.transmission.toUpperCase()} />
          {vehicle.odometer !== undefined && (
            <Spec label="Odometer" value={`${vehicle.odometer.toLocaleString()} ${vehicle.odometerUnit}`} />
          )}
          {vehicle.vin && <Spec label="VIN" value={vehicle.vin} />}
        </div>

        {vehicle.notes && (
          <p className="text-sm text-gray-500 pt-2 border-t border-gray-100">{vehicle.notes}</p>
        )}
      </div>
    </div>
  )
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-gray-800 font-medium capitalize">{value}</p>
    </div>
  )
}
