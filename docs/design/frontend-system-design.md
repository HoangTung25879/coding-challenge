# LeadFlow — Frontend System Design Document

**Project:** Sales Lead Management Tool (Scenario C — Keyloop Coding Challenge)
**Date:** 2026-03-24
**Author:** Engineering (with GenAI assistance — see §7)

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
type LeadSource = 'website' | 'referral' | 'walk-in' | 'phone' | 'social-media' | 'dealer-event' | 'other';
type LeadType = 'cold' | 'warm' | 'hot';
type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified';
type PurchaseTimeline = 'immediate' | 'within-1-month' | 'within-3-months' | 'within-6-months' | 'exploring';

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
  leadId: string;            // FK → Lead.id
  type: ActivityType;
  subject: string;
  note: string;
  scheduledAt?: string | null; // optional future date/time, ISO 8601
  createdAt: string;           // ISO 8601
  createdBy: string;           // sales rep identifier
  completedAt: string | null;  // null = pending · ISO string = completed
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

## 4. Data Flow

### 4a. Lead Inbox (read path)

```
User lands on LeadsPage
  → useDataTable builds { search, filters, sort, page } params
  → useLeads(params) issues React Query fetch
    → fetchLeads(params) → GET /api/leads?search=…&status=…&page=…
      → MSW handler filters + sorts + paginates leadsStore[]
      → returns { data: LeadSummary[], pagination: Pagination }
    → React Query caches response (staleTime: 30 s)
  → VirtualizedTableBody renders only visible rows
```

### 4b. Lead Detail View (read path)

```
User clicks a table row
  → LeadsPage sets selectedLeadId
  → LeadDetailDrawer mounts
    → useLead(id)        → GET /api/leads/:id          (full Lead record)
    → useActivities(id)  → GET /api/leads/:id/activities
  → ActivityFeed renders activities sorted by createdAt ASC
```

### 4c. Activity Logging (write path)

```
Salesperson clicks "Log Activity"
  → ActivityModal opens
  → Salesperson fills form (type, subject, note, optional scheduledAt)
  → Submit triggers useLogActivity.mutate(payload)
    → postActivity(leadId, payload) → POST /api/leads/:id/activities
      → MSW validates payload (Zod)
      → pushes new Activity to activitiesStore
      → returns Activity { id, leadId, type, subject, … }
    → React Query invalidates ['activities', leadId]
  → ActivityFeed re-fetches and renders the new entry
  → Optimistic UI shown immediately; rolled back automatically on error
```

### 4d. Lead Mutations (inline edit / create / delete)

```
Inline field blur  → useUpdateLead.mutate({ id, field, value })
                     → PATCH /api/leads/:id  →  invalidates ['lead', id] + ['leads']

Create Lead submit → useCreateLead.mutate(payload)
                     → POST /api/leads       →  invalidates ['leads']

Delete confirm     → useDeleteLead.mutate(id)
                     → DELETE /api/leads/:id →  invalidates ['leads'], closes drawer
```

### 4e. View Persistence

```
useSavedView reads/writes TableStateSnapshot → localStorage key 'leadflow-saved-view'
Snapshot = { filters, sort, columnVisibility, pagination }
Automatically restored on every page load.
```

---

## 5. Technology Choices

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

## 6. Observability Strategy

### 6a. Structured Logging — pino

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

### 6b. React Query DevTools

`@tanstack/react-query-devtools` is mounted in development builds only (tree-shaken in production). It surfaces:

- Per-query cache state: `fresh` / `stale` / `fetching` / `error`
- Cache key hierarchy and TTL
- Background refetch timing
- Mutation status, variables, and error payloads

This is the primary tool for diagnosing latency, stale-cache, and optimistic-update bugs during development.

### 6c. Error Boundaries

Each major panel (`LeadsPage`, `LeadDetailDrawer`) is wrapped in a React Error Boundary. Uncaught render errors are:

1. Logged via `logger.error({ component, error })` with component context.
2. Replaced with a contained fallback UI — a single panel failure cannot crash the whole application.

### 6d. Performance Monitoring (production path)

The architecture is instrumented-ready for Web Vitals:

- `VirtualizedTableBody` eliminates the primary LCP/INP risk (long DOM from large lead lists).
- A `reportWebVitals(metric => logger.info(metric))` call at `main.tsx` can push CLS/LCP/INP/FID/TTFB to any analytics endpoint without modifying component code.
- `React.Profiler` wrappers can be added per-panel to measure render duration in staging.

### 6e. Network Request Tracing

In development, MSW logs each intercepted request to the DevTools console with method, URL, status, and artificial latency. In a production deployment this layer is replaced by real server-side observability (OpenTelemetry traces on the API, Sentry breadcrumbs on the client).

---

## 7. How GenAI Was Used in the Design Phase

Claude (Anthropic) was used as an active design and implementation partner throughout this project via the Claude Code CLI. The collaboration followed a deliberate **Plan → Review → Act** cycle — code was never accepted without being read and understood first.

### 7a. Contextual Prompting

Before planning design, Claude was given a defined role and a set of reference documents to anchor its output to the project's goals:

> _"You are a senior software engineer, expert in frontend system desgin architecture..."_

Alongside the role definition, existing skills were provided as context — `skills/frontend-architecture`.

### 7b. Requirements Decomposition

The initial task description was deliberately sparse. Before writing any code, I prompted Claude to surface unstated requirements:

> _"What edge cases or domain constraints should be addressed before finalising the Lead and Activity data models?"_

This surfaced decisions that would otherwise have emerged late: the distinction between `LeadSummary` (list) and full `Lead` (detail), the `completedAt: string | null` pattern for activity completion, currency-aware budget range filtering, and whether `scheduledAt` on an activity should be optional. These became explicit constraints in `src/types/index.ts`.

### 7c. Architecture Trade-off Analysis

Key architectural decisions were made by asking Claude to compare options before committing:

- **Server state:** Redux Toolkit Query vs. TanStack Query vs. SWR. Claude laid out ergonomics, cache invalidation granularity, and optimistic-update patterns. TanStack Query won for a CRUD-heavy app with per-resource cache keys.
- **Filtering:** Client-side vs. server-side. Claude correctly identified that server-side was the right default even for a prototype, because it reflects production constraints and keeps MSW handler logic honest.
- **View persistence:** `sessionStorage` vs. `localStorage` vs. URL params. URL params were rejected because they expose filter state (prospect data) in shareable links; `localStorage` was chosen for simplicity over a backend-persisted preference store.

### 7d. Schema and Validation Design

Claude generated first-pass Zod schemas for the MSW handlers given the TypeScript types. The drafts were ~80% correct. The remaining 20% required domain input: tightening string minimums (`.min(1)` on `fullName`), restricting enum values to the actual dealership workflow, and adding cross-field validation (e.g. `budgetMax >= budgetMin`).

### 7e. Test Structure

Claude scaffolded the initial `renderHook` + `act()` test structure for `useDataTable` and `useLogActivity`. The generated tests were functional but initially over-specified — asserting internal state rather than observable behaviour. Refactoring them to follow RTL's "test what the user sees" principle required understanding the _intent_ of the tests, not just their syntax.

### 7f. Scope Control

Claude occasionally proposed patterns suited to larger teams: a `useQueryErrorHandler` global boundary, a plugin-based MSW handler registry, per-column filter components registered via a lookup map. Each was evaluated against current scale and rejected when the added complexity had no present-day payoff.

### 7g. Limitations

- Claude has no access to the running application. All UI/UX decisions (drawer vs. modal for lead detail, virtualisation threshold, mobile breakpoints) were made by the engineer based on browser testing.
- Every piece of generated code was read, understood, and validated against the actual requirements before being committed. GenAI output was treated as a well-informed first draft, not ground truth.
