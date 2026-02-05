import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <input
      type="checkbox"
      ref={ref}
      className={cn(
        'h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-700 dark:focus:ring-blue-500 dark:focus:ring-offset-slate-900',
        className
      )}
      {...props}
    />
  )
)
Checkbox.displayName = 'Checkbox'