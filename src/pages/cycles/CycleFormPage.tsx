import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { CYCLE_STATUS_LABEL, CYCLE_STATUSES } from '@/lib/constants';
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
            owner: cycle.owner,
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
            owner: project.owner || current.owner,
          }));
        }
      } catch (error) {
        showToast(getErrorMessage(error), 'error');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [cycleId, projectId, navigate, reset, showToast]);

  async function onSubmit(values: FormValues) {
    if (!user || !resolvedProjectId) {
      return;
    }
    try {
      if (cycleId) {
        await updateCycle(cycleId, values);
        showToast('Ciclo atualizado.');
        navigate(`/cycles/${cycleId}`);
        return;
      }
      const id = await createCycle(user.id, resolvedProjectId, values);
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
      <Card className="max-w-3xl">
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Nome" error={errors.name?.message} {...register('name')} />
          <Textarea label="Descrição" {...register('description')} />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Versão" {...register('version')} />
            <Input label="Ambiente" {...register('environment')} />
            <Input label="Data inicial" type="date" {...register('startDate')} />
            <Input label="Data final" type="date" {...register('endDate')} />
            <Input label="Responsável" {...register('owner')} />
            <Select
              label="Status"
              options={CYCLE_STATUSES.map((status) => ({
                value: status,
                label: CYCLE_STATUS_LABEL[status as CycleStatus],
              }))}
              {...register('status')}
            />
          </div>
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
