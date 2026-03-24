import { useRef, useState, useEffect } from 'react'
import type { Cell } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import type { Lead } from '@/types'
import { Tooltip } from '@/components/ui/Tooltip'

type Props = {
  cell: Cell<Lead, unknown>
  isSticky?: boolean
  stickyOffset?: number
}

export function TableCell({ cell, isSticky, stickyOffset = 0 }: Props) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  useEffect(() => {
    const el = contentRef.current
    if (el) {
      setIsTruncated(el.scrollWidth > el.clientWidth)
    }
  })

  const isRightSticky = cell.column.id === 'actions'
  const stickyStyles: React.CSSProperties = isSticky
    ? isRightSticky
      ? { position: 'sticky', right: 0, zIndex: 5 }
      : { position: 'sticky', left: stickyOffset, zIndex: 5 }
    : {}

  const rendered = flexRender(cell.column.columnDef.cell, cell.getContext())

  return (
    <td
      className={`overflow-hidden px-3 py-2 text-sm text-gray-900 ${isSticky ? 'bg-white' : ''}${isRightSticky && isSticky ? ' border-l border-gray-200' : ''}`}
      style={{
        width: cell.column.getSize(),
        maxWidth: cell.column.getSize(),
        ...stickyStyles,
      }}
    >
      <Tooltip content={String(cell.getValue() ?? '')} disabled={!isTruncated}>
        <div ref={contentRef} className="truncate">
          {rendered}
        </div>
      </Tooltip>
    </td>
  )
}
