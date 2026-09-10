import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { PROJECT_STATUS_LABEL } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import { formatDate } from '@/lib/format';
import { listProjects } from '@/services/projectService';
import type { Project } from '@/types';

export function ProjectsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    const userId = user.id;

    async function load() {
      try {
        setProjects(await listProjects(userId));
      } catch (error) {
        showToast(getErrorMessage(error), 'error');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [user, showToast]);

  if (loading) {
    return <Spinner label="Carregando projetos..." />;
  }

  return (
    <div>
      <PageHeader
        title="Projetos"
        description="Organize seus sistemas e clientes em projetos de teste."
        actions={
          <Link to="/projects/new">
            <Button>Novo projeto</Button>
          </Link>
        }
      />
      {projects.length === 0 ? (
        <EmptyState
          title="Nenhum projeto cadastrado"
          description="Crie o primeiro projeto para começar um ciclo de testes."
          action={
            <Link to="/projects/new">
              <Button>Criar projeto</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <Card className="h-full transition hover:border-teal">
                <p className="text-xs uppercase tracking-[0.14em] text-muted">{project.client || 'Sem cliente'}</p>
                <h2 className="mt-2 font-display text-2xl">{project.name}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{project.description || 'Sem descrição'}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span>{PROJECT_STATUS_LABEL[project.status]}</span>
                  <span className="text-muted">{formatDate(project.createdAt)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
