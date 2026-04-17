import { cn } from '@/lib/utils';

type Variant = 'success' | 'warning' | 'error' | 'neutral';

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  error: 'bg-red-500/15 text-red-400 border border-red-500/20',
  neutral: 'bg-[#1F1F1F] text-[#9CA3AF] border border-[#2D2D2D]',
};

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
