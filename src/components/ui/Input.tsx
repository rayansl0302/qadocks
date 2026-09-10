import type { InputHTMLAttributes } from 'react';
import { FieldLayout } from '@/components/ui/FieldLayout';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, id, className, ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <FieldLayout label={label} htmlFor={inputId} error={error} hint={hint}>
      <input
        id={inputId}
        className={cn(
          'rounded-xl border border-line bg-surface px-3 py-2.5 text-ink outline-none placeholder:text-muted/70',
          error && 'border-danger',
          className,
        )}
        {...props}
      />
    </FieldLayout>
  );
}
