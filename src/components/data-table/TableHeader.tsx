import type { Table } from '@tanstack/react-table'
import type { Lead } from '@/types'
import { ColumnHeader } from './ColumnHeader'

type Props = {
  table: Table<Lead>
  stickyColumns: string[]
}

export function TableHeader({ table, stickyColumns }: Props) {
  return (
    <>
      <colgroup>
        {table.getVisibleLeafColumns().map((column) => (
          <col key={column.id} style={{ width: column.getSize() }} />
        ))}
      </colgroup>
      <thead className="sticky top-0 z-10 bg-white">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const isSticky = stickyColumns.includes(header.column.id)
              return (
                <ColumnHeader
                  key={header.id}
                  header={header}
                  isSticky={isSticky}
                />
              )
            })}
          </tr>
        ))}
      </thead>
    </>
  )
}
