import { pdf } from '@react-pdf/renderer';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FinalReportDocument } from '@/components/report/FinalReportDocument';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Textarea } from '@/components/ui/Textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getErrorMessage } from '@/lib/errors';
import { buildFinalReportData, buildFinalReportTexts, type FinalReportTexts } from '@/lib/finalReport';
import { buildReportFileName } from '@/lib/pdfFileName';
import { listCycles } from '@/services/cycleService';
import { listIssuesByCycle } from '@/services/issueService';
import { getProject, updateProject } from '@/services/projectService';
import { createReportRecord } from '@/services/reportService';
import type { Issue, Project, TestCycle } from '@/types';

export function ProjectFinalReportPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [cycles, setCycles] = useState<TestCycle[]>([]);
  const [issuesByCycle, setIssuesByCycle] = useState<Record<string, Issue[]>>({});
  const [title, setTitle] = useState('');
  const [texts, setTexts] = useState<FinalReportTexts>({
    summary: '',
    evolution: '',
    considerations: '',
    recommendations: '',
  });
  const [includePendingList, setIncludePendingList] = useState(false);
  const [includeSignature, setIncludeSignature] = useState(true);
  const [publicMode, setPublicMode] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [markCompleted, setMarkCompleted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (!projectId) {
      return;
    }

    const id = projectId;

    async function load() {
      try {
        const currentProject = await getProject(id);
        if (!currentProject) {
          showToast('Projeto não encontrado.', 'error');
          navigate('/projects');
          return;
        }
        const projectCycles = await listCycles(id);
        const entries = await Promise.all(
          projectCycles.map(async (cycle) => [cycle.id, await listIssuesByCycle(cycle.id)] as const),
        );
        const byCycle = Object.fromEntries(entries);
        setProject(currentProject);
        setCycles(projectCycles);
        setIssuesByCycle(byCycle);
        setTitle(`Considerações finais de QA — ${currentProject.name}`);
        setDisplayName(currentProject.name);
        setTexts(buildFinalReportTexts(currentProject.name, buildFinalReportData(projectCycles, byCycle)));
        setMarkCompleted(currentProject.status === 'ativo');
      } catch (error) {
        showToast(getErrorMessage(error), 'error');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [projectId, navigate, showToast]);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const data = useMemo(() => buildFinalReportData(cycles, issuesByCycle), [cycles, issuesByCycle]);
  const activeCycles = cycles.filter((cycle) => cycle.status === 'ativo');

  async function generatePdf() {
    if (!project || !user) {
      return;
    }
    setGenerating(true);
    try {
      const generatedAt = new Date();
      const shownName = displayName.trim() || project.name;
      const rename = (value: string) => (shownName === project.name ? value : value.split(project.name).join(shownName));
      const name = buildReportFileName(publicMode ? shownName : project.name, 'Consideracoes finais', generatedAt);
      const documentProject: Project = publicMode
        ? { ...project, name: shownName, client: '', description: '' }
        : project;
      const documentTexts: FinalReportTexts = {
        summary: rename(texts.summary),
        evolution: rename(texts.evolution),
        considerations: rename(texts.considerations),
        recommendations: rename(texts.recommendations),
      };
      const blob = await pdf(
        <FinalReportDocument
          project={documentProject}
          data={data}
          texts={documentTexts}
          title={rename(title)}
          generatedAt={generatedAt}
          qaOwner={user.displayName}
          includePendingList={includePendingList && !publicMode}
          showCycleDescriptions={!publicMode}
          signature={includeSignature ? user.signature : undefined}
        />,
      ).toBlob();
      const file = new File([blob], name, { type: 'application/pdf' });
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      setPdfBlob(file);
      setPdfUrl(URL.createObjectURL(file));
      setFileName(name);
      downloadNamedPdf(file, name);
      await createReportRecord({
        userId: user.id,
        projectId: project.id,
        cycleId: '',
        title,
        template: 'executivo',
        fileName: name,
      });
      if (markCompleted && project.status !== 'concluido') {
        await updateProject(project.id, {
          name: project.name,
          description: project.description,
          client: project.client,
          version: project.version,
          environment: project.environment,
          owner: project.owner,
          status: 'concluido',
        });
        setProject({ ...project, status: 'concluido' });
        setMarkCompleted(false);
      }
      showToast('Considerações finais geradas com sucesso.');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setGenerating(false);
      setConfirmOpen(false);
    }
  }

  function handleGenerate() {
    if (activeCycles.length > 0) {
      setConfirmOpen(true);
      return;
    }
    void generatePdf();
  }

  if (loading || !project) {
    return <Spinner label="Preparando considerações finais..." />;
  }

  if (pdfUrl) {
    return (
      <div>
        <PageHeader
          title="Documento gerado com sucesso"
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
                Voltar à edição
              </Button>
            </>
          }
        />
        <iframe title="Prévia do documento" src={pdfUrl} className="h-[80vh] w-full rounded-2xl border border-line bg-surface" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow={project.name}
        title="Considerações finais"
        description="Documento de encerramento para o cliente, com o resumo geral e a evolução de todos os ciclos de teste do projeto."
        actions={
          <Link to={`/projects/${project.id}`}>
            <Button className="border border-teal bg-paper text-teal hover:bg-teal hover:text-paper">
              <ArrowLeft size={16} />
              Voltar ao projeto
            </Button>
          </Link>
        }
      />

      {cycles.length === 0 ? (
        <EmptyState
          title="Nenhum ciclo cadastrado"
          description="Crie ao menos um ciclo com ocorrências para gerar as considerações finais."
          action={
            <Link to={`/projects/${project.id}/cycles/new`}>
              <Button>Criar ciclo</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Stat label="Ciclos" value={String(cycles.length)} />
            <Stat label="Ocorrências" value={String(data.allIssues.length)} />
            <Stat label="Resolvidas" value={`${data.resolved} (${data.resolutionRate}%)`} />
            <Stat label="Pendentes" value={String(data.pending)} />
          </div>

          <Card className="grid max-w-5xl gap-4">
            <label className="flex items-start gap-3 rounded-xl bg-paper px-3 py-3 text-sm">
              <input
                type="checkbox"
                checked={publicMode}
                onChange={(event) => setPublicMode(event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-teal"
              />
              <span>
                <strong>Versão pública (anonimizada)</strong>
                <span className="block text-xs leading-5 text-muted">
                  Para publicar, por exemplo, no LinkedIn: oculta o nome do cliente e a descrição do projeto, permite
                  trocar o nome do projeto e remove os títulos das ocorrências. Ficam apenas números e gráficos.
                </span>
              </span>
            </label>
            {publicMode ? (
              <Input
                label="Nome do projeto exibido"
                hint="Use um nome genérico (ex.: Plataforma de e-commerce). Substitui o nome real no PDF todo."
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            ) : null}
            <Input
              label="Título do documento"
              hint="É o nome que aparece na capa do PDF."
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <Textarea
              label="Resumo geral"
              hint="Texto de abertura com os números totais do projeto. Já vem preenchido, mas pode ser ajustado."
              value={texts.summary}
              onChange={(event) => setTexts((current) => ({ ...current, summary: event.target.value }))}
            />
            {texts.evolution ? (
              <Textarea
                label="Evolução entre ciclos"
                hint="Compara o primeiro e o último ciclo para mostrar o que evoluiu."
                value={texts.evolution}
                onChange={(event) => setTexts((current) => ({ ...current, evolution: event.target.value }))}
              />
            ) : null}
            <Textarea
              label="Considerações finais"
              hint="Parecer final do QA sobre o resultado dos testes."
              value={texts.considerations}
              onChange={(event) => setTexts((current) => ({ ...current, considerations: event.target.value }))}
            />
            <Textarea
              label="Recomendações"
              hint="Próximos passos sugeridos ao cliente."
              value={texts.recommendations}
              onChange={(event) => setTexts((current) => ({ ...current, recommendations: event.target.value }))}
            />
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={includePendingList && !publicMode}
                disabled={publicMode}
                onChange={(event) => setIncludePendingList(event.target.checked)}
                className="h-4 w-4 accent-teal"
              />
              Incluir lista de pendências remanescentes {publicMode ? '(indisponível na versão pública)' : ''}
            </label>
            {user?.signature ? (
              <div className="grid gap-2 rounded-xl bg-paper px-3 py-3 text-sm">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={includeSignature}
                    onChange={(event) => setIncludeSignature(event.target.checked)}
                    className="h-4 w-4 accent-teal"
                  />
                  Assinar o documento com a assinatura do meu perfil
                </label>
                {includeSignature ? (
                  <img src={user.signature} alt="Sua assinatura" className="max-h-16 self-start rounded bg-white p-2" />
                ) : null}
              </div>
            ) : (
              <p className="rounded-xl bg-paper px-3 py-3 text-sm text-muted">
                Você ainda não cadastrou uma assinatura.{' '}
                <Link to="/perfil" className="font-semibold text-teal">
                  Cadastrar no perfil
                </Link>{' '}
                para que ela saia no documento.
              </p>
            )}
            {project.status !== 'concluido' ? (
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={markCompleted}
                  onChange={(event) => setMarkCompleted(event.target.checked)}
                  className="h-4 w-4 accent-teal"
                />
                Marcar o projeto como concluído ao gerar
              </label>
            ) : null}
            <div className="flex justify-end">
              <Button onClick={handleGenerate} disabled={generating}>
                {generating ? 'Gerando...' : 'Gerar considerações finais PDF'}
              </Button>
            </div>
          </Card>
        </>
      )}

      {confirmOpen ? (
        <ConfirmDialog
          title="Atenção"
          description={`${activeCycles.length} ciclo(s) ainda estão com status Ativo (${activeCycles
            .map((cycle) => cycle.name)
            .join(', ')}). Deseja gerar o documento mesmo assim?`}
          confirmLabel="Gerar mesmo assim"
          cancelLabel="Cancelar"
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => void generatePdf()}
        />
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
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
