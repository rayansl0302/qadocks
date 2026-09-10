import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, id, className, ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <label className="flex flex-col gap-1.5 text-sm" htmlFor={inputId}>
      <span className="font-medium text-ink">{label}</span>
      <input
        id={inputId}
        className={cn(
          'rounded-xl border border-line bg-surface px-3 py-2.5 text-ink outline-none placeholder:text-muted/70',
          error && 'border-danger',
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  );
}
