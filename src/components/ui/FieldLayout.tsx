import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function FieldLayout({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'grid gap-2',
        hint && 'lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start lg:gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]',
      )}
    >
      <label className="flex min-w-0 flex-col gap-1.5 text-sm" htmlFor={htmlFor}>
        <span className="font-medium text-ink">{label}</span>
        {children}
        {error ? <span className="text-xs text-danger">{error}</span> : null}
      </label>
      {hint ? <p className="rounded-xl bg-paper px-3 py-2 text-xs leading-5 text-muted lg:mt-7">{hint}</p> : null}
    </div>
  );
}
