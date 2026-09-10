import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getErrorMessage } from '@/lib/errors';
import { canManageAccounts, changePassword, registerManagedUser, updateUserProfile } from '@/services/authService';

const schema = z.object({
  displayName: z.string().min(2, 'Informe o nome que deve aparecer no relatório.'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Informe a senha atual.'),
    newPassword: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres.'),
    confirmPassword: z.string().min(6, 'Confirme a nova senha.'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem.',
  });

const accountSchema = z.object({
  name: z.string().min(2, 'Informe o nome da conta.'),
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

type FormValues = z.infer<typeof schema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type AccountFormValues = z.infer<typeof accountSchema>;
type ProfileTab = 'dados' | 'senha' | 'conta';

export function ProfilePage() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const canCreateAccounts = Boolean(user && canManageAccounts(user));
  const [tab, setTab] = useState<ProfileTab>('dados');
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

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isChangingPassword },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const {
    register: registerAccount,
    handleSubmit: handleAccountSubmit,
    reset: resetAccount,
    formState: { errors: accountErrors, isSubmitting: isCreatingAccount },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  async function onChangePassword(values: PasswordFormValues) {
    try {
      await changePassword(values.currentPassword, values.newPassword);
      resetPassword();
      showToast('Senha atualizada.');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  }

  async function onCreateAccount(values: AccountFormValues) {
    try {
      await registerManagedUser(values.name, values.email, values.password);
      resetAccount();
      showToast('Conta criada. A pessoa já pode entrar com esse e-mail.');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  }

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
      <div className="mb-4 flex flex-wrap gap-2">
        <TabButton active={tab === 'dados'} onClick={() => setTab('dados')}>
          Dados
        </TabButton>
        <TabButton active={tab === 'senha'} onClick={() => setTab('senha')}>
          Senha
        </TabButton>
        {canCreateAccounts ? (
          <TabButton active={tab === 'conta'} onClick={() => setTab('conta')}>
            Criar conta
          </TabButton>
        ) : null}
      </div>

      {tab === 'dados' ? (
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
      ) : null}

      {tab === 'senha' ? (
      <Card className="max-w-5xl">
        <h2 className="mb-4 font-display text-2xl">Alterar senha</h2>
        <form className="grid gap-4" onSubmit={handlePasswordSubmit(onChangePassword)}>
          <Input
            label="Senha atual"
            type="password"
            autoComplete="current-password"
            error={passwordErrors.currentPassword?.message}
            hint="É a senha que você usa hoje. Serve para confirmar que é você quem está trocando."
            {...registerPassword('currentPassword')}
          />
          <Input
            label="Nova senha"
            type="password"
            autoComplete="new-password"
            error={passwordErrors.newPassword?.message}
            hint="É a nova senha da conta. Deve ter pelo menos 6 caracteres."
            {...registerPassword('newPassword')}
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            autoComplete="new-password"
            error={passwordErrors.confirmPassword?.message}
            hint="Repita a nova senha. Serve para evitar erro de digitação."
            {...registerPassword('confirmPassword')}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? 'Salvando...' : 'Salvar senha'}
            </Button>
          </div>
        </form>
      </Card>
      ) : null}

      {tab === 'conta' && canCreateAccounts ? (
      <Card className="max-w-5xl">
        <h2 className="mb-4 font-display text-2xl">Criar conta</h2>
        <form className="grid gap-4" onSubmit={handleAccountSubmit(onCreateAccount)}>
          <Input
            label="Nome"
            error={accountErrors.name?.message}
            hint="É o nome de QA da nova conta. Serve para aparecer como Responsável pelo QA."
            {...registerAccount('name')}
          />
          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            error={accountErrors.email?.message}
            hint="É o e-mail da nova conta. Serve para login e recuperação de senha."
            {...registerAccount('email')}
          />
          <Input
            label="Senha"
            type="password"
            autoComplete="new-password"
            error={accountErrors.password?.message}
            hint="É a senha inicial da conta. Deve ter pelo menos 6 caracteres."
            {...registerAccount('password')}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isCreatingAccount}>
              {isCreatingAccount ? 'Criando...' : 'Criar conta'}
            </Button>
          </div>
        </form>
      </Card>
      ) : null}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-semibold ${
        active ? 'bg-teal text-paper' : 'border border-line bg-surface text-ink hover:bg-paper'
      }`}
    >
      {children}
    </button>
  );
}
