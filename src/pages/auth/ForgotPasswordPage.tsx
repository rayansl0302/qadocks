import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { AuthShell } from '@/components/layout/AuthShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/contexts/ToastContext';
import { getErrorMessage } from '@/lib/errors';
import { recoverPassword } from '@/services/authService';
import { isFirebaseConfigured } from '@/services/firebase';

const schema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const { showToast } = useToast();
  const configured = isFirebaseConfigured();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: FormValues) {
    try {
      await recoverPassword(values.email);
      showToast('Enviamos um e-mail para redefinir sua senha.', 'success');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  }

  return (
    <AuthShell title="Recuperar senha" subtitle="Informe o e-mail da sua conta para receber o link de redefinição.">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Input label="E-mail" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Button type="submit" disabled={isSubmitting || !configured}>
          {isSubmitting ? 'Enviando...' : 'Enviar link'}
        </Button>
      </form>
      <Link to="/login" className="mt-6 inline-block text-sm text-muted hover:text-ink">
        Voltar ao login
      </Link>
    </AuthShell>
  );
}
