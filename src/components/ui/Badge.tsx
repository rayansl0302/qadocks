import { cn } from '@/lib/cn';
import {
  ISSUE_STATUS_LABEL,
  ISSUE_TYPE_ICON,
  ISSUE_TYPE_LABEL,
  PRIORITY_LABEL,
  SEVERITY_LABEL,
} from '@/lib/constants';
import type { IssueStatus, IssueType, Priority, Severity } from '@/types';

const severityClass: Record<Severity, string> = {
  critica: 'bg-red-100 text-red-800',
  alta: 'bg-orange-100 text-orange-800',
  media: 'bg-amber-100 text-amber-800',
  baixa: 'bg-lime-100 text-lime-800',
};

const statusClass: Record<IssueStatus, string> = {
  aberto: 'bg-sky-100 text-sky-800',
  em_analise: 'bg-indigo-100 text-indigo-800',
  em_desenvolvimento: 'bg-violet-100 text-violet-800',
  corrigido: 'bg-emerald-100 text-emerald-800',
  retestado: 'bg-cyan-100 text-cyan-800',
  aprovado: 'bg-green-100 text-green-800',
  rejeitado: 'bg-rose-100 text-rose-800',
  reprovado: 'bg-red-100 text-red-800',
  bloqueado: 'bg-stone-200 text-stone-800',
};

export function SeverityBadge({ value }: { value: Severity }) {
  return <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', severityClass[value])}>{SEVERITY_LABEL[value]}</span>;
}

export function StatusBadge({ value }: { value: IssueStatus }) {
  return <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', statusClass[value])}>{ISSUE_STATUS_LABEL[value]}</span>;
}

export function TypeBadge({ value }: { value: IssueType }) {
  return (
    <span className="rounded-full bg-teal/10 px-2.5 py-1 text-xs font-semibold text-teal">
      {ISSUE_TYPE_ICON[value]} {ISSUE_TYPE_LABEL[value]}
    </span>
  );
}

export function PriorityBadge({ value }: { value: Priority }) {
  return <span className="rounded-full bg-paper px-2.5 py-1 text-xs font-semibold text-ink">{PRIORITY_LABEL[value]}</span>;
}
