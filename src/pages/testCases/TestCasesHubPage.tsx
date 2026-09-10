import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { SCENARIO_TYPE_LABEL } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import { formatDate } from '@/lib/format';
import { countTestCaseSteps } from '@/lib/testCaseExcel';
import { listProjects } from '@/services/projectService';
import { ensureExampleTestCase, listTestCases } from '@/services/testCaseService';
import type { Project, TestCase } from '@/types';

export function TestCasesHubPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    const userId = user.id;

    async function load() {
      try {
        const currentProjects = await listProjects(userId);
        setProjects(currentProjects);
        const groups = await Promise.all(currentProjects.map((project) => listTestCases(project.id)));
        const flattened = groups.flat();
        if (flattened.length === 0 && currentProjects[0]) {
          setTestCases(await ensureExampleTestCase(userId, currentProjects[0].id));
          return;
        }
        setTestCases(flattened);
      } catch (error) {
        showToast(getErrorMessage(error), 'error');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [user, showToast]);

  if (loading) {
    return <Spinner label="Carregando casos de teste..." />;
  }

  const newCaseTo = projects[0] ? `/projects/${projects[0].id}/casos/new` : '/projects/new';

  return (
    <div>
      <PageHeader
        title="Casos de teste"
        description="Depois da reunião com o cliente, registre o caso. Os cenários (caminho feliz e testes negativos) ficam dentro dele."
        actions={
          projects.length > 0 ? (
            <Link to={newCaseTo}>
              <Button>Novo caso</Button>
            </Link>
          ) : null
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          title="Nenhum projeto cadastrado"
          description="Crie um projeto para vincular os casos de teste."
          action={
            <Link to="/projects/new">
              <Button>Criar projeto</Button>
            </Link>
          }
        />
      ) : testCases.length === 0 ? (
        <EmptyState
          title="Nenhum caso de teste"
          description="Crie o primeiro caso e, dentro dele, os cenários do escopo."
          action={
            <Link to={newCaseTo}>
              <Button>Criar caso</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4">
          {testCases.map((testCase) => {
            const types = [...new Set(testCase.scenarios.map((scenario) => SCENARIO_TYPE_LABEL[scenario.type]))];
            const projectName = projects.find((project) => project.id === testCase.projectId)?.name || 'Projeto';
            return (
              <Link key={testCase.id} to={`/projects/${testCase.projectId}/casos/${testCase.id}`}>
                <Card className="transition hover:border-teal">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">{projectName}</p>
                  <h2 className="mt-2 font-display text-2xl">{testCase.name}</h2>
                  <p className="mt-1 text-sm text-muted">{testCase.description || 'Sem descrição'}</p>
                  <p className="mt-3 text-sm">
                    {testCase.scenarios.length} cenário{testCase.scenarios.length === 1 ? '' : 's'} ·{' '}
                    {countTestCaseSteps(testCase)} passo{countTestCaseSteps(testCase) === 1 ? '' : 's'} ·{' '}
                    {types.join(' · ') || 'Sem cenários'} · {formatDate(testCase.createdAt)}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
