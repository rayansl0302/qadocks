import { LARGE_IMAGE_BYTES } from '@/lib/constants';
import type { Evidence, Issue, ReportWarning } from '@/types';

export function validateReport(issues: Issue[], evidences: Evidence[]): ReportWarning[] {
  const warnings: ReportWarning[] = [];
  const evidencesByIssue = new Map<string, Evidence[]>();

  evidences.forEach((evidence) => {
    const current = evidencesByIssue.get(evidence.issueId) ?? [];
    current.push(evidence);
    evidencesByIssue.set(evidence.issueId, current);
  });

  const untitled = issues.filter((issue) => !issue.title.trim()).length;
  if (untitled > 0) {
    warnings.push({
      id: 'untitled',
      message: `${untitled} ocorrência(s) sem título.`,
    });
  }

  const bugsWithoutExpected = issues.filter(
    (issue) => issue.type === 'bug' && !issue.expectedResult.trim(),
  ).length;
  if (bugsWithoutExpected > 0) {
    warnings.push({
      id: 'expected',
      message: `${bugsWithoutExpected} bug(s) sem resultado esperado.`,
    });
  }

  const bugsWithoutEvidence = issues.filter(
    (issue) => issue.type === 'bug' && (evidencesByIssue.get(issue.id)?.length ?? 0) === 0,
  ).length;
  if (bugsWithoutEvidence > 0) {
    warnings.push({
      id: 'evidence',
      message: `${bugsWithoutEvidence} bug(s) sem evidência.`,
    });
  }

  const criticalOpen = issues.filter(
    (issue) => issue.severity === 'critica' && issue.status !== 'aprovado' && issue.status !== 'rejeitado',
  ).length;
  if (criticalOpen > 0) {
    warnings.push({
      id: 'critical',
      message: `${criticalOpen} ocorrência(s) crítica(s) ainda abertas.`,
    });
  }

  const blocked = issues.filter((issue) => issue.status === 'bloqueado').length;
  if (blocked > 0) {
    warnings.push({
      id: 'blocked',
      message: `${blocked} ocorrência(s) bloqueada(s).`,
    });
  }

  const open = issues.filter((issue) => issue.status === 'aberto').length;
  if (open > 0) {
    warnings.push({
      id: 'open',
      message: `${open} ocorrência(s) aberta(s).`,
    });
  }

  const largeImages = evidences.filter((evidence) => evidence.size > LARGE_IMAGE_BYTES).length;
  if (largeImages > 0) {
    warnings.push({
      id: 'images',
      message: `${largeImages} imagem(ns) muito grande(s) para o PDF.`,
    });
  }

  const missingFields = issues.filter((issue) => {
    if (!issue.description.trim()) {
      return true;
    }
    if (issue.type === 'bug') {
      return issue.reproductionSteps.filter((step) => step.trim()).length === 0 || !issue.actualResult.trim();
    }
    return false;
  }).length;
  if (missingFields > 0) {
    warnings.push({
      id: 'fields',
      message: `${missingFields} ocorrência(s) com campos importantes vazios.`,
    });
  }

  return warnings;
}

export function buildAutomaticConclusion(params: {
  cycleName: string;
  executedTests: number;
  issues: Issue[];
}): string {
  const bugs = params.issues.filter((issue) => issue.type === 'bug').length;
  const features = params.issues.filter((issue) => issue.type === 'feature').length;
  const improvements = params.issues.filter((issue) => issue.type === 'melhoria').length;
  const fixes = params.issues.filter((issue) => issue.type === 'correcao').length;
  const blocked = params.issues.filter((issue) => issue.status === 'bloqueado').length;
  const highOpen = params.issues.filter(
    (issue) =>
      (issue.severity === 'alta' || issue.severity === 'critica') &&
      (issue.status === 'aberto' || issue.status === 'em_analise' || issue.status === 'bloqueado'),
  ).length;

  return `Durante o ciclo ${params.cycleName} foram executados ${params.executedTests} testes. Foram identificadas ${params.issues.length} ocorrências, sendo ${bugs} bugs, ${features} features, ${improvements} melhorias e ${fixes} correções. No momento da emissão deste relatório, ${blocked} ocorrências permanecem bloqueadas e ${highOpen} ocorrências de severidade alta ou crítica continuam abertas.`;
}
