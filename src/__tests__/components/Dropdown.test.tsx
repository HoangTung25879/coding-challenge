import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Dropdown } from '@/components/ui/Dropdown';

describe('Dropdown', () => {
  it('renders trigger and hides content by default', () => {
    render(
      <Dropdown trigger={<button>Open</button>}>
        <div>Content</div>
      </Dropdown>
    );
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('shows content on trigger click', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown trigger={<button>Open</button>}>
        <div>Content</div>
      </Dropdown>
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown trigger={<button>Open</button>}>
        <div>Content</div>
      </Dropdown>
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByText('Content')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('closes on outside click', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Dropdown trigger={<button>Open</button>}>
          <div>Content</div>
        </Dropdown>
        <div data-testid="outside">Outside</div>
      </div>
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByText('Content')).toBeInTheDocument();
    await user.click(screen.getByTestId('outside'));
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('supports controlled mode', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Dropdown trigger={<button>Open</button>} open={false} onOpenChange={onOpenChange}>
        <div>Content</div>
      </Dropdown>
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('aligns right when specified', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown trigger={<button>Open</button>} align="right">
        <div>Content</div>
      </Dropdown>
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const panel = screen.getByText('Content').parentElement;
    expect(panel?.className).toContain('right-0');
  });
});
