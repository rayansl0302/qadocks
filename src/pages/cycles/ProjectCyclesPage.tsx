import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/contexts/ToastContext';
import { CYCLE_STATUS_LABEL } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import { formatDate } from '@/lib/format';
import { listCycles } from '@/services/cycleService';
import { getProject } from '@/services/projectService';
import type { Project, TestCycle } from '@/types';

export function ProjectCyclesPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [cycles, setCycles] = useState<TestCycle[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading || !project) {
    return <Spinner label="Carregando ciclos..." />;
  }

  return (
    <div>
      <PageHeader
        eyebrow={project.name}
        title="Ciclos de teste"
        actions={
          <Link to={`/projects/${project.id}/cycles/new`}>
            <Button>Novo ciclo</Button>
          </Link>
        }
      />
      {cycles.length === 0 ? (
        <EmptyState
          title="Nenhum ciclo cadastrado"
          description="Crie o primeiro ciclo para este projeto."
          action={
            <Link to={`/projects/${project.id}/cycles/new`}>
              <Button>Criar ciclo</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4">
          {cycles.map((cycle) => (
            <Link key={cycle.id} to={`/cycles/${cycle.id}`}>
              <Card className="transition hover:border-teal">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="font-display text-2xl">{cycle.name}</h2>
                    <p className="text-sm text-muted">{cycle.description || 'Sem descrição'}</p>
                  </div>
                  <p className="text-sm">
                    {CYCLE_STATUS_LABEL[cycle.status]} · {formatDate(cycle.startDate)} — {formatDate(cycle.endDate)}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
