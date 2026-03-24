import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type Props = {
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmModal({ onConfirm, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 id="delete-confirm-title" className="text-lg font-semibold text-gray-900">
            Delete Lead
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onCancel}
            className="p-1 rounded text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this lead? This action cannot be undone.
          </p>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <Button variant="secondary" size="md" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" size="md" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
