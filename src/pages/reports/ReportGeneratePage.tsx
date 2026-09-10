import { pdf } from '@react-pdf/renderer';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { QaReportDocument } from '@/components/report/QaReportDocument';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { Textarea } from '@/components/ui/Textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { REPORT_TEMPLATE_LABEL } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import { imageToDataUrl } from '@/lib/imageData';
import { buildReportFileName } from '@/lib/pdfFileName';
import { buildReportStats } from '@/lib/reportStats';
import { buildAutomaticConclusion, validateReport } from '@/lib/reportValidation';
import { getCycle } from '@/services/cycleService';
import { listEvidencesByCycle } from '@/services/evidenceService';
import { listIssuesByCycle } from '@/services/issueService';
import { getProject } from '@/services/projectService';
import { createReportRecord } from '@/services/reportService';
import type { Evidence, Issue, Project, ReportConfig, ReportTemplate, ReportWarning, TestCycle } from '@/types';

const defaultConfig: ReportConfig = {
  title: 'Relatório de QA',
  template: 'profissional',
  includeCover: true,
  includeSummary: true,
  includeCharts: true,
  includeEvidences: true,
  includeConclusion: true,
  conclusion: '',
};

export function ReportGeneratePage() {
  const { cycleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [cycle, setCycle] = useState<TestCycle | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [config, setConfig] = useState<ReportConfig>(defaultConfig);
  const [warnings, setWarnings] = useState<ReportWarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');

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
        const currentIssues = await listIssuesByCycle(currentCycle.id);
        setCycle(currentCycle);
        setProject(currentProject);
        setIssues(currentIssues);
        setEvidences(await listEvidencesByCycle(currentCycle.id));
        setConfig((current) => ({
          ...current,
          title: `Relatório de QA — ${currentProject.name}`,
          conclusion: buildAutomaticConclusion({
            cycleName: currentCycle.name,
            executedTests: currentIssues.length,
            issues: currentIssues,
          }),
        }));
      } catch (error) {
        showToast(getErrorMessage(error), 'error');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [cycleId, navigate, showToast]);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const stats = useMemo(() => buildReportStats(issues), [issues]);

  async function generatePdf() {
    if (!project || !cycle || !user) {
      return;
    }
    setGenerating(true);
    try {
      const evidencesWithImages = await Promise.all(
        evidences.map(async (evidence) => {
          try {
            return { ...evidence, dataUrl: await imageToDataUrl(evidence.url) };
          } catch {
            return evidence;
          }
        }),
      );
      const generatedAt = new Date();
      const blob = await pdf(
        <QaReportDocument
          project={project}
          cycle={cycle}
          issues={issues}
          evidences={evidencesWithImages}
          config={config}
          stats={stats}
          generatedAt={generatedAt}
          qaOwner={user.displayName}
        />,
      ).toBlob();
      const name = buildReportFileName(project.name, cycle.name, generatedAt);
      const url = URL.createObjectURL(blob);
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      setPdfUrl(url);
      setFileName(name);
      await createReportRecord({
        userId: user.id,
        projectId: project.id,
        cycleId: cycle.id,
        title: config.title,
        template: config.template,
        fileName: name,
      });
      showToast('Relatório gerado com sucesso.');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setGenerating(false);
      setWarnings([]);
    }
  }

  function handleGenerate() {
    const found = validateReport(issues, evidences);
    if (found.length > 0) {
      setWarnings(found);
      return;
    }
    void generatePdf();
  }

  if (loading || !project || !cycle) {
    return <Spinner label="Preparando relatório..." />;
  }

  if (pdfUrl) {
    return (
      <div>
        <PageHeader
          title="Relatório gerado com sucesso"
          description={fileName}
          actions={
            <>
              <a href={pdfUrl} target="_blank" rel="noreferrer">
                <Button>Visualizar PDF</Button>
              </a>
              <a href={pdfUrl} download={fileName}>
                <Button variant="secondary">Baixar</Button>
              </a>
              <Button variant="ghost" onClick={() => setPdfUrl(null)}>
                Gerar novamente
              </Button>
            </>
          }
        />
        <iframe title="Prévia do relatório" src={pdfUrl} className="h-[80vh] w-full rounded-2xl border border-line bg-surface" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow={project.name}
        title="Gerar relatório PDF"
        description={cycle.name}
        actions={
          <Link to={`/cycles/${cycle.id}`}>
            <Button className="border border-teal bg-paper text-teal hover:bg-teal hover:text-paper">
              <ArrowLeft size={16} />
              Voltar ao ciclo
            </Button>
          </Link>
        }
      />
      <Card className="grid max-w-3xl gap-4">
        <Input
          label="Título do relatório"
          value={config.title}
          onChange={(event) => setConfig((current) => ({ ...current, title: event.target.value }))}
        />
        <Select
          label="Modelo"
          value={config.template}
          onChange={(event) => setConfig((current) => ({ ...current, template: event.target.value as ReportTemplate }))}
          options={Object.entries(REPORT_TEMPLATE_LABEL).map(([value, label]) => ({ value, label }))}
        />
        <Checkbox
          label="Incluir capa"
          checked={config.includeCover}
          onChange={(checked) => setConfig((current) => ({ ...current, includeCover: checked }))}
        />
        <Checkbox
          label="Incluir resumo"
          checked={config.includeSummary}
          onChange={(checked) => setConfig((current) => ({ ...current, includeSummary: checked }))}
        />
        <Checkbox
          label="Incluir gráficos"
          checked={config.includeCharts}
          onChange={(checked) => setConfig((current) => ({ ...current, includeCharts: checked }))}
        />
        <Checkbox
          label="Incluir evidências"
          checked={config.includeEvidences}
          onChange={(checked) => setConfig((current) => ({ ...current, includeEvidences: checked }))}
        />
        <Checkbox
          label="Incluir conclusão"
          checked={config.includeConclusion}
          onChange={(checked) => setConfig((current) => ({ ...current, includeConclusion: checked }))}
        />
        <Textarea
          label="Conclusão"
          value={config.conclusion}
          onChange={(event) => setConfig((current) => ({ ...current, conclusion: event.target.value }))}
        />
        <div className="flex justify-end">
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? 'Gerando...' : 'Gerar relatório PDF'}
          </Button>
        </div>
      </Card>

      {warnings.length > 0 ? (
        <ConfirmDialog
          title="Atenção"
          description={`${warnings.map((item) => item.message).join(' ')} Deseja gerar o relatório mesmo assim?`}
          confirmLabel="Gerar mesmo assim"
          cancelLabel="Cancelar"
          onCancel={() => setWarnings([])}
          onConfirm={() => void generatePdf()}
        />
      ) : null}
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-teal"
      />
      {label}
    </label>
  );
}
