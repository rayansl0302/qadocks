import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Card({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cn('rounded-2xl border border-line bg-surface p-5 shadow-sm', className)}>
      {children}
    </section>
  );
}
