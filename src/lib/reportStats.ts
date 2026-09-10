import type { Issue, IssueStatus, IssueType, Severity } from '@/types';

export interface ReportStats {
  total: number;
  approved: number;
  rejected: number;
  blocked: number;
  byType: Record<IssueType, number>;
  bySeverity: Record<Severity, number>;
  byStatus: Record<IssueStatus, number>;
}

export function buildReportStats(issues: Issue[]): ReportStats {
  const byType: ReportStats['byType'] = { bug: 0, feature: 0, melhoria: 0, correcao: 0 };
  const bySeverity: ReportStats['bySeverity'] = { critica: 0, alta: 0, media: 0, baixa: 0 };
  const byStatus = {
    aberto: 0,
    em_analise: 0,
    em_desenvolvimento: 0,
    corrigido: 0,
    retestado: 0,
    aprovado: 0,
    rejeitado: 0,
    reprovado: 0,
    bloqueado: 0,
  } satisfies Record<IssueStatus, number>;

  issues.forEach((issue) => {
    byType[issue.type] += 1;
    bySeverity[issue.severity] += 1;
    byStatus[issue.status] += 1;
  });

  return {
    total: issues.length,
    approved: byStatus.aprovado,
    rejected: byStatus.reprovado + byStatus.rejeitado,
    blocked: byStatus.bloqueado,
    byType,
    bySeverity,
    byStatus,
  };
}
