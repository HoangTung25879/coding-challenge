import { useState, useEffect } from 'react';
import { Pencil, Check, X, Loader2 } from 'lucide-react';

interface InlineEditFieldProps<T> {
  label: string;
  value: T;
  displayValue?: string;
  renderDisplay?: () => React.ReactNode;
  isEditing: boolean;
  onEditRequest: () => void;
  onCancel: () => void;
  renderInput: (props: { value: T; onChange: (val: T) => void }) => React.ReactNode;
  onSave: (newValue: T) => Promise<void>;
}

export function InlineEditField<T>({
  label,
  value,
  displayValue,
  renderDisplay,
  isEditing,
  onEditRequest,
  onCancel,
  renderInput,
  onSave,
}: InlineEditFieldProps<T>) {
  const [localValue, setLocalValue] = useState<T>(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync localValue to the current prop value whenever edit mode opens.
  // This ensures the user always starts editing from the latest saved value,
  // including after an optimistic update has been applied by the parent.
  useEffect(() => {
    if (isEditing) setLocalValue(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  const display =
    displayValue ??
    (value !== null && value !== undefined && String(value) !== '' ? String(value) : '—');

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      await onSave(localValue);
      onCancel(); // success → return to idle via parent
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleSave();
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  }

  if (!isEditing) {
    return (
      <div className="group -mx-2 flex min-h-[28px] items-center gap-2 rounded px-2 py-0.5 transition-colors hover:bg-gray-100">
        {renderDisplay ? renderDisplay() : <span className="text-sm text-gray-900">{display}</span>}
        <button
          type="button"
          aria-label={`Edit ${label}`}
          onClick={onEditRequest}
          className="cursor-pointer rounded p-0.5 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-gray-600 focus:opacity-100"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1" onKeyDown={handleKeyDown}>
      <div className="flex items-center gap-2">
        <div className="flex-1">{renderInput({ value: localValue, onChange: setLocalValue })}</div>
        <button
          type="button"
          aria-label="Save"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="rounded p-1 text-green-600 hover:bg-green-50 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </button>
        <button
          type="button"
          aria-label="Cancel"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded p-1 text-red-600 hover:bg-gray-100 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
