import { useState } from 'react'
import type { Table } from '@tanstack/react-table'
import type { Lead } from '@/types'
import { Dropdown } from '@/components/ui/Dropdown'
import { Button } from '@/components/ui/Button'
import { Settings } from 'lucide-react'

type Props = {
  table: Table<Lead>
}

export function ColumnVisibilityToggle({ table }: Props) {
  const [open, setOpen] = useState(false)
  const allColumns = table.getAllLeafColumns().filter(col => col.getCanHide())

  return (
    <Dropdown
      trigger={
        <Button variant="secondary" size="md" leftIcon={<Settings className="h-4 w-4" />} aria-expanded={open} aria-haspopup="true">
          Columns
        </Button>
      }
      align="right"
      open={open}
      onOpenChange={setOpen}
    >
      <div className="w-56">
        {allColumns.map((column) => (
          <label
            key={column.id}
            className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={column.getIsVisible()}
              onChange={column.getToggleVisibilityHandler()}
              className="rounded border-gray-300"
            />
            {String(column.columnDef.header ?? column.id)}
          </label>
        ))}
      </div>
    </Dropdown>
  )
}
