import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { SCENARIO_TYPE_LABEL } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import { formatDate } from '@/lib/format';
import { buildTestCaseExcelFileName, countTestCaseSteps, downloadTestCasesExcel } from '@/lib/testCaseExcel';
import { getProject } from '@/services/projectService';
import { deleteTestCase, ensureExampleTestCase } from '@/services/testCaseService';
import type { Project, TestCase } from '@/types';

export function TestCaseListPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [caseToDelete, setCaseToDelete] = useState<string | null>(null);

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
        setTestCases(user ? await ensureExampleTestCase(user.id, id) : []);
      } catch (error) {
        showToast(getErrorMessage(error), 'error');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [projectId, navigate, showToast, user]);

  async function handleDelete() {
    if (!caseToDelete || !projectId) {
      return;
    }
    try {
      await deleteTestCase(projectId, caseToDelete);
      setTestCases((current) => current.filter((item) => item.id !== caseToDelete));
      setCaseToDelete(null);
      showToast('Caso de teste excluído.');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  }

  function handleExportAll() {
    if (!project || testCases.length === 0) {
      return;
    }
    downloadTestCasesExcel(testCases, buildTestCaseExcelFileName(project.name));
  }

  if (loading || !project) {
    return <Spinner label="Carregando casos de teste..." />;
  }

  return (
    <div>
      <PageHeader
        eyebrow={project.name}
        title="Casos e cenários de teste"
        description="Depois da reunião com o cliente, registre os casos e cenários do escopo e gere a planilha Excel."
        actions={
          <>
            {testCases.length > 0 ? (
              <Button variant="secondary" onClick={handleExportAll}>
                Gerar Excel
              </Button>
            ) : null}
            <Link to={`/projects/${project.id}/casos/new`}>
              <Button>Novo caso</Button>
            </Link>
          </>
        }
      />
      {testCases.length === 0 ? (
        <EmptyState
          title="Nenhum caso de teste"
          description="Crie o primeiro caso com os cenários combinados no escopo."
          action={
            <Link to={`/projects/${project.id}/casos/new`}>
              <Button>Criar caso</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4">
          {testCases.map((testCase) => {
            const types = [...new Set(testCase.scenarios.map((scenario) => SCENARIO_TYPE_LABEL[scenario.type]))];
            return (
              <Card key={testCase.id}>
                <Link to={`/projects/${project.id}/casos/${testCase.id}`}>
                  <h2 className="font-display text-2xl">{testCase.name}</h2>
                  <p className="mt-1 text-sm text-muted">{testCase.description || 'Sem descrição'}</p>
                  <p className="mt-3 text-sm">
                    {testCase.scenarios.length} cenário{testCase.scenarios.length === 1 ? '' : 's'} ·{' '}
                    {countTestCaseSteps(testCase)} passo{countTestCaseSteps(testCase) === 1 ? '' : 's'} ·{' '}
                    {types.join(' · ') || 'Sem cenários'} · {formatDate(testCase.createdAt)}
                  </p>
                </Link>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      downloadTestCasesExcel([testCase], buildTestCaseExcelFileName(project.name, testCase.name))
                    }
                  >
                    Gerar Excel
                  </Button>
                  <Link to={`/projects/${project.id}/casos/${testCase.id}/edit`}>
                    <Button variant="secondary">Editar</Button>
                  </Link>
                  <Button variant="ghost" onClick={() => setCaseToDelete(testCase.id)}>
                    Excluir
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {caseToDelete ? (
        <ConfirmDialog
          title="Excluir caso de teste"
          description="Essa ação remove o caso, os cenários e os passos cadastrados."
          confirmLabel="Excluir caso"
          danger
          onCancel={() => setCaseToDelete(null)}
          onConfirm={handleDelete}
        />
      ) : null}
    </div>
  );
}
