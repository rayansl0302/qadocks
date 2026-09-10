import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { PriorityBadge, SeverityBadge, StatusBadge, TypeBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/contexts/ToastContext';
import {
  ISSUE_SORT_LABEL,
  ISSUE_STATUS_LABEL,
  ISSUE_STATUSES,
  ISSUE_TYPE_LABEL,
  ISSUE_TYPES,
  PRIORITIES,
  PRIORITY_LABEL,
  SEVERITIES,
  SEVERITY_LABEL,
} from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import { filterIssues, sortIssues } from '@/lib/issueFilters';
import { deleteCycleById, getCycle } from '@/services/cycleService';
import { listIssuesByCycle } from '@/services/issueService';
import { getProject } from '@/services/projectService';
import type { Issue, IssueFilters, IssueSort, IssueStatus, IssueType, Priority, Project, Severity, TestCycle } from '@/types';

const defaultFilters: IssueFilters = {
  type: 'todos',
  status: 'todos',
  severity: 'todos',
  priority: 'todos',
  assignee: '',
  dateFrom: '',
  dateTo: '',
  search: '',
};

export function CycleDetailPage() {
  const { cycleId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [cycle, setCycle] = useState<TestCycle | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filters, setFilters] = useState<IssueFilters>(defaultFilters);
  const [sort, setSort] = useState<IssueSort>('mais_recentes');
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!cycleId) {
      return;
    }

    const id = cycleId;

    async function load() {
      try {
        const currentCycle = await getCycle(id);
        if (!currentCycle) {
          showToast('Ciclo não encontrado.', 'error');
          navigate('/projects');
          return;
        }
        const currentProject = await getProject(currentCycle.projectId);
        if (!currentProject) {
          showToast('Projeto não encontrado.', 'error');
          navigate('/projects');
          return;
        }
        setCycle(currentCycle);
        setProject(currentProject);
        setIssues(await listIssuesByCycle(id));
      } catch (error) {
        showToast(getErrorMessage(error), 'error');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [cycleId, navigate, showToast]);

  const visibleIssues = useMemo(() => sortIssues(filterIssues(issues, filters), sort), [issues, filters, sort]);

  async function handleDelete() {
    if (!cycle || !project) {
      return;
    }
    try {
      await deleteCycleById(cycle.id);
      showToast('Ciclo excluído.');
      navigate(`/projects/${project.id}`);
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  }

  if (loading || !cycle || !project) {
    return <Spinner label="Carregando ciclo..." />;
  }

  return (
    <div>
      <PageHeader
        eyebrow={project.name}
        title={cycle.name}
        description={cycle.description}
        actions={
          <>
            <Link to={`/cycles/${cycle.id}/edit`}>
              <Button variant="secondary">Editar</Button>
            </Link>
            <Link to={`/cycles/${cycle.id}/issues/new`}>
              <Button>Nova ocorrência</Button>
            </Link>
            <Link to={`/cycles/${cycle.id}/relatorio`}>
              <Button variant="secondary">Gerar relatório PDF</Button>
            </Link>
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              Excluir
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Stat label="Ocorrências" value={issues.length} />
        <Stat label="Aprovados" value={issues.filter((issue) => issue.status === 'aprovado').length} />
        <Stat label="Reprovados" value={issues.filter((issue) => issue.status === 'reprovado').length} />
        <Stat label="Bloqueados" value={issues.filter((issue) => issue.status === 'bloqueado').length} />
      </div>

      <Card className="mb-6">
        <h2 className="mb-4 font-display text-2xl">Filtros</h2>
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          <Input
            label="Pesquisar"
            placeholder="ID, título ou descrição"
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
          />
          <Select
            label="Tipo"
            value={filters.type}
            onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value as IssueType | 'todos' }))}
            options={[{ value: 'todos', label: 'Todos' }, ...ISSUE_TYPES.map((type) => ({ value: type, label: ISSUE_TYPE_LABEL[type] }))]}
          />
          <Select
            label="Status"
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as IssueStatus | 'todos' }))}
            options={[{ value: 'todos', label: 'Todos' }, ...ISSUE_STATUSES.map((status) => ({ value: status, label: ISSUE_STATUS_LABEL[status] }))]}
          />
          <Select
            label="Severidade"
            value={filters.severity}
            onChange={(event) => setFilters((current) => ({ ...current, severity: event.target.value as Severity | 'todos' }))}
            options={[{ value: 'todos', label: 'Todas' }, ...SEVERITIES.map((severity) => ({ value: severity, label: SEVERITY_LABEL[severity] }))]}
          />
          <Select
            label="Prioridade"
            value={filters.priority}
            onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value as Priority | 'todos' }))}
            options={[{ value: 'todos', label: 'Todas' }, ...PRIORITIES.map((priority) => ({ value: priority, label: PRIORITY_LABEL[priority] }))]}
          />
          <Input
            label="Responsável"
            value={filters.assignee}
            onChange={(event) => setFilters((current) => ({ ...current, assignee: event.target.value }))}
          />
          <Input
            label="Data inicial"
            type="date"
            value={filters.dateFrom}
            onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))}
          />
          <Input
            label="Data final"
            type="date"
            value={filters.dateTo}
            onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))}
          />
          <Select
            label="Ordenação"
            value={sort}
            onChange={(event) => setSort(event.target.value as IssueSort)}
            options={Object.entries(ISSUE_SORT_LABEL).map(([value, label]) => ({ value, label }))}
          />
        </div>
      </Card>

      {visibleIssues.length === 0 ? (
        <EmptyState
          title="Nenhuma ocorrência encontrada"
          description="Ajuste os filtros ou registre a primeira ocorrência deste ciclo."
          action={
            <Link to={`/cycles/${cycle.id}/issues/new`}>
              <Button>Criar ocorrência</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-3">
          {visibleIssues.map((issue) => (
            <Link key={issue.id} to={`/issues/${issue.id}`}>
              <Card className="transition hover:border-teal">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{issue.code}</p>
                    <h3 className="mt-1 font-display text-2xl">{issue.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <TypeBadge value={issue.type} />
                    <SeverityBadge value={issue.severity} />
                    <PriorityBadge value={issue.priority} />
                    <StatusBadge value={issue.status} />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {confirmDelete ? (
        <ConfirmDialog
          title="Excluir ciclo"
          description="As ocorrências e evidências deste ciclo serão removidas."
          confirmLabel="Excluir ciclo"
          danger
          onCancel={() => setConfirmDelete(false)}
          onConfirm={handleDelete}
        />
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-display text-4xl">{value}</p>
    </Card>
  );
}
