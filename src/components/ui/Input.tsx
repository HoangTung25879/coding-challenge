import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { cn } from '@/lib/utils';

// Shadcn base input (also exported as lowercase 'input' alias)
function BaseInput({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'border-input file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-8 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm',
        className
      )}
      {...props}
    />
  );
}

// Extended Input with icon and error support
type InputProps = React.ComponentProps<'input'> & {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ leftIcon, rightIcon, error, className, ...props }, ref) => {
    if (!leftIcon && !rightIcon && !error) {
      return <BaseInput ref={ref} aria-invalid={undefined} className={className} {...props} />;
    }
    return (
      <div className="w-full">
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <BaseInput
            ref={ref}
            aria-invalid={error ? true : undefined}
            className={cn(leftIcon && 'pl-8', rightIcon && 'pr-8', className)}
            {...props}
          />
          {rightIcon && (
            <div className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
