import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CreateLeadModal } from '@/components/leads/CreateLeadModal'
import { server } from '@/mocks/node'
import { leadsStore } from '@/mocks/data/leads'

const initialLength = leadsStore.length
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => { server.resetHandlers(); leadsStore.splice(initialLength) })
afterAll(() => server.close())

function renderModal(onClose = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <CreateLeadModal onClose={onClose} />
    </QueryClientProvider>
  )
}

describe('CreateLeadModal', () => {
  it('renders all required fields', () => {
    renderModal()
    expect(screen.getByRole('textbox', { name: /full name/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /lead type/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /source/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /status/i })).toBeInTheDocument()
  })

  it('shows validation errors when submitting empty form', async () => {
    renderModal()
    await userEvent.click(screen.getByRole('button', { name: /create lead/i }))
    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    })
  })

  it('calls onClose after successful submission', async () => {
    const onClose = vi.fn()
    renderModal(onClose)

    await userEvent.type(screen.getByRole('textbox', { name: /full name/i }), 'John Doe')
    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'john@doe.com')
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /lead type/i }), 'warm')
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /source/i }), 'website')
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /status/i }), 'new')
    await userEvent.click(screen.getByRole('button', { name: /create lead/i }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn()
    renderModal(onClose)
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows "Email is required" when email is empty (not format error)', async () => {
    renderModal()
    // Submit with no email filled
    await userEvent.click(screen.getByRole('button', { name: /create lead/i }))
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })
  })

  it('shows "Valid email required" for malformed email', async () => {
    renderModal()
    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'not-an-email')
    await userEvent.tab() // trigger onBlur
    await waitFor(() => {
      expect(screen.getByText('Valid email required')).toBeInTheDocument()
    })
  })

  it('shows "Full name is required" when fullName is empty', async () => {
    renderModal()
    await userEvent.click(screen.getByRole('button', { name: /create lead/i }))
    await waitFor(() => {
      expect(screen.getByText('Full name is required')).toBeInTheDocument()
    })
  })
})
