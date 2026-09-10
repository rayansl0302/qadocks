import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function Textarea({ label, error, id, className, rows = 4, ...props }: TextareaProps) {
  const inputId = id ?? props.name;
  return (
    <label className="flex flex-col gap-1.5 text-sm" htmlFor={inputId}>
      <span className="font-medium text-ink">{label}</span>
      <textarea
        id={inputId}
        rows={rows}
        className={cn(
          'resize-y rounded-xl border border-line bg-surface px-3 py-2.5 text-ink outline-none placeholder:text-muted/70',
          error && 'border-danger',
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  );
}
