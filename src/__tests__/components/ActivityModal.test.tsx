import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ActivityModal } from '@/components/leads/ActivityModal'
import { server } from '@/mocks/node'
import type { Activity } from '@/types'

const onClose = vi.fn()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => { server.resetHandlers(); onClose.mockReset() })
afterAll(() => server.close())

function renderModal(props: Partial<Parameters<typeof ActivityModal>[0]> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ActivityModal leadId="lead-085" onClose={onClose} {...props} />
    </QueryClientProvider>
  )
}

const mockActivity: Activity = {
  id: 'act-001',
  leadId: 'lead-085',
  type: 'email',
  subject: 'Test subject',
  note: 'Test note',
  createdAt: '2026-01-22T18:58:50.348Z',
  createdBy: 'salesperson-1',
  completedAt: null,
}

describe('ActivityModal', () => {
  it('renders create mode with empty fields', () => {
    renderModal()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Add Activity')).toBeInTheDocument()
    expect(screen.getByLabelText(/subject/i)).toHaveValue('')
  })

  it('renders edit mode pre-populated', () => {
    renderModal({ activity: mockActivity })
    expect(screen.getByText('Edit Activity')).toBeInTheDocument()
    expect(screen.getByLabelText(/subject/i)).toHaveValue('Test subject')
    expect(screen.getByRole('button', { name: /mark.*done/i })).toBeInTheDocument()
  })

  it('hides "Mark as done" button when activity is already completed', () => {
    renderModal({ activity: { ...mockActivity, completedAt: '2026-01-23T00:00:00Z' } })
    expect(screen.queryByRole('button', { name: /mark.*done/i })).not.toBeInTheDocument()
  })

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const close = vi.fn()
    renderModal({ onClose: close })
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(close).toHaveBeenCalledOnce()
  })
})
