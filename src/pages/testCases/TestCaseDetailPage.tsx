import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/contexts/ToastContext';
import { SCENARIO_SECTION_LABEL, STEP_FEEDBACK_LABEL } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import { buildTestCaseExcelFileName, downloadTestCasesExcel } from '@/lib/testCaseExcel';
import { getProject } from '@/services/projectService';
import { deleteTestCase, getTestCase } from '@/services/testCaseService';
import type { Project, TestCase, TestScenarioType, TestStep } from '@/types';

export function TestCaseDetailPage() {
  const { projectId, caseId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [testCase, setTestCase] = useState<TestCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!caseId || !projectId) {
      return;
    }

    const id = caseId;
    const currentProjectId = projectId;

    async function load() {
      try {
        const current = await getTestCase(currentProjectId, id);
        if (!current) {
          showToast('Caso de teste não encontrado.', 'error');
          navigate('/projects');
          return;
        }
        const currentProject = await getProject(current.projectId);
        if (!currentProject) {
          showToast('Projeto não encontrado.', 'error');
          navigate('/projects');
          return;
        }
        setTestCase(current);
        setProject(currentProject);
      } catch (error) {
        showToast(getErrorMessage(error), 'error');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [caseId, projectId, navigate, showToast]);

  async function handleDelete() {
    if (!testCase || !project) {
      return;
    }
    try {
      await deleteTestCase(project.id, testCase.id);
      showToast('Caso de teste excluído.');
      navigate('/casos');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  }

  if (loading || !project || !testCase) {
    return <Spinner label="Carregando caso de teste..." />;
  }

  return (
    <div>
      <PageHeader
        eyebrow={project.name}
        title={testCase.name}
        description={testCase.description || 'Caso e cenários de teste do escopo.'}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() =>
                void downloadTestCasesExcel([testCase], buildTestCaseExcelFileName(project.name, testCase.name))
              }
            >
              Gerar Excel
            </Button>
            <Link to={`/projects/${project.id}/casos/${testCase.id}/edit`}>
              <Button>Editar</Button>
            </Link>
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              Excluir
            </Button>
          </>
        }
      />

      <Card className="overflow-x-auto">
        <table className="min-w-[720px] w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#1F4E79] text-white">
              <th className="border border-line px-3 py-2 text-left font-semibold">Cenário</th>
              <th className="border border-line px-3 py-2 text-left font-semibold">Dados</th>
              <th className="border border-line px-3 py-2 text-left font-semibold">Resultado esperado</th>
              <th className="border border-line px-3 py-2 text-left font-semibold">Resultado</th>
              <th className="border border-line px-3 py-2 text-left font-semibold">Resultado obtido</th>
              <th className="border border-line px-3 py-2 text-left font-semibold">Comentário</th>
            </tr>
          </thead>
          <tbody>
            {testCase.setupSteps.map((step, index) => (
              <StepRow key={`setup-${index}`} step={step} />
            ))}
            <ScenarioBody scenarios={testCase.scenarios} />
          </tbody>
        </table>
      </Card>

      {confirmDelete ? (
        <ConfirmDialog
          title="Excluir caso de teste"
          description="Essa ação remove o caso, os cenários e os passos cadastrados."
          confirmLabel="Excluir caso"
          danger
          onCancel={() => setConfirmDelete(false)}
          onConfirm={handleDelete}
        />
      ) : null}
    </div>
  );
}

function ScenarioBody({ scenarios }: { scenarios: TestCase['scenarios'] }) {
  const rows: { key: string; type?: TestScenarioType; title?: boolean; step?: TestStep }[] = [];
  let lastType: TestScenarioType | null = null;

  scenarios.forEach((scenario, scenarioIndex) => {
    if (scenario.type !== lastType) {
      rows.push({ key: `section-${scenario.type}-${scenarioIndex}`, type: scenario.type });
      lastType = scenario.type;
    }
    if (scenario.title.trim()) {
      rows.push({
        key: `title-${scenarioIndex}`,
        title: true,
        step: { action: scenario.title, data: '', expected: scenario.expected, feedback: '', result: '', comment: '' },
      });
    }
    scenario.steps.forEach((step, stepIndex) => {
      rows.push({ key: `step-${scenarioIndex}-${stepIndex}`, step });
    });
  });

  return (
    <>
      {rows.map((row) => {
        if (row.type) {
          return (
            <tr key={row.key} className="bg-yellow-300">
              <td className="border border-line px-3 py-2 font-semibold" colSpan={6}>
                {SCENARIO_SECTION_LABEL[row.type]}
              </td>
            </tr>
          );
        }
        if (!row.step) {
          return null;
        }
        return <StepRow key={row.key} step={row.step} strong={row.title} />;
      })}
    </>
  );
}

function StepRow({ step, strong }: { step: TestStep; strong?: boolean }) {
  const cell = strong ? 'border border-line px-3 py-2 font-semibold' : 'border border-line px-3 py-2';
  return (
    <tr>
      <td className={cell}>{step.action || '—'}</td>
      <td className="border border-line px-3 py-2">{step.data || '—'}</td>
      <td className="border border-line px-3 py-2">{step.expected || '—'}</td>
      <td className="border border-line px-3 py-2">
        {step.feedback ? (
          <span
            className={
              step.feedback === 'passed'
                ? 'rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800'
                : step.feedback === 'failed'
                  ? 'rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800'
                  : 'rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800'
            }
          >
            {STEP_FEEDBACK_LABEL[step.feedback]}
          </span>
        ) : (
          '—'
        )}
      </td>
      <td className="border border-line px-3 py-2">{step.result || '—'}</td>
      <td className="border border-line px-3 py-2">{step.comment || '—'}</td>
    </tr>
  );
}
