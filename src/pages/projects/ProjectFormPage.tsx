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
import { PROJECT_STATUS_LABEL, PROJECT_STATUSES } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import { createProject, getProject, updateProject } from '@/services/projectService';
import type { ProjectStatus } from '@/types';

const schema = z.object({
  name: z.string().min(2, 'Informe o nome do projeto.'),
  description: z.string(),
  client: z.string(),
  version: z.string(),
  environment: z.string(),
  owner: z.string(),
  status: z.enum(['ativo', 'concluido', 'arquivado']),
});

type FormValues = z.infer<typeof schema>;

export function ProjectFormPage() {
  const { projectId } = useParams();
  const isEditing = Boolean(projectId);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(isEditing);

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
      client: '',
      version: '',
      environment: '',
      owner: user?.displayName ?? '',
      status: 'ativo',
    },
  });

  useEffect(() => {
    if (!projectId) {
      return;
    }

    const id = projectId;

    async function load() {
      try {
        const project = await getProject(id);
        if (!project) {
          showToast('Projeto não encontrado.', 'error');
          navigate('/projects');
          return;
        }
        reset({
          name: project.name,
          description: project.description,
          client: project.client,
          version: project.version,
          environment: project.environment,
          owner: user?.displayName ?? project.owner,
          status: project.status,
        });
      } catch (error) {
        showToast(getErrorMessage(error), 'error');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [projectId, navigate, reset, showToast, user]);

  async function onSubmit(values: FormValues) {
    if (!user) {
      return;
    }
    try {
      const payload = { ...values, owner: user.displayName };
      if (projectId) {
        await updateProject(projectId, payload);
        showToast('Projeto atualizado.');
        navigate(`/projects/${projectId}`);
        return;
      }
      const id = await createProject(user.id, payload);
      showToast('Projeto criado.');
      navigate(`/projects/${id}`);
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  }

  if (loading) {
    return <Spinner label="Carregando projeto..." />;
  }

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Editar projeto' : 'Novo projeto'}
        description="Informe os dados principais do sistema que será testado."
      />
      <Card className="max-w-3xl">
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Nome" error={errors.name?.message} {...register('name')} />
          <Textarea label="Descrição" {...register('description')} />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Cliente" {...register('client')} />
            <Input label="Versão" {...register('version')} />
            <Input label="Ambiente principal" {...register('environment')} />
            <Input label="Responsável pelo QA" readOnly className="bg-paper text-muted" {...register('owner')} />
          </div>
          <Select
            label="Status"
            options={PROJECT_STATUSES.map((status) => ({
              value: status,
              label: PROJECT_STATUS_LABEL[status as ProjectStatus],
            }))}
            {...register('status')}
          />
          <div className="flex justify-end gap-2">
            <Link to={projectId ? `/projects/${projectId}` : '/projects'}>
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
