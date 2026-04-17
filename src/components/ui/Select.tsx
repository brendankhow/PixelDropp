import { cn } from '@/lib/utils';
import { type SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-[#EDEDED]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            'w-full rounded-lg bg-[#111111] border border-[#1F1F1F] px-3 py-2.5 text-sm text-[#EDEDED]',
            'focus:outline-none focus:ring-2 focus:ring-[#5B21B6] focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'min-h-[44px]',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
