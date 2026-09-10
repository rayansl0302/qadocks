import type {
  CycleStatus,
  IssueSort,
  IssueStatus,
  IssueType,
  Priority,
  ProjectStatus,
  ReportTemplate,
  Severity,
  TestScenarioType,
  TestStepFeedback,
} from '@/types';

export const ISSUE_TYPE_LABEL: Record<IssueType, string> = {
  bug: 'Bug',
  feature: 'Feature',
  melhoria: 'Melhoria',
  correcao: 'Correção',
};

export const ISSUE_TYPE_PREFIX: Record<IssueType, string> = {
  bug: 'BUG',
  feature: 'FEA',
  melhoria: 'MEL',
  correcao: 'COR',
};

export const ISSUE_TYPE_ICON: Record<IssueType, string> = {
  bug: '🐞',
  feature: '✨',
  melhoria: '🔧',
  correcao: '🛠',
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  critica: 'Crítica',
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  urgente: 'Urgente',
  alta: 'Alta',
  normal: 'Normal',
  baixa: 'Baixa',
};

export const ISSUE_STATUS_LABEL: Record<IssueStatus, string> = {
  aberto: 'Aberto',
  em_analise: 'Em análise',
  em_desenvolvimento: 'Em desenvolvimento',
  corrigido: 'Corrigido',
  retestado: 'Retestado',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
  reprovado: 'Reprovado',
  bloqueado: 'Bloqueado',
};

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  ativo: 'Ativo',
  concluido: 'Concluído',
  arquivado: 'Arquivado',
};

export const CYCLE_STATUS_LABEL: Record<CycleStatus, string> = {
  ativo: 'Ativo',
  concluido: 'Concluído',
  arquivado: 'Arquivado',
};

export const REPORT_TEMPLATE_LABEL: Record<ReportTemplate, string> = {
  profissional: 'Profissional',
  compacto: 'Compacto',
  executivo: 'Executivo',
};

export const ISSUE_SORT_LABEL: Record<IssueSort, string> = {
  mais_recentes: 'Mais recentes',
  mais_antigas: 'Mais antigas',
  maior_severidade: 'Maior severidade',
  maior_prioridade: 'Maior prioridade',
  codigo: 'Código',
  status: 'Status',
};

export const SEVERITY_ORDER: Record<Severity, number> = {
  critica: 4,
  alta: 3,
  media: 2,
  baixa: 1,
};

export const PRIORITY_ORDER: Record<Priority, number> = {
  urgente: 4,
  alta: 3,
  normal: 2,
  baixa: 1,
};

export const ISSUE_TYPES: IssueType[] = ['bug', 'feature', 'melhoria', 'correcao'];
export const SEVERITIES: Severity[] = ['critica', 'alta', 'media', 'baixa'];
export const PRIORITIES: Priority[] = ['urgente', 'alta', 'normal', 'baixa'];
export const ISSUE_STATUSES: IssueStatus[] = [
  'aberto',
  'em_analise',
  'em_desenvolvimento',
  'corrigido',
  'retestado',
  'aprovado',
  'rejeitado',
  'reprovado',
  'bloqueado',
];
export const PROJECT_STATUSES: ProjectStatus[] = ['ativo', 'concluido', 'arquivado'];
export const CYCLE_STATUSES: CycleStatus[] = ['ativo', 'concluido', 'arquivado'];

export const ENVIRONMENTS = [
  'Desenvolvimento',
  'QA',
  'Homologação',
  'Staging',
  'Produção',
  'Treinamento',
];

export const CYCLE_NAMES = [
  'Homologação',
  'Homologação - Sprint 01',
  'Homologação - Sprint 02',
  'Regressão',
  'Smoke Test',
  'Teste de Login',
  'Teste do Checkout',
  'Homologação Final',
  'Reteste',
];

export const BROWSERS = ['Chrome', 'Edge', 'Firefox', 'Safari', 'Opera'];

export const OPERATING_SYSTEMS = ['Windows 10/11', 'Windows', 'macOS', 'Linux', 'Android', 'iOS'];

export const DEVICES = ['Desktop', 'Notebook', 'Tablet', 'Celular'];

export const SCENARIO_TYPE_LABEL: Record<TestScenarioType, string> = {
  happy_path: 'Caminho feliz',
  negative: 'Teste negativo',
};

export const SCENARIO_SECTION_LABEL: Record<TestScenarioType, string> = {
  happy_path: 'Happy Path — quando o fluxo acontece da forma correta',
  negative: 'Testes negativos — quando o fluxo não acontece da forma correta',
};

export const SCENARIO_TYPES: TestScenarioType[] = ['happy_path', 'negative'];

export const STEP_FEEDBACK_LABEL: Record<Exclude<TestStepFeedback, ''>, string> = {
  passed: 'Passou',
  failed: 'Falhou',
  blocked: 'Bloqueado',
};

export const STEP_FEEDBACKS: Exclude<TestStepFeedback, ''>[] = ['passed', 'failed', 'blocked'];

export const LARGE_IMAGE_BYTES = 5 * 1024 * 1024;
