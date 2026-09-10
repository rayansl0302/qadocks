import { pdf } from '@react-pdf/renderer';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { QaReportDocument } from '@/components/report/QaReportDocument';
import { PageHeader } from '@/components/layout/PageHeader';
import { PriorityBadge, SeverityBadge, StatusBadge, TypeBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getErrorMessage } from '@/lib/errors';
import { imageToDataUrl } from '@/lib/imageData';
import {
  buildFollowUpConclusion,
  buildPendingConclusion,
  splitIssuesByResolution,
} from '@/lib/issueResolution';
import { buildReportFileName } from '@/lib/pdfFileName';
import { buildReportStats } from '@/lib/reportStats';
import { validateReport } from '@/lib/reportValidation';
import { getCycle } from '@/services/cycleService';
import { listEvidencesByCycle } from '@/services/evidenceService';
import { listIssuesByCycle } from '@/services/issueService';
import { getProject } from '@/services/projectService';
import { createReportRecord } from '@/services/reportService';
import type { Evidence, Issue, Project, ReportConfig, ReportWarning, TestCycle } from '@/types';

const reportConfigBase: Omit<ReportConfig, 'title' | 'conclusion'> = {
  template: 'profissional',
  includeCover: true,
  includeSummary: true,
  includeCharts: true,
  includeEvidences: true,
  includeConclusion: true,
};

export function CycleFollowUpPage() {
  const { cycleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [cycle, setCycle] = useState<TestCycle | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [warnings, setWarnings] = useState<ReportWarning[]>([]);
  const [pendingGenerate, setPendingGenerate] = useState<null | 'acompanhamento' | 'pendencias'>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
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
        setCycle(currentCycle);
        setProject(currentProject);
        setIssues(await listIssuesByCycle(id));
        setEvidences(await listEvidencesByCycle(id));
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

  const { resolved, pending } = useMemo(() => splitIssuesByResolution(issues), [issues]);

  async function generatePdf(mode: 'acompanhamento' | 'pendencias') {
    if (!project || !cycle || !user) {
      return;
    }
    setGenerating(true);
    try {
      const selectedIssues = mode === 'pendencias' ? pending : issues;
      const selectedIds = new Set(selectedIssues.map((issue) => issue.id));
      const selectedEvidences = evidences.filter((evidence) => selectedIds.has(evidence.issueId));
      const evidencesWithImages = await Promise.all(
        selectedEvidences.map(async (evidence) => {
          try {
            return { ...evidence, dataUrl: await imageToDataUrl(evidence.url) };
          } catch {
            return evidence;
          }
        }),
      );
      const generatedAt = new Date();
      const variant = mode === 'pendencias' ? 'pendencias' : 'acompanhamento';
      const name = buildReportFileName(project.name, cycle.name, generatedAt, variant);
      const config: ReportConfig = {
        ...reportConfigBase,
        title:
          mode === 'pendencias'
            ? `Relatório de QA — Pendências (2ª versão) — ${project.name}`
            : `Acompanhamento de ocorrências — ${project.name}`,
        conclusion:
          mode === 'pendencias'
            ? buildPendingConclusion(cycle.name, issues.length, pending.length)
            : buildFollowUpConclusion(cycle.name, resolved.length, pending.length),
      };
      const blob = await pdf(
        <QaReportDocument
          project={project}
          cycle={cycle}
          issues={selectedIssues}
          evidences={evidencesWithImages}
          config={config}
          stats={buildReportStats(selectedIssues)}
          generatedAt={generatedAt}
          qaOwner={user.displayName}
          groupByResolution={mode === 'acompanhamento'}
        />,
      ).toBlob();
      const file = new File([blob], name, { type: 'application/pdf' });
      const url = URL.createObjectURL(file);
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      setPdfBlob(file);
      setPdfUrl(url);
      setFileName(name);
      downloadNamedPdf(file, name);
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
      setPendingGenerate(null);
    }
  }

  function handleGenerate(mode: 'acompanhamento' | 'pendencias') {
    const selectedIssues = mode === 'pendencias' ? pending : issues;
    const selectedIds = new Set(selectedIssues.map((issue) => issue.id));
    const found = validateReport(
      selectedIssues,
      evidences.filter((evidence) => selectedIds.has(evidence.issueId)),
    );
    if (found.length > 0) {
      setWarnings(found);
      setPendingGenerate(mode);
      return;
    }
    void generatePdf(mode);
  }

  if (loading || !project || !cycle) {
    return <Spinner label="Carregando acompanhamento..." />;
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
              <Button
                variant="secondary"
                onClick={() => {
                  if (pdfBlob) {
                    downloadNamedPdf(pdfBlob, fileName);
                  }
                }}
              >
                Baixar
              </Button>
              <Button variant="ghost" onClick={() => setPdfUrl(null)}>
                Voltar ao acompanhamento
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
        title="Acompanhamento de ocorrências"
        description="O que foi resolvido e o que ficou pendente, de acordo com o status cadastrado em cada ocorrência. Resolvidas: Aprovado ou Rejeitado. O restante entra como pendente."
        actions={
          <>
            <Link to={`/cycles/${cycle.id}`}>
              <Button className="border border-teal bg-paper text-teal hover:bg-teal hover:text-paper">
                <ArrowLeft size={16} />
                Voltar ao ciclo
              </Button>
            </Link>
            <Button
              variant="secondary"
              onClick={() => handleGenerate('acompanhamento')}
              disabled={generating || issues.length === 0}
            >
              {generating ? 'Gerando...' : 'Gerar acompanhamento PDF'}
            </Button>
            <Button onClick={() => handleGenerate('pendencias')} disabled={generating || pending.length === 0}>
              {generating ? 'Gerando...' : 'Gerar 2ª versão (pendentes)'}
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Stat label="Cadastradas" value={issues.length} />
        <Stat label="Resolvidas" value={resolved.length} />
        <Stat label="Pendentes" value={pending.length} />
      </div>

      {issues.length === 0 ? (
        <EmptyState
          title="Nenhuma ocorrência cadastrada"
          description="Registre ocorrências neste ciclo para acompanhar o que foi resolvido e o que ficou pendente."
          action={
            <Link to={`/cycles/${cycle.id}/issues/new`}>
              <Button>Nova ocorrência</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <IssueGroup title="Resolvidas" emptyText="Nenhuma ocorrência resolvida ainda." issues={resolved} />
          <IssueGroup title="Pendentes" emptyText="Nenhuma ocorrência pendente." issues={pending} />
        </div>
      )}

      {warnings.length > 0 && pendingGenerate ? (
        <ConfirmDialog
          title="Atenção"
          description={`${warnings.map((item) => item.message).join(' ')} Deseja gerar o relatório mesmo assim?`}
          confirmLabel="Gerar mesmo assim"
          cancelLabel="Cancelar"
          onCancel={() => {
            setWarnings([]);
            setPendingGenerate(null);
          }}
          onConfirm={() => void generatePdf(pendingGenerate)}
        />
      ) : null}
    </div>
  );
}

function IssueGroup({ title, emptyText, issues }: { title: string; emptyText: string; issues: Issue[] }) {
  return (
    <Card>
      <h2 className="font-display text-2xl">{title}</h2>
      {issues.length === 0 ? (
        <p className="mt-3 text-sm text-muted">{emptyText}</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {issues.map((issue) => (
            <Link key={issue.id} to={`/issues/${issue.id}`}>
              <div className="rounded-xl border border-line bg-paper p-4 transition hover:border-teal">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{issue.code}</p>
                <h3 className="mt-1 font-display text-xl">{issue.title}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <TypeBadge value={issue.type} />
                  <SeverityBadge value={issue.severity} />
                  <PriorityBadge value={issue.priority} />
                  <StatusBadge value={issue.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
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

function downloadNamedPdf(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
