import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
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
import { CYCLE_NAMES, CYCLE_STATUS_LABEL, CYCLE_STATUSES, ENVIRONMENTS } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import { createCycle, getCycle, updateCycle } from '@/services/cycleService';
import { getProject } from '@/services/projectService';
import type { CycleStatus } from '@/types';

const schema = z.object({
  name: z.string().min(2, 'Informe o nome do ciclo.'),
  description: z.string(),
  version: z.string(),
  environment: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  owner: z.string(),
  status: z.enum(['ativo', 'concluido', 'arquivado']),
});

type FormValues = z.infer<typeof schema>;

export function CycleFormPage() {
  const { projectId, cycleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isEditing = Boolean(cycleId);
  const [loading, setLoading] = useState(true);
  const [resolvedProjectId, setResolvedProjectId] = useState(projectId ?? '');

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      version: '',
      environment: '',
      startDate: '',
      endDate: '',
      owner: user?.displayName ?? '',
      status: 'ativo',
    },
  });

  useEffect(() => {
    async function load() {
      try {
        if (cycleId) {
          const cycle = await getCycle(cycleId);
          if (!cycle) {
            showToast('Ciclo não encontrado.', 'error');
            navigate('/projects');
            return;
          }
          setResolvedProjectId(cycle.projectId);
          reset({
            name: cycle.name,
            description: cycle.description,
            version: cycle.version,
            environment: cycle.environment,
            startDate: cycle.startDate,
            endDate: cycle.endDate,
            owner: user?.displayName ?? cycle.owner,
            status: cycle.status,
          });
        } else if (projectId) {
          const project = await getProject(projectId);
          if (!project) {
            showToast('Projeto não encontrado.', 'error');
            navigate('/projects');
            return;
          }
          setResolvedProjectId(project.id);
          reset((current) => ({
            ...current,
            version: project.version,
            environment: project.environment,
            owner: user?.displayName ?? current.owner,
          }));
        }
      } catch (error) {
        showToast(getErrorMessage(error), 'error');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [cycleId, projectId, navigate, reset, showToast, user]);

  async function onSubmit(values: FormValues) {
    if (!user || !resolvedProjectId) {
      return;
    }
    try {
      const payload = { ...values, owner: user.displayName };
      if (cycleId) {
        await updateCycle(cycleId, payload);
        showToast('Ciclo atualizado.');
        navigate(`/cycles/${cycleId}`);
        return;
      }
      const id = await createCycle(user.id, resolvedProjectId, payload);
      showToast('Ciclo criado.');
      navigate(`/cycles/${id}`);
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  }

  if (loading) {
    return <Spinner label="Carregando ciclo..." />;
  }

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Editar ciclo' : 'Novo ciclo de teste'}
        description="Defina o período, a versão e o ambiente deste ciclo."
      />
      <Card className="max-w-5xl">
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <SelectWithOther
                label="Nome"
                error={errors.name?.message}
                hint="É o nome desta rodada de testes. Escolha um tipo comum ou use Outro para escrever um nome próprio."
                options={CYCLE_NAMES}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Textarea
            label="Descrição"
            hint="Explica o objetivo desta rodada. Serve para contextualizar o que será testado neste ciclo."
            {...register('description')}
          />
          <Controller
            name="version"
            control={control}
            render={({ field }) => (
              <VersionField
                label="Versão"
                hint="Vem da versão do projeto. Use Patch, Minor ou Major para subir a versão desta rodada."
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="environment"
            control={control}
            render={({ field }) => (
              <SelectWithOther
                label="Ambiente"
                hint="É o ambiente onde o teste acontece. Escolha uma opção ou use Outro se for um ambiente diferente."
                options={ENVIRONMENTS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Input
            label="Data inicial"
            type="date"
            hint="É o dia em que o ciclo começa. Serve para marcar o período de testes no relatório."
            {...register('startDate')}
          />
          <Input
            label="Data final"
            type="date"
            hint="É o dia em que o ciclo termina. Serve para delimitar o período desta rodada."
            {...register('endDate')}
          />
          <Input
            label="Responsável pelo QA"
            readOnly
            className="bg-paper text-muted"
            hint="É o seu nome de perfil. Serve para identificar quem conduziu os testes no projeto, no ciclo e no PDF."
            {...register('owner')}
          />
          <Select
            label="Status"
            hint="É a situação do ciclo: ativo, concluído ou arquivado. Serve para acompanhar se esta rodada ainda está em andamento."
            options={CYCLE_STATUSES.map((status) => ({
              value: status,
              label: CYCLE_STATUS_LABEL[status as CycleStatus],
            }))}
            {...register('status')}
          />
          <div className="flex justify-end gap-2">
            <Link to={cycleId ? `/cycles/${cycleId}` : `/projects/${resolvedProjectId}`}>
              <Button variant="secondary">Cancelar</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
