import { cn } from '@/lib/utils';
import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-[#EDEDED]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full rounded-lg bg-[#111111] border border-[#1F1F1F] px-3 py-2.5 text-sm text-[#EDEDED]',
            'placeholder:text-[#6B7280]',
            'focus:outline-none focus:ring-2 focus:ring-[#5B21B6] focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'min-h-[44px]',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
