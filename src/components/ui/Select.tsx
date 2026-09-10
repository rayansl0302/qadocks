import type { SelectHTMLAttributes } from 'react';
import { FieldLayout } from '@/components/ui/FieldLayout';
import { cn } from '@/lib/cn';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
}

export function Select({ label, options, error, hint, id, className, ...props }: SelectProps) {
  const inputId = id ?? props.name;
  return (
    <FieldLayout label={label} htmlFor={inputId} error={error} hint={hint}>
      <select
        id={inputId}
        className={cn(
          'rounded-xl border border-line bg-surface px-3 py-2.5 text-ink outline-none',
          error && 'border-danger',
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldLayout>
  );
}
