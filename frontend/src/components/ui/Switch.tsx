import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, ...props }, ref) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        ref={ref}
        className="sr-only peer"
        {...props}
      />
      <div className={cn(
        'w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600',
        className
      )} />
    </label>
  )
)
Switch.displayName = 'Switch'