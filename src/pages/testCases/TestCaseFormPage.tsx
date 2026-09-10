import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm, type UseFormReturn } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { Textarea } from '@/components/ui/Textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { SCENARIO_TYPE_LABEL, SCENARIO_TYPES, STEP_FEEDBACK_LABEL, STEP_FEEDBACKS } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import { getProject } from '@/services/projectService';
import { createTestCase, getTestCase, updateTestCase } from '@/services/testCaseService';
import type { TestScenarioType, TestStepFeedback } from '@/types';

const stepSchema = z.object({
  action: z.string().min(1, 'Informe o passo.'),
  data: z.string(),
  expected: z.string(),
  feedback: z.enum(['', 'passed', 'failed', 'blocked']),
  result: z.string(),
  comment: z.string(),
});

const scenarioSchema = z.object({
  type: z.enum(['happy_path', 'negative']),
  title: z.string(),
  expected: z.string(),
  steps: z.array(stepSchema).min(1, 'Adicione ao menos um passo.'),
});

const schema = z.object({
  name: z.string().min(2, 'Informe o nome do caso de teste.'),
  description: z.string(),
  setupSteps: z.array(stepSchema),
  scenarios: z.array(scenarioSchema).min(1, 'Adicione ao menos um cenário.'),
});

type FormValues = z.infer<typeof schema>;

function emptyStep(): FormValues['setupSteps'][number] {
  return { action: '', data: '', expected: '', feedback: '' as TestStepFeedback, result: '', comment: '' };
}

function emptyScenario(type: TestScenarioType, title = ''): FormValues['scenarios'][number] {
  return { type, title, expected: '', steps: [emptyStep()] };
}

export function TestCaseFormPage() {
  const { projectId, caseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isEditing = Boolean(caseId);
  const [loading, setLoading] = useState(true);
  const [resolvedProjectId, setResolvedProjectId] = useState(projectId ?? '');

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      setupSteps: [
        { ...emptyStep(), action: 'Abrir a URL do sistema', expected: 'A URL abre.' },
      ],
      scenarios: [emptyScenario('happy_path'), emptyScenario('negative', 'Cenário 1')],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const setupArray = useFieldArray({ control, name: 'setupSteps' });
  const scenarioArray = useFieldArray({ control, name: 'scenarios' });

  useEffect(() => {
    async function load() {
      try {
        if (caseId && projectId) {
          const testCase = await getTestCase(projectId, caseId);
          if (!testCase) {
            showToast('Caso de teste não encontrado.', 'error');
            navigate('/projects');
            return;
          }
          setResolvedProjectId(testCase.projectId);
          reset({
            name: testCase.name,
            description: testCase.description,
            setupSteps: testCase.setupSteps.length > 0 ? testCase.setupSteps : [emptyStep()],
            scenarios: testCase.scenarios.length > 0 ? testCase.scenarios : [emptyScenario('happy_path')],
          });
          return;
        }
        if (projectId) {
          const project = await getProject(projectId);
          if (!project) {
            showToast('Projeto não encontrado.', 'error');
            navigate('/projects');
            return;
          }
          setResolvedProjectId(project.id);
        }
      } catch (error) {
        showToast(getErrorMessage(error), 'error');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [caseId, projectId, navigate, reset, showToast]);

  async function onSubmit(values: FormValues) {
    if (!user || !resolvedProjectId) {
      return;
    }
    try {
      if (caseId) {
        await updateTestCase(resolvedProjectId, caseId, values);
        showToast('Caso de teste atualizado.');
        navigate(`/projects/${resolvedProjectId}/casos/${caseId}`);
        return;
      }
      const id = await createTestCase(user.id, resolvedProjectId, values);
      showToast('Caso de teste criado.');
      navigate(`/projects/${resolvedProjectId}/casos/${id}`);
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  }

  if (loading) {
    return <Spinner label="Carregando caso de teste..." />;
  }

  const cancelTo = caseId
    ? `/projects/${resolvedProjectId}/casos/${caseId}`
    : '/casos';

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Editar caso de teste' : 'Novo caso de teste'}
        description="Registre o caso e os cenários depois da reunião com o cliente. Depois você gera o Excel no mesmo formato da planilha de testes."
      />
      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Card className="max-w-5xl">
          <div className="grid gap-4">
            <Input
              label="Nome do caso"
              hint="É o título da planilha, como Teste de Login - simples. Serve para identificar o que será testado neste caso."
              error={errors.name?.message}
              {...register('name')}
            />
            <Textarea
              label="Descrição"
              hint="Resume o escopo combinado com o cliente. Serve para contextualizar o caso antes da execução."
              {...register('description')}
            />
          </div>
        </Card>

        <Card className="max-w-5xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl">Passos iniciais</h2>
              <p className="mt-1 text-sm text-muted">
                Pré-condições do caso, como abrir a URL do sistema.
              </p>
            </div>
            <Button variant="secondary" onClick={() => setupArray.append(emptyStep())}>
              Adicionar passo
            </Button>
          </div>
          <div className="grid gap-4">
            {setupArray.fields.map((field, index) => (
              <StepFields
                key={field.id}
                form={form}
                name={`setupSteps.${index}`}
                onRemove={setupArray.fields.length > 0 ? () => setupArray.remove(index) : undefined}
                error={errors.setupSteps?.[index]?.action?.message}
              />
            ))}
          </div>
        </Card>

        {scenarioArray.fields.map((field, index) => (
          <Card key={field.id} className="max-w-5xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl">Cenário {index + 1}</h2>
              {scenarioArray.fields.length > 1 ? (
                <Button variant="ghost" onClick={() => scenarioArray.remove(index)}>
                  Remover cenário
                </Button>
              ) : null}
            </div>
            <div className="grid gap-4">
              <Select
                label="Tipo"
                hint="Caminho feliz é o fluxo que deve funcionar. Teste negativo é o que deve falhar ou ser bloqueado."
                options={SCENARIO_TYPES.map((type) => ({
                  value: type,
                  label: SCENARIO_TYPE_LABEL[type],
                }))}
                {...register(`scenarios.${index}.type`)}
              />
              <Input
                label="Título do cenário"
                hint="Ex.: Cenário 1 - Usuário tenta conectar sem preencher nenhuma informação. No Excel, esta linha fica em destaque."
                {...register(`scenarios.${index}.title`)}
              />
              <Input
                label="Resultado esperado do cenário"
                hint="O que deve acontecer neste cenário como um todo. Serve para a linha de título na planilha."
                {...register(`scenarios.${index}.expected`)}
              />
              <ScenarioSteps index={index} form={form} />
              {errors.scenarios?.[index]?.steps?.message ? (
                <p className="text-xs text-danger">{errors.scenarios[index]?.steps?.message}</p>
              ) : null}
            </div>
          </Card>
        ))}

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={() => scenarioArray.append(emptyScenario('negative', `Cenário ${scenarioArray.fields.length + 1}`))}>
            Adicionar cenário
          </Button>
          <Link to={cancelTo}>
            <Button variant="secondary">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
        {errors.scenarios?.message ? <p className="text-xs text-danger">{errors.scenarios.message}</p> : null}
      </form>
    </div>
  );
}

function ScenarioSteps({ index, form }: { index: number; form: UseFormReturn<FormValues> }) {
  const stepsArray = useFieldArray({ control: form.control, name: `scenarios.${index}.steps` });

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium">Passos do cenário</h3>
        <Button variant="secondary" onClick={() => stepsArray.append(emptyStep())}>
          Adicionar passo
        </Button>
      </div>
      {stepsArray.fields.map((field, stepIndex) => (
        <StepFields
          key={field.id}
          form={form}
          name={`scenarios.${index}.steps.${stepIndex}`}
          onRemove={stepsArray.fields.length > 1 ? () => stepsArray.remove(stepIndex) : undefined}
          error={form.formState.errors.scenarios?.[index]?.steps?.[stepIndex]?.action?.message}
        />
      ))}
    </div>
  );
}

function StepFields({
  form,
  name,
  onRemove,
  error,
}: {
  form: UseFormReturn<FormValues>;
  name: `setupSteps.${number}` | `scenarios.${number}.steps.${number}`;
  onRemove?: () => void;
  error?: string;
}) {
  return (
    <div className="grid gap-3 rounded-xl border border-line bg-paper p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Input label="Cenário / passo" error={error} {...form.register(`${name}.action`)} />
        <Input label="Dados" {...form.register(`${name}.data`)} />
        <Input label="Resultado esperado" {...form.register(`${name}.expected`)} />
        <Select
          label="Resultado"
          options={[
            { value: '', label: '—' },
            ...STEP_FEEDBACKS.map((feedback) => ({
              value: feedback,
              label: STEP_FEEDBACK_LABEL[feedback],
            })),
          ]}
          {...form.register(`${name}.feedback`)}
        />
        <Input label="Resultado obtido" {...form.register(`${name}.result`)} />
        <div className="md:col-span-2">
          <Input label="Comentário" {...form.register(`${name}.comment`)} />
        </div>
      </div>
      {onRemove ? (
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onRemove}>
            Remover passo
          </Button>
        </div>
      ) : null}
    </div>
  );
}
