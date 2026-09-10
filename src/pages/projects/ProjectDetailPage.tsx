import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/contexts/ToastContext';
import { CYCLE_STATUS_LABEL, PROJECT_STATUS_LABEL } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import { formatDate } from '@/lib/format';
import { deleteCycleById, listCycles } from '@/services/cycleService';
import { deleteProject, getProject } from '@/services/projectService';
import type { Project, TestCycle } from '@/types';

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [cycles, setCycles] = useState<TestCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmProject, setConfirmProject] = useState(false);
  const [cycleToDelete, setCycleToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      return;
    }

    const id = projectId;

    async function load() {
      try {
        const current = await getProject(id);
        if (!current) {
          showToast('Projeto não encontrado.', 'error');
          navigate('/projects');
          return;
        }
        setProject(current);
        setCycles(await listCycles(id));
      } catch (error) {
        showToast(getErrorMessage(error), 'error');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [projectId, navigate, showToast]);

  async function handleDeleteProject() {
    if (!project) {
      return;
    }
    try {
      await deleteProject(project.id);
      showToast('Projeto excluído.');
      navigate('/projects');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  }

  async function handleDeleteCycle() {
    if (!cycleToDelete || !projectId) {
      return;
    }
    try {
      await deleteCycleById(cycleToDelete);
      setCycles((current) => current.filter((cycle) => cycle.id !== cycleToDelete));
      setCycleToDelete(null);
      showToast('Ciclo excluído.');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  }

  if (loading || !project) {
    return <Spinner label="Carregando projeto..." />;
  }

  return (
    <div>
      <PageHeader
        eyebrow={project.client || 'Projeto'}
        title={project.name}
        description={project.description}
        actions={
          <>
            <Link to={`/projects/${project.id}/edit`}>
              <Button variant="secondary">Editar</Button>
            </Link>
            <Link to={`/projects/${project.id}/cycles/new`}>
              <Button>Novo ciclo</Button>
            </Link>
            <Button variant="danger" onClick={() => setConfirmProject(true)}>
              Excluir
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Info label="Versão" value={project.version || '—'} />
        <Info label="Ambiente" value={project.environment || '—'} />
        <Info label="Responsável" value={project.owner || '—'} />
        <Info label="Status" value={PROJECT_STATUS_LABEL[project.status]} />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl">Ciclos de teste</h2>
        <Link to={`/projects/${project.id}/cycles`} className="text-sm text-muted hover:text-ink">
          Ver todos
        </Link>
      </div>

      {cycles.length === 0 ? (
        <EmptyState
          title="Nenhum ciclo neste projeto"
          description="Crie um ciclo para registrar ocorrências e gerar o relatório."
          action={
            <Link to={`/projects/${project.id}/cycles/new`}>
              <Button>Criar ciclo</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cycles.map((cycle) => (
            <Card key={cycle.id}>
              <Link to={`/cycles/${cycle.id}`}>
                <h3 className="font-display text-2xl">{cycle.name}</h3>
                <p className="mt-1 text-sm text-muted">{cycle.description || 'Sem descrição'}</p>
                <p className="mt-3 text-sm">
                  {CYCLE_STATUS_LABEL[cycle.status]} · {formatDate(cycle.startDate)} — {formatDate(cycle.endDate)}
                </p>
              </Link>
              <div className="mt-4 flex gap-2">
                <Link to={`/cycles/${cycle.id}/edit`}>
                  <Button variant="secondary">Editar</Button>
                </Link>
                <Button variant="ghost" onClick={() => setCycleToDelete(cycle.id)}>
                  Excluir
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {confirmProject ? (
        <ConfirmDialog
          title="Excluir projeto"
          description="Essa ação remove o projeto, os ciclos, as ocorrências, as evidências e os casos de teste."
          confirmLabel="Excluir projeto"
          danger
          onCancel={() => setConfirmProject(false)}
          onConfirm={handleDeleteProject}
        />
      ) : null}

      {cycleToDelete ? (
        <ConfirmDialog
          title="Excluir ciclo"
          description="As ocorrências e evidências deste ciclo serão removidas."
          confirmLabel="Excluir ciclo"
          danger
          onCancel={() => setCycleToDelete(null)}
          onConfirm={handleDeleteCycle}
        />
      ) : null}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-2 font-medium">{value}</p>
    </Card>
  );
}
