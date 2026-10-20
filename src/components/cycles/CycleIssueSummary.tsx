import { StatusBadge } from '@/components/ui/Badge';
import { ISSUE_STATUSES } from '@/lib/constants';
import type { CycleStatusCounts } from '@/services/issueService';

export function CycleIssueSummary({ counts }: { counts?: CycleStatusCounts }) {
  const total = ISSUE_STATUSES.reduce((sum, status) => sum + (counts?.[status] ?? 0), 0);

  if (total === 0) {
    return <p className="mt-3 text-xs text-muted">Nenhuma ocorrência registrada.</p>;
  }

  return (
    <div className="mt-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        {total} {total === 1 ? 'ocorrência' : 'ocorrências'}
      </p>
      <div className="flex flex-wrap gap-2">
        {ISSUE_STATUSES.filter((status) => (counts?.[status] ?? 0) > 0).map((status) => (
          <StatusBadge key={status} value={status} count={counts?.[status]} />
        ))}
      </div>
    </div>
  );
}
