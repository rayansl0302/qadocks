export type ProjectStatus = 'ativo' | 'concluido' | 'arquivado';

export type CycleStatus = 'ativo' | 'concluido' | 'arquivado';

export type IssueType = 'bug' | 'feature' | 'melhoria' | 'correcao';

export type Severity = 'critica' | 'alta' | 'media' | 'baixa';

export type Priority = 'urgente' | 'alta' | 'normal' | 'baixa';

export type IssueStatus =
  | 'aberto'
  | 'em_analise'
  | 'em_desenvolvimento'
  | 'corrigido'
  | 'retestado'
  | 'aprovado'
  | 'rejeitado'
  | 'reprovado'
  | 'bloqueado';

export type ReportTemplate = 'profissional' | 'compacto' | 'executivo';

export interface AppUser {
  id: string;
  displayName: string;
  email: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  client: string;
  version: string;
  environment: string;
  owner: string;
  status: ProjectStatus;
  createdAt: Date;
  createdBy: string;
}

export interface TestCycle {
  id: string;
  projectId: string;
  name: string;
  description: string;
  version: string;
  environment: string;
  startDate: string;
  endDate: string;
  owner: string;
  status: CycleStatus;
  createdAt: Date;
  createdBy: string;
}

export interface Issue {
  id: string;
  projectId: string;
  cycleId: string;
  code: string;
  type: IssueType;
  title: string;
  description: string;
  status: IssueStatus;
  severity: Severity;
  priority: Priority;
  authorId: string;
  authorName: string;
  assignee: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  preconditions: string;
  reproductionSteps: string[];
  expectedResult: string;
  actualResult: string;
  impact: string;
  environment: string;
  version: string;
  browser: string;
  operatingSystem: string;
  device: string;
  objective: string;
  businessRules: string;
  acceptanceCriteria: string;
  currentSituation: string;
  opportunity: string;
  suggestion: string;
  expectedBenefit: string;
  originalProblem: string;
  correctionMade: string;
  resultAfterCorrection: string;
  correctedVersion: string;
  correctionDate: string;
  correctionOwner: string;
}

export interface Evidence {
  id: string;
  issueId: string;
  projectId: string;
  cycleId: string;
  url: string;
  storagePath: string;
  fileName: string;
  caption: string;
  order: number;
  size: number;
  createdAt: Date;
}

export interface ReportConfig {
  title: string;
  template: ReportTemplate;
  includeCover: boolean;
  includeSummary: boolean;
  includeCharts: boolean;
  includeEvidences: boolean;
  includeConclusion: boolean;
  conclusion: string;
}

export interface ReportRecord {
  id: string;
  projectId: string;
  cycleId: string;
  title: string;
  template: ReportTemplate;
  fileName: string;
  createdAt: Date;
  createdBy: string;
}

export interface IssueFilters {
  type: IssueType | 'todos';
  status: IssueStatus | 'todos';
  severity: Severity | 'todos';
  priority: Priority | 'todos';
  assignee: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

export type IssueSort =
  | 'mais_recentes'
  | 'mais_antigas'
  | 'maior_severidade'
  | 'maior_prioridade'
  | 'codigo'
  | 'status';

export interface ReportWarning {
  id: string;
  message: string;
}
