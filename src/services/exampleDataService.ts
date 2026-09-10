import { createCycle } from '@/services/cycleService';
import { updateEvidenceCaption, uploadEvidence } from '@/services/evidenceService';
import { createIssue, type IssueInput } from '@/services/issueService';
import { createProject, listProjects } from '@/services/projectService';

const EXAMPLE_PROJECT_NAME = 'Portal Administrativo';

let seeding: Promise<boolean> | null = null;

export async function seedExampleData(userId: string, userName: string): Promise<boolean> {
  if (seeding) {
    await seeding;
    return false;
  }
  seeding = createExampleData(userId, userName);
  try {
    return await seeding;
  } finally {
    seeding = null;
  }
}

async function createExampleData(userId: string, userName: string): Promise<boolean> {
  const projects = await listProjects(userId);
  if (projects.some((project) => project.name === EXAMPLE_PROJECT_NAME)) {
    return false;
  }

  const projectId = await createProject(userId, {
    name: EXAMPLE_PROJECT_NAME,
    description: 'Portal interno para gestão de usuários, permissões e cadastros administrativos.',
    client: 'Cliente Demonstração',
    version: '1.4.2',
    environment: 'Homologação',
    owner: userName,
    status: 'ativo',
  });

  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 7);
  const end = new Date(today);
  end.setDate(today.getDate() + 3);

  const cycleId = await createCycle(userId, projectId, {
    name: 'Homologação Sprint 04',
    description: 'Ciclo de homologação do módulo de login, usuários e formulários de cadastro.',
    version: '1.4.2',
    environment: 'Homologação',
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    owner: userName,
    status: 'ativo',
  });

  const shared = {
    projectId,
    cycleId,
    assignee: userName,
    notes: '',
    preconditions: '',
    reproductionSteps: [] as string[],
    expectedResult: '',
    actualResult: '',
    impact: '',
    environment: 'Homologação',
    version: '1.4.2',
    browser: 'Chrome 140',
    operatingSystem: 'Windows 11',
    device: 'Desktop',
    objective: '',
    businessRules: '',
    acceptanceCriteria: '',
    currentSituation: '',
    opportunity: '',
    suggestion: '',
    expectedBenefit: '',
    originalProblem: '',
    correctionMade: '',
    resultAfterCorrection: '',
    correctedVersion: '',
    correctionDate: '',
    correctionOwner: userName,
  };

  const bugId = await createIssue(userId, userName, {
    ...shared,
    type: 'bug',
    title: 'Botão "Salvar" não responde após o clique',
    description: 'Ao preencher o formulário e clicar em Salvar, nenhuma ação é executada.',
    status: 'aberto',
    severity: 'alta',
    priority: 'alta',
    preconditions: 'Estar autenticado no portal com um perfil que pode cadastrar usuários.',
    reproductionSteps: [
      'Acessar o sistema.',
      'Acessar o módulo de usuários.',
      'Preencher os campos obrigatórios.',
      'Clicar em Salvar.',
    ],
    expectedResult: 'O sistema deve salvar o registro e apresentar uma mensagem de sucesso.',
    actualResult: 'O botão não executa nenhuma ação.',
    impact: 'O usuário não consegue cadastrar novos registros.',
  } satisfies IssueInput);

  await createIssue(userId, userName, {
    ...shared,
    type: 'bug',
    title: 'Mensagem de erro não é apresentada',
    description: 'Quando a senha está incorreta, a tela permanece sem feedback para o usuário.',
    status: 'em_analise',
    severity: 'media',
    priority: 'normal',
    preconditions: 'Ter uma conta válida no portal.',
    reproductionSteps: [
      'Acessar a tela de login.',
      'Informar um e-mail válido.',
      'Informar uma senha incorreta.',
      'Clicar em Entrar.',
    ],
    expectedResult: 'Deve aparecer uma mensagem clara de e-mail ou senha inválidos.',
    actualResult: 'Nenhuma mensagem é exibida e o formulário permanece igual.',
    impact: 'O usuário não entende o motivo da falha no login.',
  } satisfies IssueInput);

  await createIssue(userId, userName, {
    ...shared,
    type: 'feature',
    title: 'Adicionar recuperação de senha',
    description: 'Permitir que o usuário solicite uma nova senha por e-mail.',
    status: 'aberto',
    severity: 'media',
    priority: 'alta',
    objective: 'Reduzir chamados de acesso bloqueado.',
    businessRules: 'O link de redefinição deve expirar em 30 minutos e só pode ser usado uma vez.',
    acceptanceCriteria: 'O usuário recebe o e-mail, redefine a senha e consegue entrar com a nova senha.',
  } satisfies IssueInput);

  await createIssue(userId, userName, {
    ...shared,
    type: 'melhoria',
    title: 'Melhorar feedback visual do formulário',
    description: 'O formulário funciona, mas falta indicação visual enquanto o usuário preenche os campos.',
    status: 'aberto',
    severity: 'baixa',
    priority: 'baixa',
    currentSituation: 'Os campos só mostram erro depois do envio.',
    opportunity: 'Antecipar a validação enquanto o usuário digita.',
    suggestion: 'Exibir estado de sucesso e erro por campo em tempo real.',
    expectedBenefit: 'Menos retrabalho no preenchimento e menos rejeições no cadastro.',
  } satisfies IssueInput);

  await createIssue(userId, userName, {
    ...shared,
    type: 'correcao',
    title: 'Corrigida validação do campo CPF',
    description: 'A validação do CPF que permitia valores inválidos foi ajustada.',
    status: 'aprovado',
    severity: 'alta',
    priority: 'alta',
    originalProblem: 'O campo CPF aceitava sequências inválidas, como 000.000.000-00.',
    correctionMade: 'Incluída validação de dígitos verificadores antes de salvar.',
    resultAfterCorrection: 'CPFs inválidos são bloqueados e o usuário vê a mensagem correta.',
    correctedVersion: '1.4.2',
    correctionDate: start.toISOString().slice(0, 10),
  } satisfies IssueInput);

  const evidenceFile = await createExampleEvidenceFile();
  const evidenceId = await uploadEvidence({
    file: evidenceFile,
    issueId: bugId,
    projectId,
    cycleId,
    order: 0,
  });
  await updateEvidenceCaption(evidenceId, 'Botão "Salvar" permanece sem resposta após o clique.');

  return true;
}

async function createExampleEvidenceFile(): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = 540;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Não foi possível gerar a evidência de exemplo.');
  }

  context.fillStyle = '#F4F1EA';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#0F3D3E';
  context.fillRect(0, 0, canvas.width, 72);
  context.fillStyle = '#FFFcf7';
  context.font = '600 28px sans-serif';
  context.fillText('Portal Administrativo', 32, 46);

  context.fillStyle = '#FFFFFF';
  context.fillRect(80, 140, 800, 300);
  context.strokeStyle = '#DDD6C8';
  context.strokeRect(80, 140, 800, 300);
  context.fillStyle = '#1C1917';
  context.font = '500 22px sans-serif';
  context.fillText('Cadastro de usuário', 110, 190);
  context.fillStyle = '#6F675D';
  context.font = '16px sans-serif';
  context.fillText('Nome, e-mail e perfil preenchidos.', 110, 230);

  context.fillStyle = '#C45C26';
  context.fillRect(110, 320, 160, 48);
  context.fillStyle = '#FFFFFF';
  context.font = '600 18px sans-serif';
  context.fillText('SALVAR', 148, 351);

  context.strokeStyle = '#B42318';
  context.lineWidth = 3;
  context.strokeRect(104, 314, 172, 60);
  context.fillStyle = '#B42318';
  context.font = '600 16px sans-serif';
  context.fillText('Botão sem resposta após o clique', 290, 348);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (!result) {
        reject(new Error('Não foi possível gerar a imagem de exemplo.'));
        return;
      }
      resolve(result);
    }, 'image/png');
  });

  return new File([blob], 'evidencia-botao-salvar.png', { type: 'image/png' });
}
