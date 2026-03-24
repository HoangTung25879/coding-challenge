// src/__tests__/components/LeadFilters.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { LeadFilters } from '@/components/leads/LeadFilters'

function renderWithRouter(ui: React.ReactElement, { search = '' } = {}) {
  return render(
    <MemoryRouter initialEntries={[`/leads${search}`]}>
      {ui}
    </MemoryRouter>
  )
}

describe('LeadFilters', () => {
  it('renders source dropdown', () => {
    renderWithRouter(<LeadFilters />)
    expect(screen.getByRole('combobox', { name: /source/i })).toBeInTheDocument()
  })

  it('includes "other" in source options', () => {
    renderWithRouter(<LeadFilters />)
    const select = screen.getByRole('combobox', { name: /source/i }) as HTMLSelectElement
    const options = Array.from(select.options).map(o => o.value)
    expect(options).toContain('other')
  })

  it('includes all 7 source values', () => {
    renderWithRouter(<LeadFilters />)
    const select = screen.getByRole('combobox', { name: /source/i }) as HTMLSelectElement
    const values = Array.from(select.options).map(o => o.value).filter(v => v !== '')
    expect(values).toEqual(
      expect.arrayContaining(['website', 'referral', 'walk-in', 'phone', 'social-media', 'dealer-event', 'other'])
    )
  })
})
