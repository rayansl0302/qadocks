import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
}

export function Select({ label, options, error, id, className, ...props }: SelectProps) {
  const inputId = id ?? props.name;
  return (
    <label className="flex flex-col gap-1.5 text-sm" htmlFor={inputId}>
      <span className="font-medium text-ink">{label}</span>
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
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  );
}
