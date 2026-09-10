import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  children: ReactNode;
}

export function Button({ variant = 'primary', className, children, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' && 'bg-teal text-paper hover:bg-teal-soft',
        variant === 'secondary' && 'border border-line bg-surface text-ink hover:bg-paper',
        variant === 'ghost' && 'text-muted hover:bg-paper hover:text-ink',
        variant === 'danger' && 'bg-danger text-white hover:bg-red-800',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
