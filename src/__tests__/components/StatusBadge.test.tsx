// src/__tests__/components/StatusBadge.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from '@/components/ui/StatusBadge';

describe('StatusBadge', () => {
  it('renders the status label', () => {
    render(<StatusBadge status="new" />);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders all valid statuses without throwing', () => {
    const statuses = ['new', 'contacted', 'qualified', 'unqualified'] as const;
    for (const status of statuses) {
      const { unmount } = render(<StatusBadge status={status} />);
      unmount();
    }
  });

  it('applies a colour class based on status', () => {
    const { container } = render(<StatusBadge status="qualified" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toMatch(/emerald/);
  });
});
