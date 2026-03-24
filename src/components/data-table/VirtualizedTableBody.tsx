import { useVirtualizer } from '@tanstack/react-virtual';
import type { Table } from '@tanstack/react-table';
import type { Lead } from '@/types';
import { TableRow } from './TableRow';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';

const ROW_HEIGHT = 44;
const OVERSCAN = 5;

type Props = {
  table: Table<Lead>;
  stickyColumns: string[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  pageSize: number;
  parentRef: React.RefObject<HTMLDivElement | null>;
  onRetry?: () => void;
  onClearFilters?: () => void;
};

export function VirtualizedTableBody({
  table,
  stickyColumns,
  isLoading,
  isError,
  error,
  pageSize,
  parentRef,
  onRetry,
  onClearFilters,
}: Props) {
  const rows = table.getRowModel().rows;

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
  });

  if (isLoading) {
    return (
      <tbody aria-busy="true">
        {Array.from({ length: pageSize }).map((_, i) => (
          <tr key={i} aria-hidden="true">
            {table.getVisibleLeafColumns().map((col) => (
              <td key={col.id} className="px-3 py-2">
                <Skeleton className="h-4 w-full" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  }

  if (isError) {
    return (
      <tbody>
        <tr>
          <td colSpan={table.getVisibleLeafColumns().length} className="px-6 py-16 text-center">
            <div className="space-y-3">
              <p className="font-medium text-red-600">Failed to load leads</p>
              <p className="text-sm text-gray-500">{error?.message}</p>
              {onRetry && (
                <Button variant="default" size="default" onClick={onRetry}>
                  Retry
                </Button>
              )}
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  if (rows.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={table.getVisibleLeafColumns().length} className="px-6 py-16 text-center">
            <div className="space-y-3">
              <p className="font-medium text-gray-500">No leads match your filters</p>
              {onClearFilters && (
                <Button variant="secondary" size="default" onClick={onClearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  const virtualRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <tbody style={{ height: totalSize, position: 'relative' }}>
      {virtualRows.map((virtualRow) => {
        const row = rows[virtualRow.index];
        return (
          <TableRow
            key={row.id}
            row={row}
            stickyColumns={stickyColumns}
            style={{
              position: 'absolute',
              top: `${virtualRow.start}px`,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
            }}
          />
        );
      })}
    </tbody>
  );
}
