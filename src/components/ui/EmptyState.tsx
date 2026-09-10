import type { ReactNode } from 'react';

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-line bg-surface px-6 py-10">
      <h3 className="font-display text-xl text-ink">{title}</h3>
      <p className="max-w-lg text-sm text-muted">{description}</p>
      {action}
    </div>
  );
}
