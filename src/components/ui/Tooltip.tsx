import type { ReactNode } from 'react'

type TooltipSide = 'top' | 'bottom' | 'left' | 'right'

type TooltipProps = {
  content: ReactNode
  children: ReactNode
  side?: TooltipSide
  disabled?: boolean
}

const sideClasses: Record<TooltipSide, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

export function Tooltip({ content, children, side = 'top', disabled = false }: TooltipProps) {
  return (
    <div className="group relative inline-flex">
      {children}
      {!disabled && (
        <div
          role="tooltip"
          className={`pointer-events-none absolute z-50 hidden max-w-xs rounded-md bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-md group-hover:block ${sideClasses[side]}`}
        >
          {content}
        </div>
      )}
    </div>
  )
}
