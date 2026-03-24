import type { Header } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import type { Lead } from '@/types'
import { ArrowUp, ArrowDown } from 'lucide-react'

type Props = {
  header: Header<Lead, unknown>
  isSticky?: boolean
  stickyOffset?: number
}

export function ColumnHeader({ header, isSticky, stickyOffset = 0 }: Props) {
  const canSort = header.column.getCanSort()
  const sorted = header.column.getIsSorted()

  const ariaSort = sorted === 'asc'
    ? 'ascending' as const
    : sorted === 'desc'
      ? 'descending' as const
      : 'none' as const

  const isRightSticky = header.column.id === 'actions'
  const stickyStyles: React.CSSProperties = isSticky
    ? isRightSticky
      ? { position: 'sticky', right: 0, zIndex: 10 }
      : { position: 'sticky', left: stickyOffset, zIndex: 10 }
    : {}
  return (
    <th
      className={`relative select-none whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-gray-500 ${isSticky ? 'bg-gray-50' : 'bg-gray-50'
        }${isRightSticky && isSticky ? ' border-l border-gray-200' : ''}`}
      style={{
        width: header.getSize(),
        ...stickyStyles,
      }}
      aria-sort={canSort ? ariaSort : undefined}
      aria-label={isSticky ? `${String(header.column.columnDef.header ?? header.column.id)} (pinned)` : undefined}
      colSpan={header.colSpan}
    >
      <div className="flex items-center gap-1">
        {canSort ? (
          <button
            type="button"
            className="flex items-center gap-1 hover:text-gray-900"
            onClick={header.column.getToggleSortingHandler()}
          >
            {flexRender(header.column.columnDef.header, header.getContext())}
            {sorted === 'asc' && <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />}
            {sorted === 'desc' && <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />}
          </button>
        ) : (
          flexRender(header.column.columnDef.header, header.getContext())
        )}

      </div>

      {header.column.getCanResize() && (
        <div
          role="separator"
          aria-orientation="vertical"
          className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none hover:bg-blue-400 ${header.column.getIsResizing() ? 'bg-blue-500' : 'bg-transparent'
            }`}
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          onDoubleClick={() => header.column.resetSize()}
        />
      )}
    </th>
  )
}
