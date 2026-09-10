import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { EvidenceUploader, type PendingEvidence } from '@/components/evidence/EvidenceUploader';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SelectWithOther } from '@/components/ui/SelectWithOther';
import { VersionField } from '@/components/ui/VersionField';
import { Spinner } from '@/components/ui/Spinner';
import { Textarea } from '@/components/ui/Textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import {
  BROWSERS,
  DEVICES,
  ENVIRONMENTS,
  ISSUE_STATUS_LABEL,
  ISSUE_STATUSES,
  ISSUE_TYPE_LABEL,
  ISSUE_TYPES,
  OPERATING_SYSTEMS,
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
      <form className="grid max-w-5xl gap-5" onSubmit={handleSubmit(onSubmit)}>
        <Card className="grid gap-4">
          <Select
            label="Tipo"
            hint="É a categoria da ocorrência: bug, feature, melhoria ou correção. Serve para mostrar os campos certos e organizar o relatório."
            options={ISSUE_TYPES.map((item) => ({ value: item, label: ISSUE_TYPE_LABEL[item] }))}
            {...register('type')}
          />
          <Input
            label="Título"
            error={errors.title?.message}
            hint="É o nome curto do que foi encontrado. Serve para identificar a ocorrência na lista e no PDF."
            {...register('title')}
          />
          <Textarea
            label="Descrição"
            error={errors.description?.message}
            hint="É a explicação geral da ocorrência. Serve para detalhar o que aconteceu ou o que está sendo pedido."
            {...register('description')}
          />
        </Card>

        <Card className="grid gap-4">
          <h2 className="font-display text-2xl">Classificação</h2>
          <Select
            label="Severidade"
            hint="É o impacto no sistema, de crítica a baixa. Serve para mostrar o quanto o problema prejudica o uso."
            options={SEVERITIES.map((item) => ({ value: item, label: SEVERITY_LABEL[item] }))}
            {...register('severity')}
          />
          <Select
            label="Prioridade"
            hint="É a urgência de tratar a ocorrência, de urgente a baixa. Serve para definir a ordem de correção."
            options={PRIORITIES.map((item) => ({ value: item, label: PRIORITY_LABEL[item] }))}
            {...register('priority')}
          />
          <Select
            label="Status"
            hint="É o andamento da ocorrência, como aberto, corrigido ou aprovado. Serve para saber o que já foi resolvido e o que ficou pendente."
            options={ISSUE_STATUSES.map((item) => ({ value: item, label: ISSUE_STATUS_LABEL[item] }))}
            {...register('status')}
          />
          <Input
            label="Responsável"
            hint="É quem está tratando esta ocorrência. Serve para registrar a pessoa de desenvolvimento ou suporte."
            {...register('assignee')}
          />
        </Card>

        {type === 'bug' ? (
          <>
            <Card className="grid gap-4">
              <h2 className="font-display text-2xl">Ambiente</h2>
              <Controller
                name="environment"
                control={control}
                render={({ field }) => (
                  <SelectWithOther
                    label="Ambiente"
                    hint="É o ambiente em que o bug apareceu. Escolha uma opção ou use Outro se for um ambiente diferente."
                    options={ENVIRONMENTS}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name="version"
                control={control}
                render={({ field }) => (
                  <VersionField
                    label="Versão"
                    hint="Vem da versão do ciclo. Use Patch, Minor ou Major se o teste foi em uma build mais nova."
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name="browser"
                control={control}
                render={({ field }) => (
                  <SelectWithOther
                    label="Navegador"
                    hint="É o navegador usado no teste. O sistema tenta preencher automaticamente; use Outro se precisar."
                    options={BROWSERS}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name="operatingSystem"
                control={control}
                render={({ field }) => (
                  <SelectWithOther
                    label="Sistema operacional"
                    hint="É o sistema do computador ou celular. O sistema tenta preencher automaticamente; use Outro se precisar."
                    options={OPERATING_SYSTEMS}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name="device"
                control={control}
                render={({ field }) => (
                  <SelectWithOther
                    label="Dispositivo"
                    hint="É o aparelho usado no teste. O sistema tenta preencher automaticamente; use Outro se precisar."
                    options={DEVICES}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </Card>
            <Card className="grid gap-4">
              <h2 className="font-display text-2xl">Reprodução</h2>
              <Textarea
                label="Pré-condições"
                hint="É o que precisa existir antes de começar o teste. Serve para deixar o cenário pronto para reproduzir o bug."
                {...register('preconditions')}
              />
              {steps.fields.map((field, index) => (
                <Input
                  key={field.id}
                  label={`Passo ${index + 1}`}
                  error={index === 0 ? errors.reproductionSteps?.message ?? errors.reproductionSteps?.[0]?.value?.message : undefined}
                  hint="É uma ação da reprodução. Serve para ensinar, passo a passo, como chegar no erro."
                  {...register(`reproductionSteps.${index}.value`)}
                />
              ))}
              <Button variant="secondary" onClick={() => steps.append({ value: '' })}>
                + Adicionar passo
              </Button>
            </Card>
            <Card className="grid gap-4">
              <h2 className="font-display text-2xl">Resultados</h2>
              <Textarea
                label="Resultado esperado"
                error={errors.expectedResult?.message}
                hint="É o que deveria acontecer. Serve para comparar o comportamento correto com o que foi encontrado."
                {...register('expectedResult')}
              />
              <Textarea
                label="Resultado encontrado"
                error={errors.actualResult?.message}
                hint="É o que de fato aconteceu. Serve para descrever o erro visto no teste."
                {...register('actualResult')}
              />
              <Textarea
                label="Impacto"
                hint="É o prejuízo causado pelo bug. Serve para explicar o que o usuário ou o negócio perde com o erro."
                {...register('impact')}
              />
            </Card>
          </>
        ) : null}

        {type === 'feature' ? (
          <Card className="grid gap-4">
            <h2 className="font-display text-2xl">Feature</h2>
            <Textarea
              label="Objetivo"
              hint="É o propósito desta funcionalidade. Serve para explicar o que ela deve resolver ou permitir."
              {...register('objective')}
            />
            <Textarea
              label="Regras de negócio"
              hint="São as regras que a funcionalidade precisa cumprir. Serve para documentar o que o sistema deve aceitar ou recusar."
              {...register('businessRules')}
            />
            <Textarea
              label="Critérios de aceite"
              hint="São as condições para considerar a feature pronta. Serve para validar se o que foi entregue está correto."
              {...register('acceptanceCriteria')}
            />
          </Card>
        ) : null}

        {type === 'melhoria' ? (
          <Card className="grid gap-4">
            <h2 className="font-display text-2xl">Melhoria</h2>
            <Textarea
              label="Situação atual"
              hint="É como o sistema funciona hoje. Serve para mostrar o ponto de partida da melhoria."
              {...register('currentSituation')}
            />
            <Textarea
              label="Problema/oportunidade"
              hint="É o que está ruim ou pode melhorar. Serve para justificar por que a mudança vale a pena."
              {...register('opportunity')}
            />
            <Textarea
              label="Sugestão de melhoria"
              hint="É a proposta de mudança. Serve para descrever o que deveria ser feito."
              {...register('suggestion')}
            />
            <Textarea
              label="Benefício esperado"
              hint="É o ganho esperado com a mudança. Serve para mostrar o valor da melhoria para o usuário ou o negócio."
              {...register('expectedBenefit')}
            />
          </Card>
        ) : null}

        {type === 'correcao' ? (
          <Card className="grid gap-4">
            <h2 className="font-display text-2xl">Correção</h2>
            <Textarea
              label="Problema original"
              hint="É o defeito que existia antes. Serve para registrar o que estava errado."
              {...register('originalProblem')}
            />
            <Textarea
              label="Correção realizada"
              hint="É o que foi alterado para resolver o problema. Serve para documentar a correção feita."
              {...register('correctionMade')}
            />
            <Textarea
              label="Resultado após correção"
              hint="É o comportamento depois do ajuste. Serve para confirmar se o problema foi resolvido."
              {...register('resultAfterCorrection')}
            />
            <Controller
              name="correctedVersion"
              control={control}
              render={({ field }) => (
                <VersionField
                  label="Versão corrigida"
                  hint="É a versão em que a correção entrou. Use Patch, Minor ou Major a partir da versão da ocorrência."
                  value={field.value}
                  onChange={field.onChange}
                  baseVersion={watch('version')}
                />
              )}
            />
            <Input
              label="Data da correção"
              type="date"
              hint="É o dia em que a correção foi feita. Serve para registrar quando o ajuste ocorreu."
              {...register('correctionDate')}
            />
            <Input
              label="Responsável"
              hint="É quem aplicou a correção. Serve para identificar a pessoa responsável pelo ajuste."
              {...register('correctionOwner')}
            />
          </Card>
        ) : null}

        <Card className="grid gap-4">
          <h2 className="font-display text-2xl">Evidências</h2>
          <p className="rounded-xl bg-paper px-3 py-2 text-xs leading-5 text-muted">
            São os prints da ocorrência. Servem para comprovar o que foi visto e entram no PDF quando a opção de
            evidências estiver marcada.
          </p>
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
          <Textarea
            label="Observações"
            hint="É um espaço livre para notas extras. Serve para registrar detalhes que não cabem nos outros campos."
            {...register('notes')}
          />
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
