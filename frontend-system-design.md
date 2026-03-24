# LeadFlow — Frontend System Design Document

**Project:** Sales Lead Management Tool (Scenario C — Keyloop Coding Challenge)
**Date:** 2026-03-24
**Author:** Engineering (with GenAI assistance — see §11)

---

**Tech stacks**: React 19, Vite, Tailwind, ShadcnUI, Tanstack Table, Tanstack Virtual, Tanstack Query, Zod + ReactHookForm, pino, Vitest + React Testing Library

---

## 1. Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                             Browser (SPA)                                │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐   │
│  │                          LeadsPage                                │   │
│  │            (single route — all lead management lives here)        │   │
│  └──────────────────┬────────────────────────┬────────────────────────┘  │
│                     │                        │                           │
│   ┌─────────────────▼──────────┐  ┌──────────▼──────────────────────┐   │
│   │      DataTable Layer       │  │       Lead Detail Drawer         │   │
│   │                            │  │                                  │   │
│   │  TableToolbar              │  │  Lead fields (inline-edit)       │   │
│   │   ├─ GlobalSearch          │  │  VehiclesOfInterest panel        │   │
│   │   ├─ FilterMenu            │  │  ActivityFeed (chrono log)       │   │
│   │   ├─ ActiveFilterChips     │  │  ActivityModal (log new entry)   │   │
│   │   ├─ ColumnVisibilityToggle│  │                                  │   │
│   │   └─ SavedView button      │  └──────────────────────────────────┘   │
│   │  VirtualizedTableBody      │                                         │
│   │  PaginationControls        │                                         │
│   └─────────────────┬──────────┘                                         │
│                     │                                                     │
│   ┌─────────────────▼──────────────────────────────────────────────────┐ │
│   │                      Custom Hooks Layer                            │ │
│   │                                                                    │ │
│   │  useDataTable  ──► filter / sort / pagination / column state       │ │
│   │  useSavedView  ──► localStorage  (TableStateSnapshot)              │ │
│   │  useLeads      ──► React Query  GET  /api/leads                    │ │
│   │  useLead       ──► React Query  GET  /api/leads/:id                │ │
│   │  useActivities ──► React Query  GET  /api/leads/:id/activities     │ │
│   │  useLogActivity──► React Query  POST /api/leads/:id/activities     │ │
│   │  useUpdateLead ──► React Query  PATCH /api/leads/:id               │ │
│   │  useCreateLead ──► React Query  POST /api/leads                    │ │
│   │  useDeleteLead ──► React Query  DELETE /api/leads/:id              │ │
│   └─────────────────┬──────────────────────────────────────────────────┘ │
│                     │                                                     │
│   ┌─────────────────▼──────────────────────────────────────────────────┐ │
│   │               src/lib/api.ts — typed fetch wrapper                 │ │
│   └─────────────────┬──────────────────────────────────────────────────┘ │
│                     │                                                     │
│   ┌─────────────────▼──────────────────────────────────────────────────┐ │
│   │          MSW Service Worker (browser) / Node server (tests)        │ │
│   │  Intercepts */api/* · validates with Zod · mutates in-memory store │ │
│   │  leadsStore[]  ·  activitiesStore[]  ·  100 ms artificial latency   │ │
│   └────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

> **No real backend.** MSW acts as the persistence layer in this prototype. Replacing it with a real REST API requires no changes to any hook or component — only `src/lib/api.ts` would point at a different origin.

---

## 2. Component Roles

### Pages

| Component   | Role                                                                                                                 |
| ----------- | -------------------------------------------------------------------------------------------------------------------- |
| `LeadsPage` | Root container. Owns `selectedLeadId` state that bridges the table and the detail drawer. Composes all major panels. |

### Data-Table layer (`src/components/data-table/`)

| Component                | Role                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| `TableToolbar`           | Top bar housing search, filter, column toggle, and saved-view controls.                              |
| `GlobalSearch`           | Debounced text input; writes `search` into `useDataTable` filter state.                              |
| `FilterMenu`             | Popover with faceted filters: status, lead type, source, budget range, timeline, financing flag.     |
| `ActiveFilterChips`      | Removable chips for every active filter — visual confirmation and quick reset.                       |
| `ColumnVisibilityToggle` | Dropdown to show/hide TanStack Table columns; excluded from saved-view serialisation.                |
| `VirtualizedTableBody`   | Renders only visible rows via `@tanstack/react-virtual`; handles large lead lists without DOM bloat. |
| `TableHeader`            | Sortable column headers; delegates sort state to `useDataTable`.                                     |
| `PaginationControls`     | Page navigation; reads and writes pagination state from `useDataTable`.                              |
| `BudgetRangeSlider`      | shadcn Slider wrapper for budget min/max filter.                                                     |

### Lead Domain layer (`src/components/leads/`)

| Component            | Role                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------- |
| `LeadDetailDrawer`   | Slide-in panel showing the full `Lead` record plus the activity feed.                     |
| `InlineEditField`    | Click-to-edit primitive; patches the field on blur/confirm via `useUpdateLead`.           |
| `VehicleEditModal`   | Modal for adding/editing vehicles of interest on a lead.                                  |
| `ActivityFeed`       | Sorted list of `Activity` records with type icon and timestamp.                           |
| `ActivityModal`      | Form modal to log a new follow-up activity (type, subject, note, optional `scheduledAt`). |
| `ActivityForm`       | Controlled form inside `ActivityModal`; validated with Zod before submission.             |
| `CreateLeadModal`    | Modal form to create a new lead; uses `useCreateLead`.                                    |
| `DeleteConfirmModal` | Alert dialog confirming destructive lead deletion.                                        |

### UI Primitives (`src/components/ui/`)

All are shadcn/ui components or thin wrappers around Radix primitives: `Button`, `Input`, `Badge`, `StatusBadge`, `Dropdown`, `DateTimePicker`, `Skeleton`, `Tooltip`, `Dialog`, `AlertDialog`, `Select`, `Checkbox`, `Popover`, `Slider`, `Calendar`, `Textarea`.

---

## 3. Data Models

All types live in `src/types/index.ts` — the single source of truth shared by the UI, hooks, and MSW handlers.

### 3a. Lead

The full `Lead` record is only fetched when a salesperson opens the detail drawer. The inbox uses the lighter `LeadSummary` projection to keep list responses fast.

```typescript
type LeadSource =
  | 'website'
  | 'referral'
  | 'walk-in'
  | 'phone'
  | 'social-media'
  | 'dealer-event'
  | 'other';
type LeadType = 'cold' | 'warm' | 'hot';
type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified';
type PurchaseTimeline =
  | 'immediate'
  | 'within-1-month'
  | 'within-3-months'
  | 'within-6-months'
  | 'exploring';

type Address = {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
};

type IndividualContact = {
  type: 'individual';
  jobTitle: string;
};

type OrganizationContact = {
  type: 'organization';
  companyName: string;
  industry: string;
  numberOfEmployees: number;
  annualRevenue: number;
  currency: string;
  companyRegion: string;
};

type Lead = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  bestTimeToContact: string;
  address: Address;
  leadType: LeadType;
  status: LeadStatus;
  source: LeadSource;
  salesModel: 'direct' | 'indirect';
  preferredCommunication: ('call' | 'text' | 'email' | 'in-person')[];
  clientProfile: IndividualContact | OrganizationContact | null;
  vehiclesOfInterest: VehicleInterest[]; // see §3c
  budget: {
    max: number;
    monthlyPaymentTarget: number;
    currency: string;
  };
  financingPreference: 'cash' | 'lease' | 'loan' | 'undecided';
  purchaseTimeline: PurchaseTimeline;
  notes: string;
  assignedSalesRepId: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
};

// Inbox projection — returned by GET /api/leads
type LeadSummary = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  source: LeadSource;
  primaryVehicleInterest: string; // name of first vehicle of interest
  leadType: LeadType;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
};
```

### 3b. Activity

Activities form the chronological follow-up log for a lead. `completedAt: null` means the activity is pending; an ISO string means it has been marked done.

```typescript
type ActivityType = 'call' | 'email' | 'text' | 'appointment' | 'note' | 'walk-in';

type Activity = {
  id: string;
  leadId: string; // FK → Lead.id
  type: ActivityType;
  subject: string;
  note: string;
  scheduledAt?: string | null; // optional future date/time, ISO 8601
  createdAt: string; // ISO 8601
  createdBy: string; // sales rep identifier
  completedAt: string | null; // null = pending · ISO string = completed
};
```

### 3c. VehicleInterest

Embedded inside `Lead.vehiclesOfInterest[]`. Each entry represents one vehicle a lead has expressed interest in.

```typescript
type VehicleInterest = {
  id: string;
  name: string;
  brand: string;
  model: string;
  vin?: string;
  condition: 'new' | 'used' | 'certified-pre-owned';
  year: number;
  odometer?: number;
  odometerUnit: 'km' | 'miles';
  color: string;
  imageUrl: string;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'manual' | 'automatic' | 'cvt';
  interestLevel: 1 | 2 | 3 | 4 | 5; // 1 = low, 5 = high
  notes: string;
};
```

---

## 4. API Contract

All requests go through `src/lib/api.ts`. MSW intercepts `*/api/*` in both browser and test environments. Every mutating handler adds a 100 ms artificial delay to simulate network latency.

### 4a. Leads

#### `GET /api/leads`

Returns a paginated, filtered, sorted list of `Lead` records.

**Query parameters**

| Parameter   | Type     | Default     | Description                                              |
| ----------- | -------- | ----------- | -------------------------------------------------------- |
| `page`      | `number` | `1`         | 1-based page index                                       |
| `limit`     | `number` | `10`        | Page size                                                |
| `search`    | `string` | —           | Full-text match on `fullName`, `email`, `phone`, `notes` |
| `source`    | `string` | —           | Exact match on `LeadSource` enum                         |
| `budgetMin` | `number` | —           | Filters `lead.budget.max >= budgetMin`                   |
| `budgetMax` | `number` | —           | Filters `lead.budget.max <= budgetMax`                   |
| `currency`  | `string` | —           | Exact match on `lead.budget.currency`                    |
| `timeline`  | `string` | —           | Exact match on `PurchaseTimeline` enum                   |
| `financing` | `string` | —           | Exact match on `financingPreference`                     |
| `leadType`  | `string` | —           | Exact match on `LeadType` enum                           |
| `status`    | `string` | —           | Exact match on `LeadStatus` enum                         |
| `sort`      | `string` | `createdAt` | Field path to sort by (lodash `get`-compatible)          |
| `order`     | `string` | `desc`      | `asc` or `desc`                                          |

**Success response — `200 OK`**

```json
{
  "data": [Lead, ...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 87,
    "totalPages": 9
  }
}
```

---

#### `GET /api/leads/:id`

Returns the full `Lead` record for the given ID.

| Status | Body                            |
| ------ | ------------------------------- |
| `200`  | `Lead`                          |
| `404`  | `{ "error": "Lead not found" }` |

---

#### `POST /api/leads`

Creates a new lead. The handler validates the required fields via Zod before inserting.

**Request body (required fields)**

```json
{
  "fullName": "string (min 1)",
  "email": "string (valid email)",
  "phone": "string (optional)",
  "source": "website | referral | walk-in | phone | social-media | dealer-event | other",
  "leadType": "cold | warm | hot",
  "status": "new | contacted | qualified | unqualified"
}
```

| Status | Body                                             |
| ------ | ------------------------------------------------ |
| `201`  | Full `Lead` record                               |
| `400`  | `{ "error": "Validation failed", "issues": [] }` |

> Unset fields (`address`, `vehiclesOfInterest`, `budget`, etc.) are populated with safe empty defaults by the handler.

---

#### `PATCH /api/leads/:id`

Partial update. Accepts any subset of writable `Lead` fields. Read-only fields (`id`, `createdAt`, `updatedAt`, `vehiclesOfInterest`) are stripped silently. `updatedAt` is set to the current timestamp.

| Status | Body                            |
| ------ | ------------------------------- |
| `200`  | Updated `Lead`                  |
| `404`  | `{ "error": "Lead not found" }` |

---

#### `DELETE /api/leads/:id`

Removes the lead from the in-memory store.

| Status | Body                            |
| ------ | ------------------------------- |
| `204`  | _(empty)_                       |
| `404`  | `{ "error": "Lead not found" }` |

---

### 4b. Activities

#### `GET /api/leads/:id/activities`

Returns all activities for a lead, sorted chronologically (`createdAt ASC`).

**Success response — `200 OK`**

```json
{ "data": [Activity, ...] }
```

---

#### `POST /api/leads/:id/activities`

Logs a new activity against a lead. `leadId` is injected from the URL — it must not be sent in the body.

**Request body**

```json
{
  "type": "call | email | text | appointment | note | walk-in",
  "subject": "string (min 1)",
  "note": "string (min 1)",
  "createdBy": "string (min 1)",
  "scheduledAt": "ISO 8601 string (optional)"
}
```

| Status | Body                                              |
| ------ | ------------------------------------------------- |
| `201`  | Full `Activity` record (`completedAt: null`)      |
| `400`  | `{ "error": "Validation failed", "details": [] }` |
| `404`  | `{ "error": "Lead not found" }`                   |

---

#### `PATCH /api/leads/:leadId/activities/:activityId`

Partial update for an existing activity. Read-only fields (`id`, `leadId`, `createdAt`, `createdBy`) are stripped. Used primarily to set `completedAt` when marking an activity done.

| Status | Body                                |
| ------ | ----------------------------------- |
| `200`  | Updated `Activity`                  |
| `404`  | `{ "error": "Activity not found" }` |

---

## 5. Data Flow

### 5a. Lead Inbox (read path)

```
┌─────────────────────────────────────────────────────────────────────┐
│  User lands on LeadsPage                                            │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  useDataTable                                                       │
│  Builds LeadsParams from { search, filters, sort, page, limit }    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ LeadsParams
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  useLeads(params) — React Query                                     │
│  queryKey: ['leads', params]  ·  staleTime: 30 s                   │
│  placeholderData: keepPreviousData (no loading flash on page turn)  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ fetchLeads(params)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  GET /api/leads?search=…&status=…&page=…                           │
│  MSW: filter → sort → paginate leadsStore[]                        │
│  Response: { data: Lead[], pagination: PaginationMeta }            │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ cached response
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  VirtualizedTableBody                                               │
│  Renders only visible rows via @tanstack/react-virtual             │
└─────────────────────────────────────────────────────────────────────┘
```

### 5b. Lead Detail View (read path)

```
┌────────────────────────────────────────────────────────────────────┐
│  User clicks a table row                                           │
│  LeadsPage: setSelectedLeadId(id)                                  │
└──────────────┬─────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  LeadDetailDrawer mounts                                                     │
│                                                                              │
│  useLead(id)       ──► GET /api/leads/:id        → full Lead record          │
│  useActivities(id) ──► GET /api/leads/:id/activities → Activity[]            │
│                                                                              │
│  ActivityFeed renders activities sorted by createdAt ASC                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 5c. Activity Logging (write path — optimistic)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Salesperson clicks "Log Activity" → ActivityModal opens                    │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │ form submit
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  useLogActivity.mutate({ leadId, type, subject, note, scheduledAt? })       │
│                                                                              │
│  onMutate  ──► cancel in-flight ['activities', leadId] queries              │
│            ──► snapshot current cache                                       │
│            ──► append optimistic Activity (id: "optimistic-…")              │
│                                                                              │
│  mutationFn ──► POST /api/leads/:id/activities                              │
│               MSW: Zod validate → push to activitiesStore → 201 Activity   │
│                                                                              │
│  onError   ──► restore snapshot (automatic rollback)                        │
│  onSettled ──► invalidateQueries(['activities', leadId])                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 5d. Lead Mutations (inline edit / create / delete)

```
Inline field blur
  useUpdateLead.mutate({ id, patch })
    ├─ onMutate  ──► optimistically update ['lead', id] + all ['leads'] pages
    ├─ mutationFn ──► PATCH /api/leads/:id
    ├─ onError   ──► restore both snapshots
    └─ onSettled ──► invalidate ['lead', id] + ['leads']

Create Lead submit
  useCreateLead.mutate(payload)
    ├─ mutationFn ──► POST /api/leads
    └─ onSuccess  ──► invalidate ['leads']

Delete confirm
  useDeleteLead.mutate(id)
    ├─ mutationFn ──► DELETE /api/leads/:id
    └─ onSuccess  ──► invalidate ['leads']  (drawer closes in component)
```

### 5e. View Persistence

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  useSavedView(currentState: TableStateSnapshot)                             │
│                                                                              │
│  On mount    ──► read localStorage['leadflow:savedView'] → initial state    │
│  save(state) ──► JSON.stringify → localStorage write → setSavedSnapshot    │
│  reset()     ──► localStorage.removeItem → setSavedSnapshot(null)          │
│  isModified  ──► deep-equal(currentState, savedSnapshot ?? defaults)       │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Hooks

All hooks live in `src/hooks/`. Query hooks use `@tanstack/react-query`; mutation hooks implement optimistic updates with snapshot rollback.

---

### `useDataTable`

**Input**

| Prop                      | Type                            | Description                                             |
| ------------------------- | ------------------------------- | ------------------------------------------------------- |
| `columns`                 | `ColumnDef<Lead, unknown>[]`    | TanStack Table column definitions                       |
| `data`                    | `Lead[]`                        | Current page of lead records                            |
| `pagination`              | `PaginationMeta`                | `{ page, limit, total, totalPages }` from last API call |
| `isLoading / isError`     | `boolean`                       | Forwarded from `useLeads`                               |
| `error`                   | `Error \| null`                 | Forwarded from `useLeads`                               |
| `onStateChange`           | `(params: LeadsParams) => void` | Callback fired whenever filter / sort / page changes    |
| `initialColumnVisibility` | `VisibilityState`               | Optional column visibility map to hydrate on mount      |

**Returns** (`UseDataTableReturn`)

| Key                   | Type                               | Description                                              |
| --------------------- | ---------------------------------- | -------------------------------------------------------- |
| `table`               | `Table<Lead>`                      | TanStack Table instance (pass to `TableBody`, headers)   |
| `filters`             | `FilterState`                      | Current filter values                                    |
| `setFilter`           | `(key, value) => void`             | Update a single filter field and trigger `onStateChange` |
| `setFilters`          | `(filters: FilterState) => void`   | Replace all filters at once                              |
| `clearFilters`        | `() => void`                       | Reset to `INITIAL_FILTERS`                               |
| `sorting`             | `SortingState`                     | Active sort column and direction                         |
| `setSorting`          | `(s: SortingState) => void`        | Update sort and trigger `onStateChange`                  |
| `pageIndex`           | `number`                           | 0-based current page index                               |
| `pageSize`            | `number`                           | Current page size                                        |
| `setPageSize`         | `(size: number) => void`           | Update page size and trigger `onStateChange`             |
| `columnVisibility`    | `VisibilityState`                  | Hidden/visible column map                                |
| `setColumnVisibility` | `(state: VisibilityState) => void` | Toggle column visibility (not persisted in saved view)   |
| `stickyColumns`       | `string[]`                         | Column IDs pinned to the right (default: `['actions']`)  |

**Key behaviours**

- All filter, sort, and page mutations call `onStateChange` synchronously, which the parent passes to `useLeads` to trigger a React Query refetch.
- Uses TanStack Table in **manual** mode (`manualSorting`, `manualFiltering`, `manualPagination`) — the server owns all data operations.
- `pageIndex` is converted from 1-based server pagination to 0-based TanStack Table convention.

---

### `useLeads`

**Input:** `params: LeadsParams` — the full query parameter object built by `useDataTable`.

**Returns:** `UseQueryResult<{ data: Lead[]; pagination: PaginationMeta }>`

**Key behaviours**

- Query key: `['leads', params]` — any param change triggers a new fetch.
- `keepPreviousData` (`placeholderData`) keeps the previous page visible while the next page loads, preventing empty-table flicker during pagination.

---

### `useLead`

**Input:** `id: string`

**Returns:** `UseQueryResult<Lead>`

**Key behaviours**

- Query key: `['lead', id]`
- `enabled: !!id` — skips the fetch if no ID is selected (drawer closed).

---

### `useActivities`

**Input:** `leadId: string`

**Returns:** `UseQueryResult<{ data: Activity[] }>`

**Key behaviours**

- Query key: `['activities', leadId]`
- `enabled: !!leadId` — only fetches when a lead is open in the drawer.
- MSW returns activities sorted `createdAt ASC`; `ActivityFeed` renders in that order.

---

### `useLogActivity`

**Input to `.mutate()`:** `{ leadId, type, subject, note, createdBy, scheduledAt? }`

**Returns:** `UseMutationResult<Activity, Error, LogActivityArgs>`

**Key behaviours (optimistic write)**

1. `onMutate` — cancels in-flight activity queries, snapshots the cache, and appends an optimistic `Activity` with `id: "optimistic-<timestamp>"`.
2. `mutationFn` — `POST /api/leads/:id/activities`
3. `onError` — restores the snapshot, removing the optimistic entry.
4. `onSettled` — invalidates `['activities', leadId]` regardless of outcome so the server's confirmed record replaces the optimistic one.

---

### `useUpdateLead`

**Input to `.mutate()`:** `{ id: string; patch: Partial<Lead> }`

**Returns:** `UseMutationResult<Lead, Error, UpdateLeadArgs>`

**Key behaviours (optimistic write)**

1. `onMutate` — snapshots both `['lead', id]` and all `['leads']` paginated entries; immediately applies `patch` to both caches.
2. `mutationFn` — `PATCH /api/leads/:id`
3. `onError` — restores both snapshots atomically.
4. `onSettled` — invalidates `['lead', id]` and `['leads']` to sync confirmed server data.

---

### `useCreateLead`

**Input to `.mutate()`:** `CreateLeadBody` — `{ fullName, email, phone?, source, leadType, status }`

**Returns:** `UseMutationResult<Lead, Error, CreateLeadBody>`

**Key behaviours**

- `mutationFn` — `POST /api/leads`
- `onSuccess` — invalidates `['leads']` so the new entry appears in the inbox.
- No optimistic update (new leads have an unknown ID at mutation time).

---

### `useDeleteLead`

**Input to `.mutate()`:** `id: string`

**Returns:** `UseMutationResult<void, Error, string>`

**Key behaviours**

- `mutationFn` — `DELETE /api/leads/:id`
- `onSuccess` — invalidates `['leads']`; the component that triggers this is responsible for closing the drawer.

---

### `useUpdateActivity`

**Input:** `leadId: string` (hook constructor), `.mutate({ activityId, patch: Partial<Activity> })`

**Returns:** `UseMutationResult<Activity, Error, UpdateActivityArgs>`

**Key behaviours (optimistic write)**

1. `onMutate` — snapshots `['activities', leadId]` and applies the patch optimistically.
2. `mutationFn` — `PATCH /api/leads/:leadId/activities/:activityId`
3. `onError` — restores the snapshot.
4. `onSettled` — invalidates `['activities', leadId]`.

- Primary use case: setting `completedAt` to mark an activity as done.

---

### `useSavedView`

**Input:** `currentState: TableStateSnapshot` — `{ filters, sorting, columnVisibility, stickyColumns, pageSize }`

**Returns**

| Key             | Type                                  | Description                                                  |
| --------------- | ------------------------------------- | ------------------------------------------------------------ |
| `savedSnapshot` | `TableStateSnapshot \| null`          | The persisted snapshot, or `null` if none saved              |
| `isModified`    | `boolean`                             | Deep-equal check between `currentState` and `savedSnapshot`  |
| `hasSavedView`  | `boolean`                             | `true` when a snapshot exists in localStorage                |
| `save`          | `(state: TableStateSnapshot) => void` | Persists state to `localStorage['leadflow:savedView']`       |
| `reset`         | `() => void`                          | Removes the saved snapshot and reverts `isModified` baseline |
| `defaults`      | `TableStateSnapshot`                  | The hard-coded default state used when no snapshot exists    |

**Key behaviours**

- Reads `localStorage` lazily on first render via the `useState` initialiser — no `useEffect`.
- `isModified` uses Lodash `isEqual` for deep comparison; drives the "unsaved changes" indicator in the toolbar.
- localStorage key: `leadflow:savedView`.

---

## 7. Accessibility

### Semantic HTML

- Table uses `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` — not divs
- Sort headers: `aria-sort="ascending|descending|none"` on `<th>`, sortable columns contain a `<button>` inside `<th>`
- Column resize handles: `role="separator"`, `aria-orientation="vertical"`, keyboard-draggable via arrow keys

### ARIA Roles

- Global search: `role="searchbox"`, `aria-label="Search leads"`
- Range slider: `aria-valuemin`, `aria-valuemax`, `aria-valuenow`
- Filter controls: `<label>` + `<input>` properly associated
- Loading: `aria-busy="true"` on table body, shimmer rows use `aria-hidden="true"`
- Pagination: `aria-label="Pagination"`, current page uses `aria-current="page"`
- Sticky column: `aria-label` indicates pinned state

### Keyboard Navigation

- Tab moves between interactive elements (sort buttons, filter inputs, pagination)
- Enter/Space activates sort, toggles visibility
- Arrow keys adjust column resize handles and range slider
- Escape closes dropdown menus (column visibility, filter menus)

---

## 8. Performance

- **Virtualization (TanStack Virtual):** Only renders visible rows + overscan buffer (~5 rows above/below). Table container has a fixed height with vertical scroll. Row height estimated at a fixed value for consistent virtual sizing.
- **Debounced search:** 300ms debounce via lodash-es `debounce` on global search input before triggering API call. `debounced.cancel()` called in `useEffect` cleanup to prevent stale calls after unmount or when the external `value` prop changes.
- **Stable references:** Column definitions defined outside the component (or `useMemo`). `onStateChange` callback wrapped in `useCallback`.
- **Resize without re-render:** Column resize uses CSS variable updates during the drag — commits to React state on drag end only.
- **Prefetch:** Pagination prefetches adjacent pages via `queryClient.prefetchQuery()` (carried over from Phase 1).
- **Parallel queries:** `useLead` + `useActivities` queries on Lead Detail fire in parallel — eliminates sequential waterfall.
- **Code splitting:** Vite's code-splitting per route keeps initial bundle small.

## 9. Technology Choices

| Technology                         | Justification                                                                                                                                                                                                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React 19**                       | Latest stable release. Concurrent transitions reduce jank during filter/sort interactions.                                                                                                                                                                 |
| **TypeScript**                     | `src/types/index.ts` is the single source of truth for all domain types (`Lead`, `Activity`, `FilterState`, `TableStateSnapshot`). Compile-time contracts between the API layer and UI prevent entire categories of runtime bugs.                          |
| **Vite**                           | Sub-second HMR with no config overhead for a SPA of this scope. Native ESM in dev; Rollup for optimised production bundles.                                                                                                                                |
| **Tailwind CSS v4**                | Utility-first keeps styles co-located with markup. v4 CSS-native variables eliminate the PostCSS config step and allow token-based theming without a build plugin.                                                                                         |
| **shadcn/ui**                      | Unstyled, accessible Radix primitives that are copy-owned — no version lock, full customisation, and directly required by the project guidelines.                                                                                                          |
| **TanStack Table v8**              | Headless table primitives with built-in sort, filter, pagination, and column-visibility state. Keeps all table logic out of components; column definitions live in `lead-columns.tsx` per TanStack convention.                                             |
| **TanStack Virtual**               | Row virtualisation: only renders DOM nodes for visible rows, keeping the inbox fast with hundreds of leads.                                                                                                                                                |
| **TanStack Query v5**              | Declarative server-state cache. Provides stale-while-revalidate, background refetch, optimistic mutations with automatic rollback, and `invalidateQueries` for cache coherence after writes. Eliminates `useEffect`/`useState` fetch boilerplate entirely. |
| **MSW v2**                         | Intercepts `fetch` at the Service Worker level — identical handler code runs in the browser and in Vitest's Node environment. No test doubles, no per-test mocking of `fetch`.                                                                             |
| **Zod**                            | Runtime schema validation in MSW handlers mirrors what a real API gateway would enforce. Shared schemas can be extracted to a monorepo package without changing either side.                                                                               |
| **pino (browser build)**           | Structured JSON log entries. Zero-cost in production when `VITE_LOG_LEVEL=silent`. Level is controlled by an env var without rebuilding.                                                                                                                   |
| **Vitest + React Testing Library** | Vitest shares the Vite transform pipeline — no separate Babel/Jest config. RTL enforces testing from the user's perspective (accessible queries, `userEvent`) rather than implementation details.                                                          |

---

## 10. Observability Strategy

### 10a. Structured Logging — pino

`src/lib/logger.ts` exports a singleton pino instance configured for the browser (`browser: { asObject: true }`). Log level is driven by the `VITE_LOG_LEVEL` environment variable (default: `"info"`).

Every MSW handler emits a structured log entry on each request:

```ts
// success
logger.info({ method: 'GET', path: '/api/leads', page, resultCount, status: 200 }, 'leads fetched');

// not found
logger.warn({ method: 'GET', path: '/api/leads/:id', id, status: 404 }, 'lead not found');

// validation error
logger.warn({ method: 'POST', path: '/api/leads', issues, status: 422 }, 'validation failed');
```

Consistent field names across all handlers make log aggregation trivial once a real backend is wired in. Replacing the pino transport with a remote sink (Axiom, Datadog Logs, or a custom `/api/logs` endpoint) requires no application-code changes.

### 10b. React Query DevTools

`@tanstack/react-query-devtools` is mounted in development builds only (tree-shaken in production). It surfaces:

- Per-query cache state: `fresh` / `stale` / `fetching` / `error`
- Cache key hierarchy and TTL
- Background refetch timing
- Mutation status, variables, and error payloads

This is the primary tool for diagnosing latency, stale-cache, and optimistic-update bugs during development.

### 10c. Error Boundaries

Each major panel (`LeadsPage`, `LeadDetailDrawer`) is wrapped in a React Error Boundary. Uncaught render errors are:

1. Logged via `logger.error({ component, error })` with component context.
2. Replaced with a contained fallback UI — a single panel failure cannot crash the whole application.

### 10d. Performance Monitoring (production path)

The architecture is instrumented-ready for Web Vitals:

- `VirtualizedTableBody` eliminates the primary LCP/INP risk (long DOM from large lead lists).
- A `reportWebVitals(metric => logger.info(metric))` call at `main.tsx` can push CLS/LCP/INP/FID/TTFB to any analytics endpoint without modifying component code.
- `React.Profiler` wrappers can be added per-panel to measure render duration in staging.

### 10e. Network Request Tracing

In development, MSW logs each intercepted request to the DevTools console with method, URL, status, and artificial latency. In a production deployment this layer is replaced by real server-side observability (OpenTelemetry traces on the API, Sentry breadcrumbs on the client).

---

## 11. How GenAI Was Used in the Design Phase

Claude (Anthropic) was used as an active design and implementation partner throughout this project via the Claude Code CLI. The collaboration followed a deliberate **Plan → Review → Act** cycle — code was never accepted without being read and understood first.

### 11a. Contextual Prompting

Before planning design, Claude was given a defined role and a set of reference documents to anchor its output to the project's goals:

> _"You are a senior software engineer, expert in frontend system desgin architecture..."_

Alongside the role definition, existing skills were provided as context — `skills/frontend-architecture`.

### 11b. Requirements Decomposition

The initial task description was deliberately sparse. Before writing any code, I prompted Claude to surface unstated requirements:

> _"What edge cases or domain constraints should be addressed before finalising the Lead and Activity data models?"_

This surfaced decisions that would otherwise have emerged late: the distinction between `LeadSummary` (list) and full `Lead` (detail), the `completedAt: string | null` pattern for activity completion, currency-aware budget range filtering, and whether `scheduledAt` on an activity should be optional. These became explicit constraints in `src/types/index.ts`.

### 11c. Architecture Trade-off Analysis

Key architectural decisions were made by asking Claude to compare options before committing:

- **Server state:** Redux Toolkit Query vs. TanStack Query vs. SWR. Claude laid out ergonomics, cache invalidation granularity, and optimistic-update patterns. TanStack Query won for a CRUD-heavy app with per-resource cache keys.
- **Filtering:** Client-side vs. server-side. Claude correctly identified that server-side was the right default even for a prototype, because it reflects production constraints and keeps MSW handler logic honest.
- **View persistence:** `sessionStorage` vs. `localStorage` vs. URL params. URL params were rejected because they expose filter state (prospect data) in shareable links; `localStorage` was chosen for simplicity over a backend-persisted preference store.

### 11d. Schema and Validation Design

Claude generated first-pass Zod schemas for the MSW handlers given the TypeScript types. The drafts were ~80% correct. The remaining 20% required domain input: tightening string minimums (`.min(1)` on `fullName`), restricting enum values to the actual dealership workflow, and adding cross-field validation (e.g. `budgetMax >= budgetMin`).

### 11e. Test Structure

Claude scaffolded the initial `renderHook` + `act()` test structure for `useDataTable` and `useLogActivity`. The generated tests were functional but initially over-specified — asserting internal state rather than observable behaviour. Refactoring them to follow RTL's "test what the user sees" principle required understanding the _intent_ of the tests, not just their syntax.

### 11f. Scope Control

Claude occasionally proposed patterns suited to larger teams: a `useQueryErrorHandler` global boundary, a plugin-based MSW handler registry, per-column filter components registered via a lookup map. Each was evaluated against current scale and rejected when the added complexity had no present-day payoff.

### 11g. Limitations

- Claude has no access to the running application. All UI/UX decisions (drawer vs. modal for lead detail, virtualisation threshold, mobile breakpoints) were made by the engineer based on browser testing.
- Every piece of generated code was read, understood, and validated against the actual requirements before being committed. GenAI output was treated as a well-informed first draft, not ground truth.
