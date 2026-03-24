# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

- All UI components must be mobile-responsive by default. Use flexbox/grid. Avoid fixed pixel widths for containers. Mobile-first design only.
- Always use shadcn component if possible.

## Commands

```bash
npm run dev          # Start dev server on port 3000
npm run build        # TypeScript check + Vite build
npm run lint         # ESLint
npm run test         # Vitest (watch mode)
npm run test:run     # Vitest (single run)
npm run seed         # Re-seed in-memory mock data
```

Run a single test file:

```bash
npx vitest run src/__tests__/hooks/useDataTable.test.ts
```

## Architecture

**LeadFlow** is a vehicle-dealer CRM SPA (React 19, TypeScript, Vite, Tailwind v4).

### Data Flow

```
LeadsPage → custom hooks → React Query → src/lib/api.ts (fetch) → MSW handlers → in-memory store
                        ↘ localStorage (useSavedView)
```

- **`src/lib/api.ts`** — typed fetch wrapper; all API calls go through here (`fetchLeads`, `createLead`, `updateLead`, `postActivity`, etc.)
- **`src/mocks/handlers/`** — MSW intercepts `*/api/*` routes in both browser and tests; handlers validate with Zod, mutate an in-memory `leadsStore` array, and add a 60ms artificial delay
- **`src/types/index.ts`** — single source of truth for all domain types: `Lead`, `Activity`, `VehicleInterest`, `FilterState`, `TableStateSnapshot`, etc.

### State Management

No Redux/Zustand. Three layers:

1. **Server state** — React Query (`useLeads`, `useActivities`); `staleTime: 30s`, optimistic updates with rollback on error
2. **UI state** — `useDataTable` hook manages filters, sorting, pagination, column visibility
3. **Persistence** — `useSavedView` reads/writes `TableStateSnapshot` to localStorage

### Key Directories

| Path                         | Purpose                                                                                                                 |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `src/hooks/`                 | Custom hooks: `useDataTable` (table UI state), `useSavedView` (localStorage), `useLeads`/`useLogActivity` (React Query) |
| `src/components/data-table/` | TanStack Table integration: `TableToolbar`, `FilterMenu`, `VirtualizedTableBody`, `ColumnVisibilityToggle`              |
| `src/components/leads/`      | Domain components: `LeadDetailDrawer`, `CreateLeadModal`, `ActivityModal`, `InlineEditField`, `VehicleEditModal`        |
| `src/components/ui/`         | shadcn + custom primitives (Button, DateTimePicker, StatusBadge, etc.)                                                  |
| `src/pages/lead-columns.tsx` | TanStack Table column definitions (kept outside components per TanStack convention)                                     |
| `src/mocks/`                 | MSW: `browser.ts`/`node.ts` setup, `handlers/`, `data/` (mock stores)                                                   |

### Testing Patterns

Tests live in `src/__tests__/` mirroring `src/`. Uses Vitest + React Testing Library + MSW node server.

- Hook tests use `renderHook()` with `act()`
- Component tests use `vi.fn()` for callbacks and `setup()` helper functions
- MSW is configured in `src/mocks/node.ts` for test environments

### Note

- All UI components must be mobile-responsive by default. Use flexbox/grid. Avoid fixed pixel widths for containers.
- Always use shadcn component if possible.
