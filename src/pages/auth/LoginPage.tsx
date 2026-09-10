import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { AuthShell } from '@/components/layout/AuthShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getErrorMessage } from '@/lib/errors';
import { loginUser } from '@/services/authService';
import { isFirebaseConfigured } from '@/services/firebase';

const schema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

type FormValues = z.infer<typeof schema>;

const REMEMBERED_USER_KEY = 'qa-remembered-user';

function saveRememberedUser(email: string): void {
  localStorage.setItem(REMEMBERED_USER_KEY, email);
}

function getRememberedUser(): string {
  return localStorage.getItem(REMEMBERED_USER_KEY) ?? '';
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const configured = isFirebaseConfigured();
  const from =
    typeof location.state === 'object' && location.state && 'from' in location.state
      ? String(location.state.from)
      : '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: getRememberedUser(), password: '' },
  });

  useEffect(() => {
    if (user && !loading) {
      navigate(from, { replace: true });
    }
  }, [user, loading, from, navigate]);

  async function onSubmit(values: FormValues) {
    try {
      await loginUser(values.email, values.password);
      saveRememberedUser(values.email);
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  }

  return (
    <AuthShell title="Entrar" subtitle="Acesse seus projetos, ciclos e relatórios de QA.">
      {!configured ? (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Configure as variáveis do Firebase no arquivo .env para habilitar o login.
        </p>
      ) : null}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Senha"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" disabled={isSubmitting || !configured}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
      <div className="mt-6 flex flex-col gap-2 text-sm text-muted">
        <Link to="/recuperar-senha" className="hover:text-ink">
          Esqueci minha senha
        </Link>
        <Link to="/cadastro" className="hover:text-ink">
          Criar conta
        </Link>
      </div>
    </AuthShell>
  );
}
