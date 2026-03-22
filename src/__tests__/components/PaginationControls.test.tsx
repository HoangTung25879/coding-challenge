// src/__tests__/components/PaginationControls.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PaginationControls } from '@/components/leads/PaginationControls'

function renderWithProviders(ui: React.ReactElement, initialPath = '/leads?page=2') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('PaginationControls', () => {
  it('renders previous and next buttons', () => {
    renderWithProviders(<PaginationControls page={2} totalPages={5} />)
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })

  it('disables previous button on page 1', () => {
    renderWithProviders(<PaginationControls page={1} totalPages={5} />, '/leads?page=1')
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
  })

  it('disables next button on last page', () => {
    renderWithProviders(<PaginationControls page={5} totalPages={5} />, '/leads?page=5')
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('shows current page and total pages', () => {
    renderWithProviders(<PaginationControls page={2} totalPages={5} />)
    expect(screen.getByText(/2/)).toBeInTheDocument()
    expect(screen.getByText(/5/)).toBeInTheDocument()
  })
})
