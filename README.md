# LeadFlow - Sales Lead Management Tool

**Scenario C** of the Keyloop Coding Challenge. A lightweight Sales Lead Management SPA for vehicle dealership salespeople — built with React 19, TypeScript, Vite, Tailwind CSS v4, and MSW.

---

## Prerequisites

| Tool    | Version                |
| ------- | ---------------------- |
| Node.js | ≥ 20 (LTS recommended) |
| npm     | ≥ 10                   |

No other global tools are required.

---

## Installation

```bash
git clone <repo-url>
cd leadflow
npm install
```

---

## Running the App

```bash
npm run dev
```

Opens at **http://localhost:3000**.

All API calls are intercepted by a Mock Service Worker (MSW) — no backend is needed. The in-memory store is seeded with realistic dealership data on every page load.

To re-seed the mock data at any time (useful after mutations in dev):

```bash
npm run seed
```

---

## Building for Production

```bash
npm run build
```

Runs TypeScript type-checking (`tsc -b`) then produces a production bundle via Vite into `dist/`.

To preview the production build locally:

```bash
npm run preview
```

---

## Linting & Formatting

```bash
npm run lint          # ESLint (typescript-eslint rules)
npm run format        # Prettier write
npm run format:check  # Prettier check (CI-safe)
```

---

## Testing

### Run all tests (watch mode)

```bash
npm run test
```

### Run all tests once (CI / single run)

```bash
npm run test:run
```

### Run a single test file

```bash
npx vitest run src/__tests__/mocks/lead-lifecycle.test.ts
```

### Test structure

```
src/__tests__/
├── business-logic/
│   └── lead-lifecycle.test.ts     # End-to-end lead + activity lifecycle scenarios
├── mocks/
│   ├── leads.test.ts              # GET /api/leads — shape + pagination
│   ├── leads-filters.test.ts      # Search, filter, sort, pagination permutations
│   ├── leads-id.test.ts           # GET /api/leads/:id
│   ├── leads-create-update.test.ts# POST + PATCH leads
│   ├── leads-delete.test.ts       # DELETE /api/leads/:id
│   ├── activities.test.ts         # GET + POST activities
│   └── activities-update.test.ts  # PATCH activities (mark complete, guard read-only)
├── hooks/
│   ├── useLeads.test.ts
│   ├── useLead.test.ts
│   ├── useActivities.test.ts
│   ├── useLogActivity.test.ts
│   ├── useUpdateActivity.test.ts
│   ├── useCreateLead.test.ts
│   ├── useUpdateLead.test.ts
│   ├── useDeleteLead.test.ts
│   ├── useDataTable.test.ts
│   └── useSavedView.test.ts
└── components/
    └── …                          # UI component render + interaction tests
```

### Testing strategy

- **Handler tests** (`src/__tests__/mocks/`) — call MSW handlers directly via `fetch`. No React involved. Fast, explicit, and CI-safe.
- **Hook tests** (`src/__tests__/hooks/`) — use `renderHook` + `act()` from React Testing Library with a real `QueryClient`. MSW node server intercepts HTTP.
- **Component tests** (`src/__tests__/components/`) — use `render` + `userEvent` from RTL. Callbacks are `vi.fn()`.
- All tests use **Vitest** as the runner and **jsdom** as the environment.

---

## Environment Variables

Create a `.env.local` file (never committed) to override defaults:

| Variable         | Default            | Description                                                         |
| ---------------- | ------------------ | ------------------------------------------------------------------- |
| `VITE_API_URL`   | `""` (same origin) | Base URL for API calls. Leave empty when using MSW.                 |
| `VITE_LOG_LEVEL` | `"info"`           | Pino log level: `trace`, `debug`, `info`, `warn`, `error`, `silent` |

---

## Project Structure

```
src/
├── components/
│   ├── data-table/     # TanStack Table: toolbar, filters, virtualised body, pagination
│   ├── leads/          # Domain UI: drawer, activity feed, modals, inline-edit
│   └── ui/             # shadcn primitives + custom atoms
├── hooks/              # React Query hooks + useDataTable + useSavedView
├── lib/
│   ├── api.ts          # Typed fetch wrapper (all HTTP calls)
│   └── logger.ts       # Pino browser logger
├── mocks/
│   ├── browser.ts      # MSW browser setup (dev)
│   ├── node.ts         # MSW node setup (tests)
│   ├── handlers/       # Route handlers (Zod-validated, 60 ms delay)
│   └── data/           # In-memory leadsStore + activitiesStore
├── pages/
│   ├── LeadsPage.tsx   # Root page component
│   └── lead-columns.tsx# TanStack Table column definitions
└── types/index.ts      # Single source of truth for all domain types
```

---

## AI Collaboration Narrative

This project was built with Claude (Anthropic) as a hands-on engineering partner via the Claude Code CLI. Below is an honest account of how that collaboration shaped the work.

The goal is to prevent "vibe coding" (blindly accepting code) by providing context, constraints, and specific goals.

- **Plan → Act → Review → Repeat**: Never start with code. Initiate discussions to outline the architecture, data structures, and algorithms first.

- **Contextual Prompting (System Prompts)**: Define the AI's role ("You are a senior frontend engineer") and provide document files that outline coding style, naming conventions, and project structure.

- **Break Down Complex Tasks**: Instead of asking for a feature, break it into smaller tasks (e.g., "Create a validation function," "Create the modal component").

- **Examples Over Explanations**: Provide 2–3 examples of the input/output style expected (few-shot prompting) (e.g, "Use @standard-component.tsx to create xyz component).

### Where human judgement was essential

- **UI/UX decisions** (drawer vs. modal for lead detail, virtualisation threshold, mobile-first layout rules) required browser testing — Claude has no access to the running application.
- **Scope control.** Claude occasionally suggested patterns appropriate for larger teams (`useQueryErrorHandler` global boundary, plugin-based MSW handler registry) that added complexity without current value. These were explicitly rejected.
- **Test intent.** Generated test assertions sometimes targeted internal state rather than observable behaviour. Recognising and correcting this required understanding _why_ RTL is designed the way it is, not just its syntax.
- **All generated code was read, understood, and validated** before being committed. GenAI output was treated as a well-informed first draft, not ground truth.
- **Test-Driven Development (TDD)**: Ask the AI to write unit/integration tests before the implementation. This forces the model to understand the functional requirements before coding.
