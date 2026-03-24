import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from '@/components/ui/Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Hello</Badge>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('applies blue variant classes', () => {
    render(<Badge variant="blue">Blue</Badge>);
    expect(screen.getByText('Blue').className).toContain('bg-blue-100');
    expect(screen.getByText('Blue').className).toContain('text-blue-800');
  });

  it('applies gray variant by default', () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText('Default').className).toContain('bg-gray-100');
  });

  it('applies all variant color schemes', () => {
    const { rerender } = render(<Badge variant="yellow">Y</Badge>);
    expect(screen.getByText('Y').className).toContain('bg-yellow-100');

    rerender(<Badge variant="purple">P</Badge>);
    expect(screen.getByText('P').className).toContain('bg-purple-100');

    rerender(<Badge variant="red">R</Badge>);
    expect(screen.getByText('R').className).toContain('bg-red-100');

    rerender(<Badge variant="emerald">E</Badge>);
    expect(screen.getByText('E').className).toContain('bg-emerald-100');
  });
});
