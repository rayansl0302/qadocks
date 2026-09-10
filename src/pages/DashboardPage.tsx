import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { ISSUE_TYPE_ICON } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import { listCyclesByUser } from '@/services/cycleService';
import { listIssuesByUser } from '@/services/issueService';
import { listProjects } from '@/services/projectService';
import { listReports } from '@/services/reportService';
import type { Issue, Project, ReportRecord, TestCycle } from '@/types';

export function DashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [cycles, setCycles] = useState<TestCycle[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [reports, setReports] = useState<ReportRecord[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const userId = user.id;

    async function load() {
      try {
        const [projectList, cycleList, issueList, reportList] = await Promise.all([
          listProjects(userId),
          listCyclesByUser(userId),
          listIssuesByUser(userId),
          listReports(userId),
        ]);
        setProjects(projectList);
        setCycles(cycleList);
        setIssues(issueList);
        setReports(reportList);
      } catch (error) {
        showToast(getErrorMessage(error), 'error');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [user, showToast]);

  if (loading) {
    return <Spinner label="Carregando dashboard..." />;
  }

  const activeCycles = cycles.filter((cycle) => cycle.status === 'ativo');
  const highlight = activeCycles[0] ?? cycles[0];
  const highlightProject = highlight ? projects.find((project) => project.id === highlight.projectId) : null;
  const highlightIssues = highlight ? issues.filter((issue) => issue.cycleId === highlight.id) : [];

  return (
    <div>
      <PageHeader
        eyebrow="Visão geral"
        title={`Olá, ${user?.displayName ?? 'QA'}`}
        description="Acompanhe o andamento dos seus ciclos de teste e gere relatórios sem sair do fluxo."
        actions={
          <Link to="/projects/new">
            <Button>Novo projeto</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Projetos" value={projects.length} />
        <StatCard label="Ciclos ativos" value={activeCycles.length} />
        <StatCard label="Ocorrências" value={issues.length} />
        <StatCard label="Relatórios" value={reports.length} />
      </div>

      {highlight && highlightProject ? (
        <Card className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Ciclo em destaque</p>
          <h2 className="mt-2 font-display text-3xl">{highlightProject.name}</h2>
          <p className="text-muted">{highlight.name}</p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <span>🐞 {countByType(highlightIssues, 'bug')} Bugs</span>
            <span>✨ {countByType(highlightIssues, 'feature')} Features</span>
            <span>🔧 {countByType(highlightIssues, 'melhoria')} Melhorias</span>
            <span>🛠 {countByType(highlightIssues, 'correcao')} Correções</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted">
            <span>🔴 {countBySeverity(highlightIssues, 'critica')} Crítica</span>
            <span>🟠 {countBySeverity(highlightIssues, 'alta')} Altas</span>
            <span>🟡 {countBySeverity(highlightIssues, 'media')} Médias</span>
            <span>🟢 {countBySeverity(highlightIssues, 'baixa')} Baixas</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to={`/cycles/${highlight.id}`}>
              <Button>Abrir ciclo</Button>
            </Link>
            <Link to={`/cycles/${highlight.id}/relatorio`}>
              <Button variant="secondary">Gerar relatório</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="mt-6">
          <EmptyState
            title="Nenhum ciclo ainda"
            description="Crie um projeto e um ciclo de teste para começar a registrar ocorrências."
            action={
              <Link to="/projects/new">
                <Button>Criar primeiro projeto</Button>
              </Link>
            }
          />
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="font-display text-2xl">Projetos recentes</h3>
          <ul className="mt-4 space-y-3">
            {projects.slice(0, 5).map((project) => (
              <li key={project.id}>
                <Link to={`/projects/${project.id}`} className="flex items-center justify-between rounded-xl px-2 py-2 hover:bg-paper">
                  <span className="font-medium">{project.name}</span>
                  <span className="text-sm text-muted">{project.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="font-display text-2xl">Últimas ocorrências</h3>
          <ul className="mt-4 space-y-3">
            {issues.slice(0, 5).map((issue) => (
              <li key={issue.id}>
                <Link to={`/issues/${issue.id}`} className="flex items-center justify-between rounded-xl px-2 py-2 hover:bg-paper">
                  <span className="font-medium">
                    {ISSUE_TYPE_ICON[issue.type]} {issue.code} · {issue.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-display text-4xl">{value}</p>
    </Card>
  );
}

function countByType(issues: Issue[], type: Issue['type']): number {
  return issues.filter((issue) => issue.type === type).length;
}

function countBySeverity(issues: Issue[], severity: Issue['severity']): number {
  return issues.filter((issue) => issue.severity === severity).length;
}
