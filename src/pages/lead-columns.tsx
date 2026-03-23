import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import type { Lead, LeadType } from '@/types'
import { StatusCell } from '@/components/data-table/column-renderers/StatusCell'
import { BudgetCell } from '@/components/data-table/column-renderers/BudgetCell'
import { VehicleCell } from '@/components/data-table/column-renderers/VehicleCell'
import { DateCell } from '@/components/data-table/column-renderers/DateCell'

const col = createColumnHelper<Lead>()

const LEAD_TYPE_DISPLAY: Record<LeadType, { emoji: string; label: string }> = {
  cold: { emoji: '🧊', label: 'Cold' },
  warm: { emoji: '🌤', label: 'Warm' },
  hot: { emoji: '🔥', label: 'Hot' },
}

const SOURCE_LABELS: Record<string, string> = {
  website: 'Website',
  referral: 'Referral',
  'walk-in': 'Walk-in',
  phone: 'Phone',
  'social-media': 'Social Media',
  'dealer-event': 'Dealer Event',
  other: 'Other',
}

const TIMELINE_LABELS: Record<string, string> = {
  immediate: 'Immediate',
  'within-1-month': 'Within 1 Month',
  'within-3-months': 'Within 3 Months',
  'within-6-months': 'Within 6 Months',
  exploring: 'Exploring',
}

const FINANCING_LABELS: Record<string, string> = {
  cash: 'Cash',
  lease: 'Lease',
  loan: 'Loan',
  undecided: 'Undecided',
}

// --- Default visible columns (10) ---

const nameColumn = col.accessor('fullName', {
  header: 'Name',
  cell: (info) => (
    <a
      href={`/leads/${info.row.original.id}`}
      className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
    >
      {info.getValue()}
    </a>
  ),
  size: 180,
  enableSorting: true,
  enableResizing: true,
})

const statusColumn = col.accessor('status', {
  header: 'Status',
  cell: (info) => <StatusCell status={info.getValue()} />,
  size: 120,
  enableSorting: true,
  enableResizing: true,
})

const typeColumn = col.accessor('leadType', {
  header: 'Type',
  cell: (info) => {
    const { emoji, label } = LEAD_TYPE_DISPLAY[info.getValue()]
    return <span>{emoji} {label}</span>
  },
  size: 140,
  enableSorting: true,
  enableResizing: true,
})

const emailColumn = col.accessor('email', {
  header: 'Email',
  cell: (info) => (
    <a href={`mailto:${info.getValue()}`} className="text-blue-600 hover:underline truncate">
      {info.getValue()}
    </a>
  ),
  size: 200,
  enableSorting: true,
  enableResizing: true,
})

const phoneColumn = col.accessor('phone', {
  header: 'Phone',
  cell: (info) => (
    <a href={`tel:${info.getValue()}`} className="text-blue-600 hover:underline whitespace-nowrap">
      {info.getValue()}
    </a>
  ),
  size: 150,
  enableSorting: true,
  enableResizing: true,
})

const vehicleColumn = col.display({
  id: 'vehicle',
  header: 'Vehicle',
  cell: (info) => {
    const vehicles = info.row.original.vehiclesOfInterest
    if (!vehicles.length) return <span className="text-gray-400">—</span>
    const v = vehicles[0]
    return <VehicleCell name={`${v.year} ${v.brand} ${v.model}`} imageUrl={v.imageUrl} />
  },
  size: 220,
  enableResizing: true,
})

const budgetColumn = col.accessor('budget', {
  id: 'budget.max',
  header: 'Budget',
  cell: (info) => {
    const budget = info.getValue()
    return <BudgetCell max={budget.max} currency={budget.currency} />
  },
  size: 130,
  enableSorting: true,
  enableResizing: true,
})

const sourceColumn = col.accessor('source', {
  header: 'Source',
  cell: (info) => SOURCE_LABELS[info.getValue()] ?? info.getValue(),
  size: 130,
  enableSorting: true,
  enableResizing: true,
})

const timelineColumn = col.accessor('purchaseTimeline', {
  header: 'Timeline',
  cell: (info) => TIMELINE_LABELS[info.getValue()] ?? info.getValue(),
  size: 150,
  enableSorting: true,
  enableResizing: true,
})

const createdColumn = col.accessor('createdAt', {
  header: 'Created',
  cell: (info) => <DateCell date={info.getValue()} />,
  size: 140,
  enableSorting: true,
  enableResizing: true,
})

// --- Hidden by default columns (7) ---

const financingColumn = col.accessor('financingPreference', {
  header: 'Financing',
  cell: (info) => FINANCING_LABELS[info.getValue()] ?? info.getValue(),
  size: 120,
  enableSorting: true,
  enableResizing: true,
})

const salesModelColumn = col.accessor('salesModel', {
  header: 'Sales Model',
  cell: (info) => info.getValue() === 'direct' ? 'Direct' : 'Indirect',
  size: 120,
  enableSorting: true,
  enableResizing: true,
})

const clientTypeColumn = col.display({
  id: 'clientProfile.type',
  header: 'Client Type',
  cell: (info) => {
    const type = info.row.original.clientProfile.type
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        type === 'individual'
          ? 'bg-sky-100 text-sky-800'
          : 'bg-amber-100 text-amber-800'
      }`}>
        {type === 'individual' ? 'Individual' : 'Organization'}
      </span>
    )
  },
  size: 130,
  enableResizing: true,
})

const cityColumn = col.accessor((row) => row.address.city, {
  id: 'address.city',
  header: 'City',
  size: 130,
  enableSorting: true,
  enableResizing: true,
})

const countryColumn = col.accessor((row) => row.address.country, {
  id: 'address.country',
  header: 'Country',
  size: 120,
  enableSorting: true,
  enableResizing: true,
})

const updatedColumn = col.accessor('updatedAt', {
  header: 'Updated',
  cell: (info) => <DateCell date={info.getValue()} />,
  size: 140,
  enableSorting: true,
  enableResizing: true,
})

const assignedRepColumn = col.accessor('assignedSalesRepId', {
  header: 'Assigned Rep',
  size: 140,
  enableSorting: true,
  enableResizing: true,
})

// --- Exports ---

export const defaultVisibleColumns = [
  nameColumn,
  statusColumn,
  typeColumn,
  emailColumn,
  phoneColumn,
  vehicleColumn,
  budgetColumn,
  sourceColumn,
  timelineColumn,
  createdColumn,
]

export const hiddenByDefaultColumns = [
  financingColumn,
  salesModelColumn,
  clientTypeColumn,
  cityColumn,
  countryColumn,
  updatedColumn,
  assignedRepColumn,
]

export const allColumns: ColumnDef<Lead, unknown>[] = [...defaultVisibleColumns, ...hiddenByDefaultColumns] as ColumnDef<Lead, unknown>[]

export const defaultColumnVisibility: Record<string, boolean> = {
  financingPreference: false,
  salesModel: false,
  'clientProfile.type': false,
  'address.city': false,
  'address.country': false,
  updatedAt: false,
  assignedSalesRepId: false,
}
