import type { TextareaHTMLAttributes } from 'react';
import { FieldLayout } from '@/components/ui/FieldLayout';
import { cn } from '@/lib/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, id, className, rows = 4, ...props }: TextareaProps) {
  const inputId = id ?? props.name;
  return (
    <FieldLayout label={label} htmlFor={inputId} error={error} hint={hint}>
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
    </FieldLayout>
  );
}
