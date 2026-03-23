// src/__tests__/components/PaginationControls.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PaginationControls } from '@/components/leads/PaginationControls'
import type { LeadsParams } from '@/lib/api'

const defaultParams: LeadsParams = { page: 2, limit: 10 }

function renderControls(props: Partial<React.ComponentProps<typeof PaginationControls>> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <PaginationControls
        page={2}
        totalPages={5}
        params={defaultParams}
        onPageChange={vi.fn()}
        {...props}
      />
    </QueryClientProvider>
  )
}

describe('PaginationControls', () => {
  it('renders previous and next buttons', () => {
    renderControls()
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })

  it('disables previous button on page 1', () => {
    renderControls({ page: 1 })
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
  })

  it('disables next button on last page', () => {
    renderControls({ page: 5 })
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('shows current page and total pages', () => {
    renderControls()
    expect(screen.getByText(/2/)).toBeInTheDocument()
    expect(screen.getByText(/5/)).toBeInTheDocument()
  })

  it('has aria-label="Pagination"', () => {
    renderControls()
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument()
  })

  it('has aria-current="page" on current page number', () => {
    renderControls()
    expect(screen.getByText('2')).toHaveAttribute('aria-current', 'page')
  })
})
