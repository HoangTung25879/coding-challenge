// src/__tests__/components/LeadFilters.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { LeadFilters } from '@/components/leads/LeadFilters';

function renderWithRouter(ui: React.ReactElement, { search = '' } = {}) {
  return render(<MemoryRouter initialEntries={[`/leads${search}`]}>{ui}</MemoryRouter>);
}

describe('LeadFilters', () => {
  it('renders source dropdown', () => {
    renderWithRouter(<LeadFilters />);
    expect(screen.getByRole('combobox', { name: /source/i })).toBeInTheDocument();
  });

  it('includes "other" in source options', async () => {
    renderWithRouter(<LeadFilters />);
    await userEvent.click(screen.getByRole('combobox', { name: /source/i }));
    expect(screen.getByRole('option', { name: /other/i, hidden: true })).toBeInTheDocument();
  });

  it('includes all 7 source values', async () => {
    renderWithRouter(<LeadFilters />);
    await userEvent.click(screen.getByRole('combobox', { name: /source/i }));
    const optionTexts = screen
      .getAllByRole('option', { hidden: true })
      .map((o) => o.textContent?.trim());
    const expected = [
      'Website',
      'Referral',
      'Walk-in',
      'Phone',
      'Social Media',
      'Dealer Event',
      'Other',
    ];
    expect(optionTexts).toEqual(expect.arrayContaining(expected));
  });
});
