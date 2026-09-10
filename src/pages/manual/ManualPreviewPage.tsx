import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { PriorityBadge, SeverityBadge, StatusBadge, TypeBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

const nav = ['Dashboard', 'Projetos', 'Casos de teste', 'Relatórios', 'Base de conhecimento', 'Perfil'];

export function ManualPreviewPage() {
  const { screen = 'dashboard' } = useParams();
  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-teal-soft bg-teal text-paper lg:border-b-0 lg:border-r">
        <div className="px-6 py-6">
          <p className="text-xs uppercase tracking-[0.2em] text-paper/70">QA Docs</p>
          <h1 className="mt-2 font-display text-2xl">QA Report Generator</h1>
        </div>
        <nav className="flex flex-col gap-1 px-3 pb-4">
          {nav.map((item) => (
            <span
              key={item}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
                isActive(screen, item) ? 'bg-paper text-teal' : 'text-paper/80'
              }`}
            >
              {item}
            </span>
          ))}
        </nav>
        <div className="px-6 py-6">
          <p className="text-sm text-paper/80">Rayan</p>
          <p className="text-xs text-paper/60">rayan@empresa.com</p>
          <Button variant="secondary" className="mt-4 w-full">
            Sair
          </Button>
        </div>
      </aside>
      <main className="bg-paper px-8 py-6">
        <p className="mb-4 text-sm text-muted">Dashboard › {crumb(screen)}</p>
        {renderScreen(screen)}
      </main>
    </div>
  );
}

function isActive(screen: string, item: string): boolean {
  if (item === 'Dashboard') return screen === 'dashboard';
  if (item === 'Projetos') return ['projects', 'project-form', 'cycle-form', 'cycle-detail', 'issue-form', 'follow-up', 'report'].includes(screen);
  if (item === 'Casos de teste') return ['test-cases', 'test-case-detail'].includes(screen);
  if (item === 'Relatórios') return screen === 'reports';
  if (item === 'Perfil') return screen === 'profile';
  return false;
}

function crumb(screen: string): string {
  const labels: Record<string, string> = {
    dashboard: 'Dashboard',
    projects: 'Projetos',
    'project-form': 'Projetos › Novo projeto',
    'test-cases': 'Casos de teste',
    'test-case-detail': 'Casos de teste › Teste de Login - simples',
    'cycle-form': 'Portal Administrativo › Novo ciclo',
    'cycle-detail': 'Portal Administrativo › Homologação',
    'issue-form': 'Homologação › Nova ocorrência',
    'follow-up': 'Homologação › Acompanhamento',
    report: 'Homologação › Relatório',
    profile: 'Perfil',
    reports: 'Relatórios',
  };
  return labels[screen] ?? 'Dashboard';
}

function renderScreen(screen: string) {
  if (screen === 'projects') return <ProjectsScreen />;
  if (screen === 'project-form') return <ProjectFormScreen />;
  if (screen === 'test-cases') return <TestCasesScreen />;
  if (screen === 'test-case-detail') return <TestCaseDetailScreen />;
  if (screen === 'cycle-form') return <CycleFormScreen />;
  if (screen === 'cycle-detail') return <CycleDetailScreen />;
  if (screen === 'issue-form') return <IssueFormScreen />;
  if (screen === 'follow-up') return <FollowUpScreen />;
  if (screen === 'report') return <ReportScreen />;
  if (screen === 'profile') return <ProfileScreen />;
  if (screen === 'reports') return <ReportsScreen />;
  return <DashboardScreen />;
}

function DashboardScreen() {
  return (
    <div>
      <PageHeader
        eyebrow="Visão geral"
        title="Olá, Rayan"
        description="Acompanhe o andamento dos seus ciclos de teste e gere relatórios sem sair do fluxo."
        actions={<Button>Novo projeto</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Projetos" value="2" />
        <Stat label="Ciclos ativos" value="1" />
        <Stat label="Ocorrências" value="5" />
        <Stat label="Relatórios" value="1" />
      </div>
      <Card className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Ciclo em destaque</p>
        <h2 className="mt-2 font-display text-3xl">Portal Administrativo</h2>
        <p className="text-muted">Homologação - Sprint 01</p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <span>2 Bugs · 1 Feature · 1 Melhoria · 1 Correção</span>
        </div>
        <div className="mt-6 flex gap-2">
          <Button>Abrir ciclo</Button>
          <Button variant="secondary">Gerar relatório</Button>
        </div>
      </Card>
    </div>
  );
}

function ProjectsScreen() {
  return (
    <div>
      <PageHeader title="Projetos" description="Organize seus sistemas e clientes em projetos de teste." actions={<Button>Novo projeto</Button>} />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Empresa Alpha</p>
          <h2 className="mt-2 font-display text-2xl">Portal Administrativo</h2>
          <p className="mt-2 text-sm text-muted">Gestão de usuários, permissões e cadastros.</p>
          <p className="mt-4 text-sm">Ativo</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Empresa Beta</p>
          <h2 className="mt-2 font-display text-2xl">Aplicativo Mobile</h2>
          <p className="mt-2 text-sm text-muted">App de pedidos e acompanhamento.</p>
          <p className="mt-4 text-sm">Ativo</p>
        </Card>
      </div>
    </div>
  );
}

function ProjectFormScreen() {
  return (
    <div>
      <PageHeader title="Novo projeto" description="Informe os dados principais do sistema que será testado." />
      <Card className="max-w-3xl">
        <div className="grid gap-4">
          <Input label="Nome" defaultValue="Portal Administrativo" readOnly />
          <Textarea label="Descrição" defaultValue="Sistema interno de gestão." readOnly />
          <Input label="Cliente" defaultValue="Empresa Alpha" readOnly />
          <Input label="Versão" defaultValue="1.4.2" readOnly />
          <Select label="Ambiente principal" value="Homologação" options={[{ value: 'Homologação', label: 'Homologação' }]} />
          <Select label="Status" value="ativo" options={[{ value: 'ativo', label: 'Ativo' }]} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary">Cancelar</Button>
            <Button>Salvar</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function TestCasesScreen() {
  return (
    <div>
      <PageHeader
        title="Casos de teste"
        description="Depois da reunião com o cliente, registre o caso. Os cenários ficam dentro dele."
        actions={<Button>Novo caso</Button>}
      />
      <Card>
        <p className="text-xs uppercase tracking-[0.14em] text-muted">Portal Administrativo</p>
        <h2 className="mt-2 font-display text-2xl">Teste de Login - simples</h2>
        <p className="mt-1 text-sm text-muted">Caso de exemplo após o entendimento do escopo de login com o cliente.</p>
        <p className="mt-3 text-sm">4 cenários · 8 passos · Caminho feliz · Teste negativo</p>
      </Card>
    </div>
  );
}

function TestCaseDetailScreen() {
  return (
    <div>
      <PageHeader
        eyebrow="Portal Administrativo"
        title="Teste de Login - simples"
        description="Caso e cenários de teste do escopo."
        actions={
          <>
            <Button variant="secondary">Gerar Excel</Button>
            <Button>Editar</Button>
          </>
        }
      />
      <Card className="overflow-x-auto">
        <table className="min-w-[720px] w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#14665C] text-white">
              <th className="border border-line px-3 py-2 text-left font-semibold">Cenário / passo</th>
              <th className="border border-line px-3 py-2 text-left font-semibold">Dados</th>
              <th className="border border-line px-3 py-2 text-left font-semibold">Resultado esperado</th>
              <th className="border border-line px-3 py-2 text-left font-semibold">Resultado obtido</th>
              <th className="border border-line px-3 py-2 text-left font-semibold">Comentário</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-line px-3 py-2">Abrir a URL do teste</td>
              <td className="border border-line px-3 py-2">https://opensource-demo.orangehrmlive.com</td>
              <td className="border border-line px-3 py-2">A URL abre.</td>
              <td className="border border-line px-3 py-2">—</td>
              <td className="border border-line px-3 py-2">—</td>
            </tr>
            <tr className="bg-emerald-100">
              <td className="border border-line px-3 py-2 font-semibold" colSpan={5}>
                Caminho feliz — quando o fluxo acontece da forma correta
              </td>
            </tr>
            <tr>
              <td className="border border-line px-3 py-2">Preencher o nome de usuário corretamente</td>
              <td className="border border-line px-3 py-2">Admin</td>
              <td className="border border-line px-3 py-2">Nome de usuário inserido</td>
              <td className="border border-line px-3 py-2">—</td>
              <td className="border border-line px-3 py-2">—</td>
            </tr>
            <tr className="bg-amber-100">
              <td className="border border-line px-3 py-2 font-semibold" colSpan={5}>
                Testes negativos — quando o fluxo não acontece da forma correta
              </td>
            </tr>
            <tr>
              <td className="border border-line px-3 py-2 font-semibold">
                Cenário 1 — Usuário tenta conectar sem preencher nenhuma informação
              </td>
              <td className="border border-line px-3 py-2">—</td>
              <td className="border border-line px-3 py-2">Usuário não acessou o conteúdo. Campos com Required.</td>
              <td className="border border-line px-3 py-2">—</td>
              <td className="border border-line px-3 py-2">—</td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function CycleFormScreen() {
  return (
    <div>
      <PageHeader title="Novo ciclo de teste" description="Defina o período, a versão e o ambiente deste ciclo." />
      <Card className="max-w-3xl">
        <div className="grid gap-4">
          <Select label="Nome" value="Homologação" options={[{ value: 'Homologação', label: 'Homologação' }]} />
          <Textarea label="Descrição" defaultValue="Rodada de homologação da sprint." readOnly />
          <Input label="Versão" defaultValue="1.4.2" readOnly />
          <Select label="Ambiente" value="Homologação" options={[{ value: 'Homologação', label: 'Homologação' }]} />
          <Input label="Data inicial" defaultValue="2026-09-01" readOnly />
          <Input label="Data final" defaultValue="2026-09-15" readOnly />
          <div className="flex justify-end gap-2">
            <Button variant="secondary">Cancelar</Button>
            <Button>Salvar</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function CycleDetailScreen() {
  return (
    <div>
      <PageHeader
        eyebrow="Portal Administrativo"
        title="Homologação - Sprint 01"
        description="Testes do módulo de login e cadastros."
        actions={
          <>
            <Button>Nova ocorrência</Button>
            <Button variant="secondary">Gerar relatório PDF</Button>
            <Button variant="secondary">Acompanhamento</Button>
          </>
        }
      />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Stat label="Ocorrências" value="5" />
        <Stat label="Aprovados" value="1" />
        <Stat label="Reprovados" value="1" />
        <Stat label="Bloqueados" value="0" />
      </div>
      <Card className="mb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">BUG-001</p>
            <h3 className="mt-1 font-display text-2xl">Botão Salvar não responde</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <TypeBadge value="bug" />
            <SeverityBadge value="alta" />
            <PriorityBadge value="alta" />
            <StatusBadge value="aberto" />
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">FEA-001</p>
            <h3 className="mt-1 font-display text-2xl">Exportar lista em Excel</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <TypeBadge value="feature" />
            <SeverityBadge value="media" />
            <PriorityBadge value="normal" />
            <StatusBadge value="em_analise" />
          </div>
        </div>
      </Card>
    </div>
  );
}

function IssueFormScreen() {
  return (
    <div>
      <PageHeader title="Nova ocorrência" description="Os campos mudam conforme o tipo selecionado." />
      <Card className="grid max-w-3xl gap-4">
        <Select label="Tipo" value="bug" options={[{ value: 'bug', label: 'Bug' }]} />
        <Input label="Título" defaultValue="Botão Salvar não responde" readOnly />
        <Textarea label="Descrição" defaultValue="Após clicar em Salvar, a tela permanece sem resposta." readOnly />
        <Select label="Severidade" value="alta" options={[{ value: 'alta', label: 'Alta' }]} />
        <Select label="Prioridade" value="alta" options={[{ value: 'alta', label: 'Alta' }]} />
        <Select label="Status" value="aberto" options={[{ value: 'aberto', label: 'Aberto' }]} />
        <div className="flex justify-end gap-2">
          <Button variant="secondary">Cancelar</Button>
          <Button>Salvar</Button>
        </div>
      </Card>
    </div>
  );
}

function FollowUpScreen() {
  return (
    <div>
      <PageHeader
        eyebrow="Portal Administrativo"
        title="Acompanhamento de ocorrências"
        description="O que foi resolvido e o que ficou pendente, de acordo com o status cadastrado."
        actions={
          <>
            <Button variant="secondary">Gerar acompanhamento PDF</Button>
            <Button>Gerar 2ª versão (pendentes)</Button>
          </>
        }
      />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Stat label="Cadastradas" value="5" />
        <Stat label="Resolvidas" value="1" />
        <Stat label="Pendentes" value="4" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="font-display text-2xl">Resolvidas</h2>
          <p className="mt-3 text-sm text-muted">COR-001 · Ajuste no filtro de data</p>
        </Card>
        <Card>
          <h2 className="font-display text-2xl">Pendentes</h2>
          <p className="mt-3 text-sm text-muted">BUG-001 · Botão Salvar não responde</p>
        </Card>
      </div>
    </div>
  );
}

function ReportScreen() {
  return (
    <div>
      <PageHeader eyebrow="Portal Administrativo" title="Gerar relatório PDF" description="Homologação - Sprint 01" />
      <Card className="grid max-w-3xl gap-4">
        <Input label="Título do relatório" defaultValue="Relatório de QA — Portal Administrativo" readOnly />
        <Select
          label="Modelo"
          value="profissional"
          options={[{ value: 'profissional', label: 'Profissional' }]}
        />
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked readOnly className="h-4 w-4 accent-teal" />
          Incluir capa
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked readOnly className="h-4 w-4 accent-teal" />
          Incluir evidências
        </label>
        <div className="flex justify-end">
          <Button>Gerar relatório PDF</Button>
        </div>
      </Card>
    </div>
  );
}

function ProfileScreen() {
  return (
    <div>
      <PageHeader title="Perfil" description="O nome salvo aqui é o que aparece como Responsável pelo QA." />
      <div className="mb-4 flex gap-2">
        <Button>Dados</Button>
        <Button variant="secondary">Senha</Button>
        <Button variant="secondary">Criar conta</Button>
      </div>
      <Card className="max-w-3xl">
        <div className="grid gap-4">
          <Input label="Nome (Responsável pelo QA)" defaultValue="Rayan" readOnly />
          <Input label="E-mail" defaultValue="rayan@empresa.com" readOnly className="bg-paper text-muted" />
          <div className="flex justify-end">
            <Button>Salvar nome</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ReportsScreen() {
  return (
    <div>
      <PageHeader title="Relatórios" description="Histórico dos relatórios gerados a partir dos seus ciclos de teste." />
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl">Relatório de QA — Portal Administrativo</h2>
            <p className="text-sm text-muted">Profissional · QA_Portal_Administrativo_Homologacao_2026-09-09.pdf</p>
          </div>
          <span className="text-sm font-semibold text-teal">Gerar novamente</span>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-display text-4xl">{value}</p>
    </Card>
  );
}
