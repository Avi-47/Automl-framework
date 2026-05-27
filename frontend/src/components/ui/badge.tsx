import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const badgeVariants = cva('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', {
  variants: {
    variant: {
      default: 'bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-300/20',
      secondary: 'bg-white/10 text-slate-200 ring-1 ring-white/10',
      success: 'bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/20',
      warning: 'bg-amber-400/15 text-amber-200 ring-1 ring-amber-300/20',
    },
  },
  defaultVariants: { variant: 'default' },
});

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}