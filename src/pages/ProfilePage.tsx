import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getErrorMessage } from '@/lib/errors';
import { updateUserProfile } from '@/services/authService';

const schema = z.object({
  displayName: z.string().min(2, 'Informe o nome que deve aparecer no relatório.'),
});

type FormValues = z.infer<typeof schema>;

export function ProfilePage() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: user?.displayName ?? '',
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      const updated = await updateUserProfile(values.displayName.trim());
      setUser(updated);
      showToast('Nome atualizado. Esse será o Responsável pelo QA.');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  }

  return (
    <div>
      <PageHeader
        title="Perfil"
        description="O nome salvo aqui é o que aparece como Responsável pelo QA nos projetos, ciclos e no PDF."
      />
      <Card className="max-w-5xl">
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Nome (Responsável pelo QA)"
            error={errors.displayName?.message}
            hint="É o nome que o sistema usa como Responsável pelo QA. Serve para aparecer nos projetos, ciclos e no PDF."
            {...register('displayName')}
          />
          <Input
            label="E-mail"
            value={user?.email ?? ''}
            readOnly
            className="bg-paper text-muted"
            hint="É o e-mail da sua conta. Serve para login e recuperação de senha; não pode ser alterado aqui."
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar nome'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
