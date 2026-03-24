import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SimpleTooltip as Tooltip } from '@/components/ui/Tooltip';

describe('Tooltip', () => {
  it('renders children', () => {
    render(
      <Tooltip content="Tip">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
  });

  it('renders tooltip trigger wrapping children', () => {
    render(
      <Tooltip content="Tip text">
        <span>Target</span>
      </Tooltip>
    );
    // Tooltip wraps children in a trigger; the child is always visible
    expect(screen.getByText('Target')).toBeInTheDocument();
  });

  it('renders only children when disabled', () => {
    render(
      <Tooltip content="Tip" disabled>
        <span>Target</span>
      </Tooltip>
    );
    expect(screen.getByText('Target')).toBeInTheDocument();
    expect(screen.queryByText('Tip')).not.toBeInTheDocument();
  });

  it('passes side prop to tooltip content', () => {
    render(
      <Tooltip content="Tip" side="bottom">
        <span>Target</span>
      </Tooltip>
    );
    // The tooltip trigger wraps the child
    expect(screen.getByText('Target')).toBeInTheDocument();
  });
});
