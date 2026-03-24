import type { Table } from '@tanstack/react-table';
import type { Lead } from '@/types';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Settings } from 'lucide-react';

type Props = {
  table: Table<Lead>;
};

export function ColumnVisibilityToggle({ table }: Props) {
  const allColumns = table.getAllLeafColumns().filter((col) => col.getCanHide());

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" size="default">
            <Settings className="h-4 w-4" />
            Columns
          </Button>
        }
      />
      <PopoverContent align="end" className="w-56 p-1">
        {allColumns.map((column) => (
          <label
            key={column.id}
            className="flex cursor-pointer items-center gap-2 rounded px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            <Checkbox
              checked={column.getIsVisible()}
              onCheckedChange={(checked) => column.toggleVisibility(Boolean(checked))}
            />
            {String(column.columnDef.header ?? column.id)}
          </label>
        ))}
      </PopoverContent>
    </Popover>
  );
}
