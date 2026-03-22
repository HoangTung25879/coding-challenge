// src/__tests__/components/ActivityForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ActivityForm } from '@/components/lead-detail/ActivityForm'
import { server } from '@/mocks/node'
import { activitiesStore } from '@/mocks/data/activities'

const initialLength = activitiesStore.length
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => { server.resetHandlers(); activitiesStore.splice(initialLength) })
afterAll(() => server.close())

function renderForm(leadId = 'lead-001') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ActivityForm leadId={leadId} />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('ActivityForm', () => {
  it('renders type selector, subject, note and submit button', () => {
    renderForm()
    expect(screen.getByRole('combobox', { name: /type/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /subject/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /note/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log activity/i })).toBeInTheDocument()
  })

  it('submits and resets form on success', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.selectOptions(screen.getByRole('combobox', { name: /type/i }), 'call')
    await user.type(screen.getByRole('textbox', { name: /subject/i }), 'Test subject')
    await user.type(screen.getByRole('textbox', { name: /note/i }), 'Test note')
    await user.click(screen.getByRole('button', { name: /log activity/i }))

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /subject/i })).toHaveValue('')
    })
  })

  it('disables submit button while submitting', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.selectOptions(screen.getByRole('combobox', { name: /type/i }), 'email')
    await user.type(screen.getByRole('textbox', { name: /subject/i }), 'Subject')
    await user.type(screen.getByRole('textbox', { name: /note/i }), 'Note')
    await user.click(screen.getByRole('button', { name: /log activity/i }))

    expect(screen.getByRole('button', { name: /log activity/i })).toBeDisabled()
    await waitFor(() => expect(screen.getByRole('button', { name: /log activity/i })).not.toBeDisabled())
  })
})
