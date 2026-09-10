import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { AuthShell } from '@/components/layout/AuthShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/contexts/ToastContext';
import { getErrorMessage } from '@/lib/errors';
import { registerUser } from '@/services/authService';
import { isFirebaseConfigured } from '@/services/firebase';

const schema = z.object({
  name: z.string().min(2, 'Informe seu nome.'),
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const { showToast } = useToast();
  const configured = isFirebaseConfigured();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '' },
  });

  async function onSubmit(values: FormValues) {
    try {
      await registerUser(values.name, values.email, values.password);
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  }

  return (
    <AuthShell title="Criar conta" subtitle="Comece a documentar testes em poucos minutos.">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Nome"
          error={errors.name?.message}
          hint="É o seu nome de QA. Serve para aparecer como Responsável pelo QA nos projetos e no PDF."
          {...register('name')}
        />
        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          hint="É o e-mail da nova conta. Serve para login e recuperação de senha."
          {...register('email')}
        />
        <Input
          label="Senha"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          hint="É a senha de acesso. Deve ter pelo menos 6 caracteres."
          {...register('password')}
        />
        <Button type="submit" disabled={isSubmitting || !configured}>
          {isSubmitting ? 'Criando...' : 'Criar conta'}
        </Button>
      </form>
      <Link to="/login" className="mt-6 inline-block text-sm text-muted hover:text-ink">
        Já tenho conta
      </Link>
    </AuthShell>
  );
}
