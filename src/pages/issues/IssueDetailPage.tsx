import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { PriorityBadge, SeverityBadge, StatusBadge, TypeBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/contexts/ToastContext';
import { ISSUE_STATUS_LABEL, ISSUE_STATUSES, PRIORITIES, PRIORITY_LABEL, SEVERITIES, SEVERITY_LABEL } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import { formatDateTime } from '@/lib/format';
import { listEvidences } from '@/services/evidenceService';
import { deleteIssueById, getIssue, updateIssue } from '@/services/issueService';
import type { Evidence, Issue, IssueStatus, Priority, Severity } from '@/types';

export function IssueDetailPage() {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!issueId) {
      return;
    }

    const id = issueId;

    async function load() {
      try {
        const current = await getIssue(id);
        if (!current) {
          showToast('Ocorrência não encontrada.', 'error');
          navigate('/projects');
          return;
        }
        setIssue(current);
        setEvidences(await listEvidences(current.id));
      } catch (error) {
        showToast(getErrorMessage(error), 'error');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [issueId, navigate, showToast]);

  async function changeField(field: 'status' | 'severity' | 'priority', value: string) {
    if (!issue) {
      return;
    }
    try {
      await updateIssue(issue.id, { [field]: value });
      setIssue({ ...issue, [field]: value } as Issue);
      showToast('Ocorrência atualizada.');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  }

  async function handleDelete() {
    if (!issue) {
      return;
    }
    try {
      await deleteIssueById(issue.id);
      showToast('Ocorrência excluída.');
      navigate(`/cycles/${issue.cycleId}`);
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  }

  if (loading || !issue) {
    return <Spinner label="Carregando ocorrência..." />;
  }

  return (
    <div>
      <PageHeader
        eyebrow={issue.code}
        title={issue.title}
        description={`Criada por ${issue.authorName} em ${formatDateTime(issue.createdAt)}`}
        actions={
          <>
            <Link to={`/cycles/${issue.cycleId}`}>
              <Button variant="ghost">Voltar ao ciclo</Button>
            </Link>
            <Link to={`/issues/${issue.id}/edit`}>
              <Button variant="secondary">Editar</Button>
            </Link>
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              Excluir
            </Button>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <TypeBadge value={issue.type} />
        <SeverityBadge value={issue.severity} />
        <PriorityBadge value={issue.priority} />
        <StatusBadge value={issue.status} />
      </div>

      <Card className="mb-5 grid gap-4 md:grid-cols-3">
        <Select
          label="Status"
          value={issue.status}
          onChange={(event) => changeField('status', event.target.value as IssueStatus)}
          options={ISSUE_STATUSES.map((item) => ({ value: item, label: ISSUE_STATUS_LABEL[item] }))}
        />
        <Select
          label="Severidade"
          value={issue.severity}
          onChange={(event) => changeField('severity', event.target.value as Severity)}
          options={SEVERITIES.map((item) => ({ value: item, label: SEVERITY_LABEL[item] }))}
        />
        <Select
          label="Prioridade"
          value={issue.priority}
          onChange={(event) => changeField('priority', event.target.value as Priority)}
          options={PRIORITIES.map((item) => ({ value: item, label: PRIORITY_LABEL[item] }))}
        />
      </Card>

      <Card className="mb-5">
        <Section title="Descrição" text={issue.description} />
        {issue.assignee ? <Section title="Responsável" text={issue.assignee} /> : null}
        {issue.notes ? <Section title="Observações" text={issue.notes} /> : null}
      </Card>

      {issue.type === 'bug' ? (
        <>
          <Card className="mb-5 grid gap-4">
            <Section title="Ambiente" text={`Ambiente: ${issue.environment || '—'}\nVersão: ${issue.version || '—'}\nNavegador: ${issue.browser || '—'}\nSistema: ${issue.operatingSystem || '—'}\nDispositivo: ${issue.device || '—'}`} />
            <Section title="Pré-condições" text={issue.preconditions} />
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Passos para reprodução</h3>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                {issue.reproductionSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
            <Section title="Resultado esperado" text={issue.expectedResult} />
            <Section title="Resultado encontrado" text={issue.actualResult} />
            <Section title="Impacto" text={issue.impact} />
          </Card>
        </>
      ) : null}

      {issue.type === 'feature' ? (
        <Card className="mb-5 grid gap-4">
          <Section title="Objetivo" text={issue.objective} />
          <Section title="Regras de negócio" text={issue.businessRules} />
          <Section title="Critérios de aceite" text={issue.acceptanceCriteria} />
        </Card>
      ) : null}

      {issue.type === 'melhoria' ? (
        <Card className="mb-5 grid gap-4">
          <Section title="Situação atual" text={issue.currentSituation} />
          <Section title="Problema/oportunidade" text={issue.opportunity} />
          <Section title="Sugestão" text={issue.suggestion} />
          <Section title="Benefício esperado" text={issue.expectedBenefit} />
        </Card>
      ) : null}

      {issue.type === 'correcao' ? (
        <Card className="mb-5 grid gap-4">
          <Section title="Problema original" text={issue.originalProblem} />
          <Section title="Correção realizada" text={issue.correctionMade} />
          <Section title="Resultado após correção" text={issue.resultAfterCorrection} />
          <Section title="Versão corrigida" text={issue.correctedVersion} />
          <Section title="Data da correção" text={issue.correctionDate} />
          <Section title="Responsável" text={issue.correctionOwner} />
        </Card>
      ) : null}

      <Card>
        <h2 className="mb-4 font-display text-2xl">Evidências</h2>
        {evidences.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma evidência anexada.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {evidences.map((evidence, index) => (
              <figure key={evidence.id} className="overflow-hidden rounded-2xl border border-line">
                <img src={evidence.url} alt={evidence.caption || `Evidência ${index + 1}`} className="max-h-80 w-full object-contain bg-paper" />
                <figcaption className="px-4 py-3 text-sm text-muted">
                  Evidência {String(index + 1).padStart(2, '0')} · {evidence.caption || evidence.fileName}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </Card>

      {confirmDelete ? (
        <ConfirmDialog
          title="Excluir ocorrência"
          description="As evidências desta ocorrência também serão removidas."
          confirmLabel="Excluir"
          danger
          onCancel={() => setConfirmDelete(false)}
          onConfirm={handleDelete}
        />
      ) : null}
    </div>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  if (!text) {
    return null;
  }
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">{title}</h3>
      <p className="mt-2 whitespace-pre-wrap text-sm">{text}</p>
    </div>
  );
}
