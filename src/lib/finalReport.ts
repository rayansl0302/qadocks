import { SEVERITY_ORDER } from '@/lib/constants';
import { buildReportStats, type ReportStats } from '@/lib/reportStats';
import type { Issue, IssueStatus, TestCycle } from '@/types';

/** Status que contam como resolvido nas considerações finais. */
const RESOLVED_STATUSES: IssueStatus[] = ['aprovado', 'corrigido'];

export const RESOLVED_STATUSES_LABEL = 'Aprovado ou Corrigido';

function isIssueResolved(status: IssueStatus): boolean {
  return RESOLVED_STATUSES.includes(status);
}

export interface CycleSummary {
  cycle: TestCycle;
  issues: Issue[];
  stats: ReportStats;
  resolved: number;
  pending: number;
  /** Percentual (0-100) de ocorrências resolvidas no ciclo. */
  resolutionRate: number;
  /** Ocorrências de severidade crítica ou alta. */
  highSeverity: number;
}

export interface FinalReportData {
  cycles: CycleSummary[];
  allIssues: Issue[];
  stats: ReportStats;
  resolved: number;
  pending: number;
  resolutionRate: number;
  pendingIssues: Issue[];
  /** Pendências de severidade crítica ou alta ainda não resolvidas. */
  pendingHigh: number;
  startDate: string;
  endDate: string;
}

export interface FinalReportTexts {
  summary: string;
  evolution: string;
  considerations: string;
  recommendations: string;
}

function percent(part: number, total: number): number {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

function cycleSortKey(cycle: TestCycle): number {
  const start = new Date(cycle.startDate).getTime();
  return Number.isNaN(start) ? cycle.createdAt.getTime() : start;
}

function summarizeCycle(cycle: TestCycle, issues: Issue[]): CycleSummary {
  const resolved = issues.filter((issue) => isIssueResolved(issue.status)).length;
  return {
    cycle,
    issues,
    stats: buildReportStats(issues),
    resolved,
    pending: issues.length - resolved,
    resolutionRate: percent(resolved, issues.length),
    highSeverity: issues.filter((issue) => issue.severity === 'critica' || issue.severity === 'alta').length,
  };
}

export function buildFinalReportData(
  cycles: TestCycle[],
  issuesByCycle: Record<string, Issue[]>,
): FinalReportData {
  const summaries = [...cycles]
    .sort((left, right) => cycleSortKey(left) - cycleSortKey(right))
    .map((cycle) => summarizeCycle(cycle, issuesByCycle[cycle.id] ?? []));

  const allIssues = summaries.flatMap((item) => item.issues);
  const resolved = summaries.reduce((sum, item) => sum + item.resolved, 0);
  const pendingIssues = allIssues
    .filter((issue) => !isIssueResolved(issue.status))
    .sort((left, right) => SEVERITY_ORDER[right.severity] - SEVERITY_ORDER[left.severity]);

  const starts = summaries.map((item) => item.cycle.startDate).filter((value) => value).sort();
  const ends = summaries.map((item) => item.cycle.endDate).filter((value) => value).sort();

  return {
    cycles: summaries,
    allIssues,
    stats: buildReportStats(allIssues),
    resolved,
    pending: allIssues.length - resolved,
    resolutionRate: percent(resolved, allIssues.length),
    pendingIssues,
    pendingHigh: pendingIssues.filter((issue) => issue.severity === 'critica' || issue.severity === 'alta').length,
    startDate: starts[0] ?? '',
    endDate: ends[ends.length - 1] ?? '',
  };
}

export function buildCycleNarrative(item: CycleSummary, previous?: CycleSummary): string {
  const { stats } = item;
  if (item.issues.length === 0) {
    return 'Nenhuma ocorrência foi registrada neste ciclo.';
  }
  const base = `Foram registradas ${item.issues.length} ocorrências (${stats.byType.bug} bugs, ${stats.byType.feature} features, ${stats.byType.melhoria} melhorias e ${stats.byType.correcao} correções). ${item.resolved} foram resolvidas (${item.resolutionRate}%) e ${item.pending} ficaram pendentes.`;
  if (!previous) {
    return `${base} Primeiro ciclo do projeto, usado como linha de base.`;
  }
  const diff = item.issues.length - previous.issues.length;
  const volume =
    diff < 0
      ? `${Math.abs(diff)} ocorrência(s) a menos que em ${previous.cycle.name}`
      : diff > 0
        ? `${diff} ocorrência(s) a mais que em ${previous.cycle.name}`
        : `o mesmo volume de ${previous.cycle.name}`;
  const rate = item.resolutionRate - previous.resolutionRate;
  const rateText =
    rate > 0
      ? `taxa de resolução ${rate} p.p. maior`
      : rate < 0
        ? `taxa de resolução ${Math.abs(rate)} p.p. menor`
        : 'taxa de resolução igual';
  return `${base} Em relação ao ciclo anterior: ${volume} e ${rateText}.`;
}

export function buildFinalReportTexts(projectName: string, data: FinalReportData): FinalReportTexts {
  const { cycles, stats } = data;
  const cycleCount = cycles.length;

  if (data.allIssues.length === 0) {
    return {
      summary: `O projeto ${projectName} teve ${cycleCount} ciclo(s) de teste concluído(s) sem ocorrências registradas.`,
      evolution: '',
      considerations: 'Não foram registradas ocorrências durante os ciclos de teste.',
      recommendations: '',
    };
  }

  const summary = `Ao longo de ${cycleCount} ciclo(s) de teste do projeto ${projectName}, foram registradas ${data.allIssues.length} ocorrências (${stats.byType.bug} bugs, ${stats.byType.feature} features, ${stats.byType.melhoria} melhorias e ${stats.byType.correcao} correções). Destas, ${data.resolved} (${data.resolutionRate}%) foram resolvidas e ${data.pending} permanecem pendentes.`;

  let evolution = '';
  if (cycleCount >= 2) {
    const first = cycles[0];
    const last = cycles[cycles.length - 1];
    const foundTrend =
      last.issues.length < first.issues.length
        ? `a quantidade de ocorrências por ciclo caiu de ${first.issues.length} (${first.cycle.name}) para ${last.issues.length} (${last.cycle.name})`
        : last.issues.length > first.issues.length
          ? `a quantidade de ocorrências por ciclo passou de ${first.issues.length} (${first.cycle.name}) para ${last.issues.length} (${last.cycle.name}), em linha com a ampliação da cobertura de testes`
          : `a quantidade de ocorrências por ciclo se manteve em ${first.issues.length}`;
    const highTrend =
      last.highSeverity < first.highSeverity
        ? `as ocorrências de severidade crítica ou alta reduziram de ${first.highSeverity} para ${last.highSeverity}`
        : last.highSeverity > first.highSeverity
          ? `as ocorrências de severidade crítica ou alta aumentaram de ${first.highSeverity} para ${last.highSeverity}`
          : `as ocorrências de severidade crítica ou alta se mantiveram em ${last.highSeverity}`;
    evolution = `Comparando o primeiro e o último ciclo, ${foundTrend}, e ${highTrend}. A taxa de resolução evoluiu de ${first.resolutionRate}% para ${last.resolutionRate}%.`;
  }

  const closing =
    data.pending === 0
      ? 'Todas as ocorrências registradas foram tratadas, e o sistema está apto para a liberação do ponto de vista dos testes realizados.'
      : data.pendingHigh > 0
        ? `Permanecem ${data.pending} ocorrência(s) pendente(s), das quais ${data.pendingHigh} de severidade crítica ou alta, que merecem atenção antes da liberação.`
        : `Permanecem ${data.pending} ocorrência(s) pendente(s), nenhuma de severidade crítica ou alta, o que não impede a liberação.`;

  const considerations = `Os ciclos de teste do projeto ${projectName} foram encerrados. ${closing} A lista completa das pendências está detalhada neste documento.`;

  const recommendations =
    data.pending === 0
      ? 'Recomenda-se acompanhar o sistema após a entrada em produção e manter os casos de teste como base para futuras regressões.'
      : data.pendingHigh > 0
        ? 'Recomenda-se tratar as pendências de severidade crítica e alta antes da liberação e executar um reteste dirigido após as correções. As demais pendências podem ser planejadas para as próximas versões.'
        : 'Recomenda-se planejar as pendências restantes para as próximas versões e executar um reteste dirigido após as correções.';

  return { summary, evolution, considerations, recommendations };
}
