import type { TestScenario, TestStep } from '@/types';

export const EXAMPLE_TEST_CASE_NAME = 'Teste de Login - simples';

export const EXAMPLE_TEST_CASE: {
  name: string;
  description: string;
  setupSteps: TestStep[];
  scenarios: TestScenario[];
} = {
  name: EXAMPLE_TEST_CASE_NAME,
  description: 'Caso de exemplo após o entendimento do escopo de login com o cliente. Cobre o caminho feliz e os testes negativos.',
  setupSteps: [
    {
      action: 'Abrir a URL do teste',
      data: 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login',
      expected: 'A URL abre.',
      result: '',
      comment: '',
    },
  ],
  scenarios: [
    {
      type: 'happy_path',
      title: '',
      expected: '',
      steps: [
        {
          action: 'Verificar se o fluxo acontece da forma correta',
          data: 'n/a',
          expected: 'n/a',
          result: 'n/a',
          comment: '',
        },
        {
          action: 'Preencher o nome de usuário corretamente',
          data: 'Admin',
          expected: 'Nome de usuário inserido',
          result: '',
          comment: '',
        },
        {
          action: 'Preencher a senha corretamente',
          data: 'admin123',
          expected: 'Senha inserida',
          result: '',
          comment: '',
        },
        {
          action: 'Clicar em Login',
          data: '',
          expected: 'Usuário está logado e está no Dashboard',
          result: '',
          comment: '',
        },
        {
          action: 'Clicar no nome do usuário > Logout',
          data: '',
          expected: 'Usuário está desconectado. Na página de Login não tem acesso ao conteúdo',
          result: '',
          comment: '',
        },
      ],
    },
    {
      type: 'negative',
      title: 'Cenário 1 — Usuário tenta conectar sem preencher nenhuma informação',
      expected:
        'Usuário não acessou o conteúdo. Um erro de validação aparece indicando que Username e Password não foram preenchidos. O texto deve ser Required. Os campos não preenchidos devem ter borda vermelha.',
      steps: [
        {
          action: 'Clicar em Login sem preencher os dados',
          data: '',
          expected: 'Os campos Username e Password ficam com Required e borda vermelha',
          result: '',
          comment: '',
        },
      ],
    },
    {
      type: 'negative',
      title: 'Cenário 2 — Usuário tenta conectar somente com o nome de usuário errado',
      expected:
        'Usuário não acessou o conteúdo. Um erro de validação aparece indicando que Password não foi preenchido. O texto deve ser Required. O campo sem preenchimento deve ter borda vermelha.',
      steps: [
        {
          action: 'Preencher o nome de usuário com um valor incorreto e clicar em Login',
          data: 'Admin123',
          expected: 'O campo Password fica com Required e o login não é concluído',
          result: '',
          comment: '',
        },
      ],
    },
    {
      type: 'negative',
      title: 'Cenário 3 — Usuário tenta conectar somente com o nome de usuário correto',
      expected:
        'Usuário não acessou o conteúdo. Um erro de validação aparece indicando que Password não foi preenchido. O texto deve ser Required. O campo sem preenchimento deve ter borda vermelha.',
      steps: [
        {
          action: 'Preencher o nome de usuário correto, deixar a senha vazia e clicar em Login',
          data: 'Admin',
          expected: 'O campo Password fica com Required e o login não é concluído',
          result: '',
          comment: '',
        },
      ],
    },
  ],
};
