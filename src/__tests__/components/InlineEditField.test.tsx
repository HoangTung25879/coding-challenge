import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { InlineEditField } from '@/components/leads/InlineEditField';

function renderField({
  value = 'Initial',
  isEditing = false,
  onEditRequest = vi.fn(),
  onCancel = vi.fn(),
  onSave = vi.fn().mockResolvedValue(undefined),
}: Partial<{
  value: string;
  isEditing: boolean;
  onEditRequest: () => void;
  onCancel: () => void;
  onSave: (v: string) => Promise<void>;
}> = {}) {
  return render(
    <InlineEditField
      label="Status"
      value={value}
      isEditing={isEditing}
      onEditRequest={onEditRequest}
      onCancel={onCancel}
      renderInput={({ value: v, onChange }) => (
        <input aria-label="Status input" value={v} onChange={(e) => onChange(e.target.value)} />
      )}
      onSave={onSave}
    />
  );
}

describe('InlineEditField', () => {
  it('renders display value with pencil button in idle state', () => {
    renderField({ value: 'qualified' });
    expect(screen.getByText('qualified')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit status/i })).toBeInTheDocument();
  });

  it('calls onEditRequest when pencil is clicked', async () => {
    const onEditRequest = vi.fn();
    renderField({ onEditRequest });
    await userEvent.click(screen.getByRole('button', { name: /edit status/i }));
    expect(onEditRequest).toHaveBeenCalledOnce();
  });

  it('renders input and save/cancel buttons when isEditing=true', () => {
    renderField({ isEditing: true });
    expect(screen.getByRole('textbox', { name: /status input/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('calls onSave with new value when Save is clicked', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    renderField({ isEditing: true, onSave });
    const input = screen.getByRole('textbox', { name: /status input/i });
    await userEvent.clear(input);
    await userEvent.type(input, 'won');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith('won'));
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn();
    renderField({ isEditing: true, onCancel });
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('shows error message when onSave rejects', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('Save failed'));
    renderField({ isEditing: true, onSave });
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(screen.getByText('Save failed')).toBeInTheDocument());
    // Field stays in editing state
    expect(screen.getByRole('textbox', { name: /status input/i })).toBeInTheDocument();
  });

  it('shows — when value is empty string', () => {
    renderField({ value: '' });
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
