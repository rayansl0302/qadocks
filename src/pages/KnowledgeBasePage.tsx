import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';

const sections = [
  { id: 'visao', label: 'Visão geral' },
  { id: 'fluxo', label: 'Fluxo de trabalho' },
  { id: 'conta', label: 'Conta e acesso' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'projetos', label: 'Projetos' },
  { id: 'casos', label: 'Casos de teste' },
  { id: 'ciclos', label: 'Ciclos de teste' },
  { id: 'ocorrencias', label: 'Ocorrências' },
  { id: 'evidencias', label: 'Evidências' },
  { id: 'filtros', label: 'Filtros e ordenação' },
  { id: 'relatorios', label: 'Relatórios PDF' },
];

export function KnowledgeBasePage() {
  return (
    <div>
      <PageHeader
        eyebrow="Ajuda"
        title="Base de conhecimento"
        description="Explicação de cada função do QA Report Generator e como usar o sistema no dia a dia."
      />

      <div className="grid gap-6 xl:grid-cols-[240px_1fr]">
        <Card className="h-fit xl:sticky xl:top-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Índice</p>
          <nav className="flex flex-col gap-2 text-sm">
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`} className="text-muted hover:text-ink">
                {section.label}
              </a>
            ))}
          </nav>
        </Card>

        <div className="grid gap-5">
          <Card id="visao">
            <h2 className="font-display text-2xl">Visão geral</h2>
            <p className="mt-3 text-sm text-muted">
              O sistema organiza o trabalho de QA em projetos, casos de teste, ciclos, ocorrências e evidências.
              Depois da reunião com o cliente, você registra o escopo em casos e cenários e gera o Excel. Durante a
              execução, registra ocorrências e gera o PDF profissional.
            </p>
          </Card>

          <Card id="fluxo">
            <h2 className="font-display text-2xl">Fluxo de trabalho</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted">
              <li>Entre com e-mail e senha.</li>
              <li>Crie um projeto (o sistema, cliente ou aplicativo testado).</li>
              <li>No menu Casos de teste, registre o caso e os cenários do escopo e gere o Excel.</li>
              <li>Crie um ciclo de teste (sprint, homologação, regressão).</li>
              <li>Registre ocorrências: Bug, Feature, Melhoria ou Correção.</li>
              <li>Anexe prints com legenda.</li>
              <li>Use Gerar relatório PDF, escolha o modelo e baixe o arquivo.</li>
            </ol>
          </Card>

          <Card id="conta">
            <h2 className="font-display text-2xl">Conta e acesso</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
              <li>
                <strong className="text-ink">Criar conta:</strong> cadastra nome, e-mail e senha.
              </li>
              <li>
                <strong className="text-ink">Entrar:</strong> autentica e abre o sistema. O e-mail fica lembrado para
                o próximo acesso.
              </li>
              <li>
                <strong className="text-ink">Recuperar senha:</strong> envia um link de redefinição para o e-mail.
              </li>
              <li>
                <strong className="text-ink">Sair:</strong> encerra a sessão no botão do menu.
              </li>
            </ul>
          </Card>

          <Card id="dashboard">
            <h2 className="font-display text-2xl">Dashboard</h2>
            <p className="mt-3 text-sm text-muted">
              Mostra totais de projetos, ciclos ativos, ocorrências e relatórios. Destaca o ciclo mais recente com
              contagem por tipo e severidade, além de atalhos para abrir o ciclo ou gerar o PDF.
            </p>
          </Card>

          <Card id="projetos">
            <h2 className="font-display text-2xl">Projetos</h2>
            <p className="mt-3 text-sm text-muted">
              Um projeto representa o sistema que está sendo testado. Campos: nome, descrição, cliente, versão,
              ambiente principal, responsável e status (Ativo, Concluído ou Arquivado).
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
              <li>
                <strong className="text-ink">Novo projeto:</strong> cadastra o sistema.
              </li>
              <li>
                <strong className="text-ink">Editar:</strong> atualiza os dados do projeto.
              </li>
              <li>
                <strong className="text-ink">Excluir:</strong> remove o projeto, os ciclos, as ocorrências, as
                evidências e os casos de teste.
              </li>
              <li>
                <strong className="text-ink">Cliente:</strong> é o nome do cliente dentro do projeto, não um cadastro
                separado.
              </li>
            </ul>
          </Card>

          <Card id="casos">
            <h2 className="font-display text-2xl">Casos de teste</h2>
            <p className="mt-3 text-sm text-muted">
              Depois da reunião com o cliente, o QA registra o que será testado. O caso é a planilha (por exemplo,
              Teste de Login). Os cenários ficam dentro do caso: caminho feliz e testes negativos. Não existe tela
              separada de cenário.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
              <li>
                <strong className="text-ink">Menu Casos de teste:</strong> lista todos os casos dos seus projetos.
              </li>
              <li>
                <strong className="text-ink">Novo caso:</strong> nome, descrição, passos iniciais e cenários com
                passos (cenário, dados, resultado esperado, resultado Passou/Falhou/Bloqueado, resultado obtido e
                comentário).
              </li>
              <li>
                <strong className="text-ink">Caminho feliz:</strong> fluxo que deve funcionar do início ao fim.
              </li>
              <li>
                <strong className="text-ink">Teste negativo:</strong> fluxo que deve falhar ou ser bloqueado.
              </li>
              <li>
                <strong className="text-ink">Gerar Excel:</strong> baixa o plano de testes com capa, seções coloridas
                e a coluna Resultado com Passou, Falhou ou Bloqueado para marcar na execução.
              </li>
            </ul>
          </Card>

          <Card id="ciclos">
            <h2 className="font-display text-2xl">Ciclos de teste</h2>
            <p className="mt-3 text-sm text-muted">
              O ciclo agrupa as ocorrências de um período, como Homologação Sprint 04 ou Regressão. Campos: nome,
              descrição, versão, ambiente, datas, responsável e status.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
              <li>
                <strong className="text-ink">Novo ciclo:</strong> cria a rodada de testes dentro do projeto.
              </li>
              <li>
                <strong className="text-ink">Abrir ciclo:</strong> mostra indicadores, filtros e a lista de
                ocorrências.
              </li>
              <li>
                <strong className="text-ink">Gerar relatório PDF:</strong> inicia a emissão do relatório daquele ciclo.
              </li>
            </ul>
          </Card>

          <Card id="ocorrencias">
            <h2 className="font-display text-2xl">Ocorrências</h2>
            <p className="mt-3 text-sm text-muted">
              Cada ocorrência recebe um código automático no ciclo: BUG-001, FEA-001, MEL-001 ou COR-001.
            </p>
            <div className="mt-4 grid gap-3 text-sm text-muted">
              <p>
                <strong className="text-ink">Bug:</strong> comportamento incorreto. Exige passos de reprodução,
                resultado esperado e resultado encontrado. Também registra ambiente, navegador, SO e impacto.
              </p>
              <p>
                <strong className="text-ink">Feature:</strong> nova funcionalidade, com objetivo, regras de negócio e
                critérios de aceite.
              </p>
              <p>
                <strong className="text-ink">Melhoria:</strong> o sistema funciona, mas pode melhorar. Registra
                situação atual, oportunidade, sugestão e benefício.
              </p>
              <p>
                <strong className="text-ink">Correção:</strong> alteração já feita, com problema original, correção,
                resultado, versão e data.
              </p>
            </div>
            <p className="mt-4 text-sm text-muted">
              <strong className="text-ink">Severidade</strong> é o impacto (Crítica, Alta, Média, Baixa).{' '}
              <strong className="text-ink">Prioridade</strong> é a urgência (Urgente, Alta, Normal, Baixa).{' '}
              <strong className="text-ink">Status</strong> acompanha o andamento: Aberto, Em análise, Em
              desenvolvimento, Corrigido, Retestado, Aprovado, Rejeitado, Reprovado ou Bloqueado.
            </p>
          </Card>

          <Card id="evidencias">
            <h2 className="font-display text-2xl">Evidências</h2>
            <p className="mt-3 text-sm text-muted">
              São os prints da ocorrência. É possível arrastar imagens, ver o preview, escrever legenda, reordenar e
              excluir. As imagens entram no PDF quando a opção de evidências está marcada.
            </p>
          </Card>

          <Card id="filtros">
            <h2 className="font-display text-2xl">Filtros e ordenação</h2>
            <p className="mt-3 text-sm text-muted">
              Na tela do ciclo, filtre por tipo, status, severidade, prioridade, responsável e período. A pesquisa
              cobre código, título e descrição. A ordenação pode ser por data, severidade, prioridade, código ou
              status.
            </p>
          </Card>

          <Card id="relatorios">
            <h2 className="font-display text-2xl">Relatórios PDF</h2>
            <p className="mt-3 text-sm text-muted">
              Antes de gerar, o sistema avisa se faltam título, evidência, resultado esperado ou se ainda existem
              ocorrências críticas, abertas ou bloqueadas.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
              <li>
                <strong className="text-ink">Profissional:</strong> capa, resumo, escopo, ambiente, resultados,
                ocorrências, evidências, conclusão e aprovação.
              </li>
              <li>
                <strong className="text-ink">Compacto:</strong> resumo, ocorrências, evidências e conclusão.
              </li>
              <li>
                <strong className="text-ink">Executivo:</strong> resumo, indicadores, principais problemas,
                recomendações e conclusão.
              </li>
            </ul>
            <p className="mt-3 text-sm text-muted">
              O arquivo segue o padrão QA_Projeto_Ciclo_AAAA-MM-DD.pdf. Depois de gerado, é possível visualizar,
              baixar ou emitir novamente. O menu Relatórios guarda o histórico das emissões.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
