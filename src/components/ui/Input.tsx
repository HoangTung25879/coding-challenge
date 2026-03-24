import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ leftIcon, rightIcon, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full rounded-md border bg-white py-1.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            } ${leftIcon ? 'pl-8' : 'pl-3'} ${rightIcon ? 'pr-8' : 'pr-3'} ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'
