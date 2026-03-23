import type { Row } from '@tanstack/react-table'
import type { Lead } from '@/types'
import { TableCell } from './TableCell'

type Props = {
  row: Row<Lead>
  stickyColumns: string[]
  style?: React.CSSProperties
}

export function TableRow({ row, stickyColumns, style }: Props) {
  return (
    <tr
      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
      style={style}
    >
      {row.getVisibleCells().map((cell) => {
        const isSticky = stickyColumns.includes(cell.column.id)
        return (
          <TableCell
            key={cell.id}
            cell={cell}
            isSticky={isSticky}
          />
        )
      })}
    </tr>
  )
}
