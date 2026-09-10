import type { Issue, IssueStatus } from '@/types';

const RESOLVED_STATUSES: IssueStatus[] = ['aprovado', 'rejeitado'];

export function isIssueResolved(status: IssueStatus): boolean {
  return RESOLVED_STATUSES.includes(status);
}

export function splitIssuesByResolution(issues: Issue[]): { resolved: Issue[]; pending: Issue[] } {
  const resolved: Issue[] = [];
  const pending: Issue[] = [];

  issues.forEach((issue) => {
    if (isIssueResolved(issue.status)) {
      resolved.push(issue);
      return;
    }
    pending.push(issue);
  });

  return { resolved, pending };
}

export function buildFollowUpConclusion(cycleName: string, resolvedCount: number, pendingCount: number): string {
  const total = resolvedCount + pendingCount;
  return `No ciclo ${cycleName} foram cadastradas ${total} ocorrências. De acordo com o status registrado, ${resolvedCount} foram resolvidas (aprovadas ou rejeitadas) e ${pendingCount} permaneceram pendentes.`;
}

export function buildPendingConclusion(cycleName: string, totalCount: number, pendingCount: number): string {
  const resolvedCount = totalCount - pendingCount;
  return `Esta é a segunda versão do relatório do ciclo ${cycleName}, contendo apenas as ${pendingCount} ocorrências que permaneceram pendentes. Das ${totalCount} ocorrências cadastradas, ${resolvedCount} já foram resolvidas.`;
}
