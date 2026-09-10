import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { EvidenceUploader, type PendingEvidence } from '@/components/evidence/EvidenceUploader';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { Textarea } from '@/components/ui/Textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import {
  ISSUE_STATUS_LABEL,
  ISSUE_STATUSES,
  ISSUE_TYPE_LABEL,
  ISSUE_TYPES,
  PRIORITIES,
  PRIORITY_LABEL,
  SEVERITIES,
  SEVERITY_LABEL,
} from '@/lib/constants';
import { detectEnvironment } from '@/lib/environment';
import { getErrorMessage } from '@/lib/errors';
import { getCycle } from '@/services/cycleService';
import {
  deleteEvidence,
  listEvidences,
  reorderEvidences,
  updateEvidenceCaption,
  uploadEvidence,
} from '@/services/evidenceService';
import { createIssue, getIssue, updateIssue, type IssueInput } from '@/services/issueService';
import type { Evidence as EvidenceType } from '@/types';

const schema = z
  .object({
    type: z.enum(['bug', 'feature', 'melhoria', 'correcao']),
    title: z.string().min(1, 'Informe o título.'),
    description: z.string().min(1, 'Informe a descrição.'),
    status: z.enum([
      'aberto',
      'em_analise',
      'em_desenvolvimento',
      'corrigido',
      'retestado',
      'aprovado',
      'rejeitado',
      'reprovado',
      'bloqueado',
    ]),
    severity: z.enum(['critica', 'alta', 'media', 'baixa']),
    priority: z.enum(['urgente', 'alta', 'normal', 'baixa']),
    assignee: z.string(),
    notes: z.string(),
    preconditions: z.string(),
    reproductionSteps: z.array(z.object({ value: z.string() })),
    expectedResult: z.string(),
    actualResult: z.string(),
    impact: z.string(),
    environment: z.string(),
    version: z.string(),
    browser: z.string(),
    operatingSystem: z.string(),
    device: z.string(),
    objective: z.string(),
    businessRules: z.string(),
    acceptanceCriteria: z.string(),
    currentSituation: z.string(),
    opportunity: z.string(),
    suggestion: z.string(),
    expectedBenefit: z.string(),
    originalProblem: z.string(),
    correctionMade: z.string(),
    resultAfterCorrection: z.string(),
    correctedVersion: z.string(),
    correctionDate: z.string(),
    correctionOwner: z.string(),
  })
  .superRefine((values, context) => {
    if (values.type !== 'bug') {
      return;
    }
    if (values.reproductionSteps.filter((step) => step.value.trim()).length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['reproductionSteps'],
        message: 'Informe os passos para reprodução.',
      });
    }
    if (!values.expectedResult.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['expectedResult'],
        message: 'Informe o resultado esperado.',
      });
    }
    if (!values.actualResult.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['actualResult'],
        message: 'Informe o resultado encontrado.',
      });
    }
  });

type FormValues = z.infer<typeof schema>;

export function IssueFormPage() {
  const { cycleId, issueId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isEditing = Boolean(issueId);
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState('');
  const [resolvedCycleId, setResolvedCycleId] = useState(cycleId ?? '');
  const [savedEvidences, setSavedEvidences] = useState<EvidenceType[]>([]);
  const [pending, setPending] = useState<PendingEvidence[]>([]);

  const detected = detectEnvironment();
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'bug',
      title: '',
      description: '',
      status: 'aberto',
      severity: 'media',
      priority: 'normal',
      assignee: '',
      notes: '',
      preconditions: '',
      reproductionSteps: [{ value: '' }, { value: '' }, { value: '' }],
      expectedResult: '',
      actualResult: '',
      impact: '',
      environment: '',
      version: '',
      browser: detected.browser,
      operatingSystem: detected.operatingSystem,
      device: detected.device,
      objective: '',
      businessRules: '',
      acceptanceCriteria: '',
      currentSituation: '',
      opportunity: '',
      suggestion: '',
      expectedBenefit: '',
      originalProblem: '',
      correctionMade: '',
      resultAfterCorrection: '',
      correctedVersion: '',
      correctionDate: '',
      correctionOwner: user?.displayName ?? '',
    },
  });

  const steps = useFieldArray({ control, name: 'reproductionSteps' });
  const type = watch('type');

  useEffect(() => {
    async function load() {
      try {
        if (issueId) {
          const issue = await getIssue(issueId);
          if (!issue) {
            showToast('Ocorrência não encontrada.', 'error');
            navigate('/projects');
            return;
          }
          setProjectId(issue.projectId);
          setResolvedCycleId(issue.cycleId);
          setSavedEvidences(await listEvidences(issue.id));
          reset({
            type: issue.type,
            title: issue.title,
            description: issue.description,
            status: issue.status,
            severity: issue.severity,
            priority: issue.priority,
            assignee: issue.assignee,
            notes: issue.notes,
            preconditions: issue.preconditions,
            reproductionSteps:
              issue.reproductionSteps.length > 0
                ? issue.reproductionSteps.map((value) => ({ value }))
                : [{ value: '' }],
            expectedResult: issue.expectedResult,
            actualResult: issue.actualResult,
            impact: issue.impact,
            environment: issue.environment,
            version: issue.version,
            browser: issue.browser,
            operatingSystem: issue.operatingSystem,
            device: issue.device,
            objective: issue.objective,
            businessRules: issue.businessRules,
            acceptanceCriteria: issue.acceptanceCriteria,
            currentSituation: issue.currentSituation,
            opportunity: issue.opportunity,
            suggestion: issue.suggestion,
            expectedBenefit: issue.expectedBenefit,
            originalProblem: issue.originalProblem,
            correctionMade: issue.correctionMade,
            resultAfterCorrection: issue.resultAfterCorrection,
            correctedVersion: issue.correctedVersion,
            correctionDate: issue.correctionDate,
            correctionOwner: issue.correctionOwner,
          });
        } else if (cycleId) {
          const cycle = await getCycle(cycleId);
          if (!cycle) {
            showToast('Ciclo não encontrado.', 'error');
            navigate('/projects');
            return;
          }
          setProjectId(cycle.projectId);
          setResolvedCycleId(cycle.id);
          reset((current) => ({
            ...current,
            environment: cycle.environment,
            version: cycle.version,
          }));
        }
      } catch (error) {
        showToast(getErrorMessage(error), 'error');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [cycleId, issueId, navigate, reset, showToast]);

  async function persistEvidences(targetIssueId: string, targetProjectId: string, targetCycleId: string) {
    const startingOrder = savedEvidences.length;
    for (const [index, item] of pending.entries()) {
      const evidenceId = await uploadEvidence({
        file: item.file,
        issueId: targetIssueId,
        projectId: targetProjectId,
        cycleId: targetCycleId,
        order: startingOrder + index,
      });
      if (item.caption) {
        await updateEvidenceCaption(evidenceId, item.caption);
      }
      URL.revokeObjectURL(item.previewUrl);
    }
  }

  async function onSubmit(values: FormValues) {
    if (!user || !resolvedCycleId || !projectId) {
      return;
    }

    const payload: IssueInput = {
      projectId,
      cycleId: resolvedCycleId,
      type: values.type,
      title: values.title,
      description: values.description,
      status: values.status,
      severity: values.severity,
      priority: values.priority,
      assignee: values.assignee,
      notes: values.notes,
      preconditions: values.preconditions,
      reproductionSteps: values.reproductionSteps.map((step) => step.value).filter((step) => step.trim()),
      expectedResult: values.expectedResult,
      actualResult: values.actualResult,
      impact: values.impact,
      environment: values.environment,
      version: values.version,
      browser: values.browser,
      operatingSystem: values.operatingSystem,
      device: values.device,
      objective: values.objective,
      businessRules: values.businessRules,
      acceptanceCriteria: values.acceptanceCriteria,
      currentSituation: values.currentSituation,
      opportunity: values.opportunity,
      suggestion: values.suggestion,
      expectedBenefit: values.expectedBenefit,
      originalProblem: values.originalProblem,
      correctionMade: values.correctionMade,
      resultAfterCorrection: values.resultAfterCorrection,
      correctedVersion: values.correctedVersion,
      correctionDate: values.correctionDate,
      correctionOwner: values.correctionOwner,
    };

    try {
      const id = issueId ?? (await createIssue(user.id, user.displayName, payload));
      if (issueId) {
        await updateIssue(issueId, payload);
      }
      await persistEvidences(id, projectId, resolvedCycleId);
      showToast(issueId ? 'Ocorrência atualizada.' : 'Ocorrência criada.');
      navigate(`/issues/${id}`);
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  }

  if (loading) {
    return <Spinner label="Carregando ocorrência..." />;
  }

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Editar ocorrência' : 'Nova ocorrência'}
        description="Os campos mudam conforme o tipo selecionado."
      />
      <form className="grid max-w-4xl gap-5" onSubmit={handleSubmit(onSubmit)}>
        <Card className="grid gap-4">
          <Select
            label="Tipo"
            options={ISSUE_TYPES.map((item) => ({ value: item, label: ISSUE_TYPE_LABEL[item] }))}
            {...register('type')}
          />
          <Input label="Título" error={errors.title?.message} {...register('title')} />
          <Textarea label="Descrição" error={errors.description?.message} {...register('description')} />
        </Card>

        <Card className="grid gap-4">
          <h2 className="font-display text-2xl">Classificação</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Select
              label="Severidade"
              options={SEVERITIES.map((item) => ({ value: item, label: SEVERITY_LABEL[item] }))}
              {...register('severity')}
            />
            <Select
              label="Prioridade"
              options={PRIORITIES.map((item) => ({ value: item, label: PRIORITY_LABEL[item] }))}
              {...register('priority')}
            />
            <Select
              label="Status"
              options={ISSUE_STATUSES.map((item) => ({ value: item, label: ISSUE_STATUS_LABEL[item] }))}
              {...register('status')}
            />
          </div>
          <Input label="Responsável" {...register('assignee')} />
        </Card>

        {type === 'bug' ? (
          <>
            <Card className="grid gap-4">
              <h2 className="font-display text-2xl">Ambiente</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Ambiente" {...register('environment')} />
                <Input label="Versão" {...register('version')} />
                <Input label="Navegador" {...register('browser')} />
                <Input label="Sistema operacional" {...register('operatingSystem')} />
                <Input label="Dispositivo" {...register('device')} />
              </div>
            </Card>
            <Card className="grid gap-4">
              <h2 className="font-display text-2xl">Reprodução</h2>
              <Textarea label="Pré-condições" {...register('preconditions')} />
              {steps.fields.map((field, index) => (
                <Input
                  key={field.id}
                  label={`Passo ${index + 1}`}
                  error={index === 0 ? errors.reproductionSteps?.message ?? errors.reproductionSteps?.[0]?.value?.message : undefined}
                  {...register(`reproductionSteps.${index}.value`)}
                />
              ))}
              <Button variant="secondary" onClick={() => steps.append({ value: '' })}>
                + Adicionar passo
              </Button>
            </Card>
            <Card className="grid gap-4">
              <h2 className="font-display text-2xl">Resultados</h2>
              <Textarea label="Resultado esperado" error={errors.expectedResult?.message} {...register('expectedResult')} />
              <Textarea label="Resultado encontrado" error={errors.actualResult?.message} {...register('actualResult')} />
              <Textarea label="Impacto" {...register('impact')} />
            </Card>
          </>
        ) : null}

        {type === 'feature' ? (
          <Card className="grid gap-4">
            <h2 className="font-display text-2xl">Feature</h2>
            <Textarea label="Objetivo" {...register('objective')} />
            <Textarea label="Regras de negócio" {...register('businessRules')} />
            <Textarea label="Critérios de aceite" {...register('acceptanceCriteria')} />
          </Card>
        ) : null}

        {type === 'melhoria' ? (
          <Card className="grid gap-4">
            <h2 className="font-display text-2xl">Melhoria</h2>
            <Textarea label="Situação atual" {...register('currentSituation')} />
            <Textarea label="Problema/oportunidade" {...register('opportunity')} />
            <Textarea label="Sugestão de melhoria" {...register('suggestion')} />
            <Textarea label="Benefício esperado" {...register('expectedBenefit')} />
          </Card>
        ) : null}

        {type === 'correcao' ? (
          <Card className="grid gap-4">
            <h2 className="font-display text-2xl">Correção</h2>
            <Textarea label="Problema original" {...register('originalProblem')} />
            <Textarea label="Correção realizada" {...register('correctionMade')} />
            <Textarea label="Resultado após correção" {...register('resultAfterCorrection')} />
            <div className="grid gap-4 md:grid-cols-3">
              <Input label="Versão corrigida" {...register('correctedVersion')} />
              <Input label="Data da correção" type="date" {...register('correctionDate')} />
              <Input label="Responsável" {...register('correctionOwner')} />
            </div>
          </Card>
        ) : null}

        <Card className="grid gap-4">
          <h2 className="font-display text-2xl">Evidências</h2>
          <EvidenceUploader
            saved={savedEvidences}
            pending={pending}
            onPendingChange={setPending}
            onCaptionChange={async (id, caption) => {
              setSavedEvidences((current) => current.map((item) => (item.id === id ? { ...item, caption } : item)));
              await updateEvidenceCaption(id, caption);
            }}
            onReorderSaved={async (orderedIds) => {
              setSavedEvidences((current) =>
                [...current].sort((left, right) => orderedIds.indexOf(left.id) - orderedIds.indexOf(right.id)),
              );
              await reorderEvidences(orderedIds);
            }}
            onDeleteSaved={async (evidence) => {
              await deleteEvidence(evidence);
              setSavedEvidences((current) => current.filter((item) => item.id !== evidence.id));
            }}
          />
        </Card>

        <Card>
          <Textarea label="Observações" {...register('notes')} />
        </Card>

        <div className="flex justify-end gap-2">
          <Link to={issueId ? `/issues/${issueId}` : `/cycles/${resolvedCycleId}`}>
            <Button variant="secondary">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  );
}
