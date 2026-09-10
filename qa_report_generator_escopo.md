# 🧪 QA Report Generator

## 1. Visão geral

O **QA Report Generator** é um sistema web destinado a auxiliar profissionais de QA (Quality Assurance) na criação, organização e exportação de relatórios de testes em PDF.

A proposta é substituir relatórios feitos manualmente em Word, Google Docs ou ferramentas sem padronização por uma solução simples, intuitiva e profissional.

O QA cadastra as informações das ocorrências, adiciona evidências/prints e o sistema organiza automaticamente tudo em um relatório PDF padronizado.

O objetivo principal é que o QA se preocupe com o **conteúdo do teste**, enquanto o sistema cuida da **estrutura, organização e apresentação do relatório**.

---

# 2. Objetivos do sistema

## Objetivo principal

Permitir que um QA consiga:

- Criar projetos de teste.
- Criar ciclos de teste.
- Registrar ocorrências.
- Classificar ocorrências como Bug, Feature, Melhoria ou Correção.
- Definir severidade e prioridade.
- Descrever passos para reprodução.
- Informar resultado esperado e resultado encontrado.
- Adicionar prints e outras evidências.
- Organizar todas as ocorrências.
- Visualizar um resumo executivo.
- Gerar um PDF profissional e padronizado.

## Objetivos secundários

- Facilitar a comunicação entre QA, desenvolvimento e gestão.
- Padronizar a documentação de problemas.
- Reduzir o tempo gasto formatando relatórios.
- Facilitar o entendimento das ocorrências por pessoas não técnicas.
- Criar histórico dos testes realizados.
- Permitir reutilização de informações entre ciclos de teste.

---

# 3. Público-alvo

O sistema deve atender principalmente:

- QA Júnior.
- QA Pleno.
- QA Sênior.
- Analistas de testes.
- Analistas de qualidade.
- Desenvolvedores que precisam documentar problemas.
- Líderes técnicos.
- Coordenadores de TI.
- Gestores de projetos.

A interface deve ser simples o suficiente para um QA iniciante utilizar sem treinamento extenso.

---

# 4. Conceito principal

O sistema será baseado na seguinte estrutura:

```text
Usuário
  ↓
Projeto
  ↓
Ciclo de teste
  ↓
Ocorrências
  ↓
Evidências
  ↓
Relatório
  ↓
PDF
```

Exemplo:

```text
Projeto: Portal Administrativo

Ciclo:
Homologação - Módulo de Login

Ocorrências:

BUG-001
Botão de login não responde

BUG-002
Mensagem de erro não é apresentada

MEL-001
Melhorar feedback visual do formulário

FEA-001
Adicionar recuperação de senha
```

---

# 5. Tipos de ocorrência

O sistema deve possuir quatro tipos principais.

## 5.1 Bug

Utilizado quando existe um comportamento incorreto ou diferente do comportamento esperado.

Exemplo:

> Ao clicar no botão "Salvar", nenhuma ação é executada.

Campos adicionais:

- Pré-condições.
- Passos para reprodução.
- Resultado esperado.
- Resultado encontrado.
- Impacto.
- Ambiente.
- Evidências.

---

## 5.2 Feature

Utilizado para documentar uma nova funcionalidade ou demanda funcional.

Exemplo:

> Criar funcionalidade de recuperação de senha por e-mail.

Campos adicionais:

- Objetivo.
- Descrição.
- Regras de negócio.
- Critérios de aceite.
- Evidências/referências.

---

## 5.3 Melhoria

Utilizado quando o sistema funciona, mas existe oportunidade de melhorar usabilidade, desempenho, experiência ou comportamento.

Exemplo:

> O campo de pesquisa funciona corretamente, porém seria interessante apresentar sugestões enquanto o usuário digita.

Campos adicionais:

- Situação atual.
- Problema/oportunidade.
- Sugestão.
- Benefício esperado.
- Evidências.

---

## 5.4 Correção

Utilizado para registrar uma alteração/correção realizada em uma funcionalidade existente.

Exemplo:

> Corrigida validação do campo CPF que permitia valores inválidos.

Campos adicionais:

- Problema original.
- Correção realizada.
- Resultado após correção.
- Evidências do reteste.

---

# 6. Classificação

Cada ocorrência deve possuir:

## Severidade

```text
Crítica
Alta
Média
Baixa
```

### Crítica

Impede o funcionamento de uma funcionalidade essencial ou compromete significativamente o sistema.

### Alta

Afeta uma funcionalidade importante e possui impacto significativo.

### Média

Afeta parcialmente uma funcionalidade, mas existe alternativa ou o impacto é limitado.

### Baixa

Problema de baixo impacto, geralmente visual, textual ou de pequena usabilidade.

---

## Prioridade

```text
Urgente
Alta
Normal
Baixa
```

A prioridade representa a urgência para tratamento.

A severidade representa o impacto técnico/funcional.

Esses conceitos devem permanecer separados.

---

# 7. Status

As ocorrências devem possuir os seguintes status:

```text
Aberto
Em análise
Em desenvolvimento
Corrigido
Retestado
Aprovado
Rejeitado
Bloqueado
```

Fluxo sugerido:

```text
Aberto
   ↓
Em análise
   ↓
Em desenvolvimento
   ↓
Corrigido
   ↓
Retestado
   ↓
Aprovado
```

Possíveis desvios:

```text
Em análise → Rejeitado

Retestado → Reprovado/Retornar para desenvolvimento

Qualquer etapa → Bloqueado
```

---

# 8. Estrutura de uma ocorrência

Cada ocorrência deve possuir um identificador único.

Exemplos:

```text
BUG-001
BUG-002
FEA-001
MEL-001
COR-001
```

## Campos comuns

```text
ID
Tipo
Título
Descrição
Status
Severidade
Prioridade
Data de criação
Data de atualização
Autor
Responsável
Observações
```

---

# 9. Campos específicos para BUG

```text
Título
Descrição
Pré-condições
Passos para reprodução
Resultado esperado
Resultado encontrado
Impacto
Ambiente
Versão
Navegador
Sistema operacional
Dispositivo
Evidências
Observações
```

---

# 10. Campos específicos para FEATURE

```text
Título
Objetivo
Descrição
Regras de negócio
Critérios de aceite
Prioridade
Evidências/referências
Observações
```

---

# 11. Campos específicos para MELHORIA

```text
Título
Situação atual
Problema/oportunidade
Sugestão de melhoria
Benefício esperado
Prioridade
Evidências
Observações
```

---

# 12. Campos específicos para CORREÇÃO

```text
Título
Problema original
Correção realizada
Resultado após correção
Versão corrigida
Data da correção
Responsável
Evidências
Observações
```

---

# 13. Evidências

As evidências são uma das funcionalidades principais do sistema.

O QA deve conseguir:

- Fazer upload de imagens.
- Arrastar e soltar imagens.
- Adicionar múltiplas imagens.
- Reordenar imagens.
- Adicionar legenda.
- Excluir imagem.
- Visualizar imagem antes da geração do PDF.

Exemplo:

```text
Evidência 01

[ IMAGEM ]

Legenda:
Botão "Salvar" permanece sem resposta após o clique.
```

---

# 14. Anotações nas evidências

Como recurso futuro, permitir marcações sobre a imagem:

- Retângulo.
- Seta.
- Círculo.
- Texto.
- Destaque.

Exemplo:

```text
[ PRINT DA TELA ]

        ┌───────────────┐
        │   SALVAR      │ ← problema
        └───────────────┘
```

Essa funcionalidade pode ser implementada em uma segunda versão.

---

# 15. Projeto

O usuário poderá criar vários projetos.

Exemplo:

```text
Portal Administrativo
Sistema Financeiro
Aplicativo Mobile
E-commerce
Sistema de Patrimônio
```

Campos:

```text
Nome
Descrição
Cliente
Versão
Ambiente principal
Responsável
Data de criação
Status
```

Status:

```text
Ativo
Concluído
Arquivado
```

---

# 16. Ciclo de teste

Dentro de cada projeto existirão ciclos de teste.

Exemplos:

```text
Homologação - Sprint 01
Homologação - Sprint 02
Regressão
Smoke Test
Teste de Login
Teste do Checkout
Homologação Final
```

Campos:

```text
Nome
Descrição
Versão
Ambiente
Data inicial
Data final
Responsável
Status
```

---

# 17. Dashboard

O dashboard deve apresentar uma visão rápida do projeto/ciclo.

Exemplo:

```text
┌──────────────────────────────────────────────┐
│ Portal Administrativo                        │
│ Homologação - Sprint 04                      │
├──────────────────────────────────────────────┤
│                                              │
│ Casos executados          42                 │
│ Aprovados                 31                 │
│ Reprovados                 8                 │
│ Bloqueados                 3                 │
│                                              │
├──────────────────────────────────────────────┤
│ OCORRÊNCIAS                                 │
│                                              │
│ 🐞 Bugs                    8                  │
│ ✨ Features                3                  │
│ 🔧 Melhorias               5                  │
│ 🛠 Correções               2                  │
│                                              │
└──────────────────────────────────────────────┘
```

---

# 18. Resumo executivo

O PDF deve começar com um resumo executivo.

O objetivo é permitir que um gestor compreenda o resultado do ciclo sem precisar ler todas as ocorrências.

Informações sugeridas:

```text
Projeto
Ciclo
Versão
Ambiente
Período do teste
Responsável
Quantidade de testes
Quantidade de aprovados
Quantidade de reprovados
Quantidade de bloqueados
Quantidade de ocorrências
```

Também apresentar gráficos simples:

- Ocorrências por tipo.
- Ocorrências por severidade.
- Ocorrências por status.

---

# 19. Relatório PDF

O PDF deve possuir aparência profissional.

## Estrutura sugerida

```text
CAPA

RELATÓRIO DE QA

Projeto
Ciclo
Versão
Ambiente
Período
Responsável


RESUMO EXECUTIVO

Indicadores
Gráficos
Resumo geral


1. ESCOPO DO TESTE

Descrição do que foi testado.


2. AMBIENTE

Sistema
Versão
Navegador
SO
Dispositivo
Ambiente


3. RESULTADO DOS TESTES

Indicadores gerais.


4. OCORRÊNCIAS

BUG-001
BUG-002
FEA-001
MEL-001
...


5. EVIDÊNCIAS

Screenshots organizados.


6. CONCLUSÃO

Resumo final do ciclo.


7. APROVAÇÃO

Responsável pelo QA
Data
Observações
```

---

# 20. Layout de uma ocorrência no PDF

Cada ocorrência deve possuir uma estrutura visual padronizada.

Exemplo:

```text
──────────────────────────────────────────────

BUG-001

🔴 ALTA        🐞 BUG        🔵 ABERTO

Botão "Salvar" não responde após o clique

DESCRIÇÃO

Ao preencher o formulário e clicar no botão
"Salvar", nenhuma ação é executada.

AMBIENTE

Ambiente: Homologação
Versão: 1.4.2
Navegador: Chrome 140
Sistema: Windows 11

PASSOS PARA REPRODUÇÃO

1. Acessar o sistema.
2. Acessar o módulo de usuários.
3. Preencher os campos obrigatórios.
4. Clicar em "Salvar".

RESULTADO ESPERADO

O sistema deve salvar o registro e apresentar
uma mensagem de sucesso.

RESULTADO ENCONTRADO

O botão não executa nenhuma ação.

IMPACTO

O usuário não consegue cadastrar novos registros.

EVIDÊNCIA

[ SCREENSHOT ]

Legenda:
Botão "Salvar" não executa ação.

──────────────────────────────────────────────
```

---

# 21. Design do PDF

O relatório deve priorizar:

- Leitura rápida.
- Hierarquia visual.
- Espaçamento adequado.
- Tipografia profissional.
- Poucas cores.
- Ícones para identificação.
- Cabeçalho e rodapé.
- Numeração das páginas.
- Identificação do projeto.
- Identificação do ciclo.
- Separação clara entre ocorrências.

Evitar:

- Texto excessivamente pequeno.
- Tabelas gigantes.
- Cores excessivas.
- Prints distorcidos.
- Páginas visualmente poluídas.
- Informações repetidas desnecessariamente.

---

# 22. Templates de relatório

O sistema poderá disponibilizar três modelos.

## Profissional

Relatório completo.

```text
Capa
Resumo executivo
Escopo
Ambiente
Resultados
Ocorrências
Evidências
Conclusão
```

## Compacto

Para compartilhamento rápido.

```text
Resumo
Ocorrências
Evidências
Conclusão
```

## Executivo

Destinado principalmente à gestão.

```text
Resumo executivo
Indicadores
Principais problemas
Severidades
Recomendações
Conclusão
```

---

# 23. Geração do PDF

O usuário deve possuir um botão:

```text
GERAR RELATÓRIO PDF
```

Antes da geração, abrir uma configuração:

```text
Título do relatório
Modelo
Incluir capa       ☑
Incluir resumo     ☑
Incluir gráficos   ☑
Incluir evidências ☑
Incluir conclusão  ☑
```

Após gerar:

```text
Relatório gerado com sucesso.

[ Visualizar PDF ]

[ Gerar novamente ]
```

---

# 24. Nome do arquivo

O sistema deve gerar nomes padronizados.

Exemplo:

```text
QA_Portal-Administrativo_Homologacao_Sprint-04_2026-09-09.pdf
```

---

# 25. Banco de dados

Para o MVP, utilizar **Firebase**.

Serviços recomendados:

```text
Firebase Authentication
Cloud Firestore
Firebase Storage
```

## Authentication

Responsável pelo login.

Métodos iniciais:

```text
E-mail + senha
```

Futuramente:

```text
Google
Microsoft
```

---

# 26. Estrutura Firestore

Sugestão:

```text
users
  └── userId

projects
  └── projectId
       ├── name
       ├── description
       ├── client
       ├── version
       ├── status
       ├── createdAt
       └── createdBy

testCycles
  └── cycleId
       ├── projectId
       ├── name
       ├── description
       ├── version
       ├── environment
       ├── startDate
       ├── endDate
       ├── status
       └── createdBy

issues
  └── issueId
       ├── projectId
       ├── cycleId
       ├── code
       ├── type
       ├── title
       ├── description
       ├── status
       ├── severity
       ├── priority
       ├── environment
       ├── expectedResult
       ├── actualResult
       ├── reproductionSteps
       ├── impact
       ├── createdAt
       ├── updatedAt
       └── createdBy

evidences
  └── evidenceId
       ├── issueId
       ├── url
       ├── fileName
       ├── caption
       ├── order
       └── createdAt
```

---

# 27. Firebase Storage

Os arquivos das evidências devem ser armazenados no Firebase Storage.

Estrutura sugerida:

```text
projects/
  {projectId}/
    cycles/
      {cycleId}/
        issues/
          {issueId}/
            evidences/
              screenshot-01.png
              screenshot-02.png
```

O Firestore deve armazenar apenas os metadados e URLs necessárias.

---

# 28. Autenticação e segurança

O sistema deve possuir:

- Login.
- Logout.
- Proteção de rotas.
- Recuperação de senha.
- Controle de usuário autenticado.
- Regras de segurança do Firestore.
- Regras de segurança do Storage.

Usuário não autenticado não deve acessar:

```text
/dashboard
/projects
/cycles
/issues
/reports
```

---

# 29. Rotas sugeridas

```text
/login

/dashboard

/projects

/projects/new

/projects/:projectId

/projects/:projectId/edit

/projects/:projectId/cycles

/projects/:projectId/cycles/new

/cycles/:cycleId

/cycles/:cycleId/issues

/cycles/:cycleId/issues/new

/issues/:issueId

/issues/:issueId/edit

/reports

/reports/:reportId
```

---

# 30. Tela de criação de ocorrência

A interface deve ser dividida em seções.

```text
┌─────────────────────────────────────────────┐
│ Nova ocorrência                             │
├─────────────────────────────────────────────┤
│                                             │
│ Tipo                                        │
│ [ Bug ▼ ]                                   │
│                                             │
│ Título                                      │
│ [_________________________________________]  │
│                                             │
│ Descrição                                   │
│ [                                         ] │
│ [                                         ] │
│                                             │
├─────────────────────────────────────────────┤
│ CLASSIFICAÇÃO                               │
│                                             │
│ Severidade [ Alta ▼ ]                       │
│ Prioridade [ Alta ▼ ]                       │
│ Status     [ Aberto ▼ ]                     │
│                                             │
├─────────────────────────────────────────────┤
│ AMBIENTE                                    │
│                                             │
│ Navegador                                   │
│ Sistema operacional                         │
│ Versão                                      │
│ Ambiente                                    │
│                                             │
├─────────────────────────────────────────────┤
│ REPRODUÇÃO                                  │
│                                             │
│ Passos                                      │
│                                             │
│ 1. [_____________________________]           │
│ 2. [_____________________________]           │
│ 3. [_____________________________]           │
│                                             │
│ [+ Adicionar passo]                         │
│                                             │
├─────────────────────────────────────────────┤
│ RESULTADOS                                  │
│                                             │
│ Resultado esperado                          │
│ [                                         ] │
│                                             │
│ Resultado encontrado                        │
│ [                                         ] │
│                                             │
├─────────────────────────────────────────────┤
│ EVIDÊNCIAS                                  │
│                                             │
│ [ Arraste seus prints aqui ]                │
│                                             │
├─────────────────────────────────────────────┤
│              [ Cancelar ] [ Salvar ]        │
└─────────────────────────────────────────────┘
```

---

# 31. Validações

Campos obrigatórios:

## Todos os tipos

```text
Tipo
Título
Descrição
Prioridade
Status
```

## Bug

```text
Passos para reprodução
Resultado esperado
Resultado encontrado
```

O sistema deve informar claramente quais campos estão faltando.

---

# 32. Experiência do usuário

O sistema deve evitar formulários cansativos.

Utilizar:

- Campos condicionais.
- Autocomplete quando fizer sentido.
- Upload com drag and drop.
- Preview de imagens.
- Salvamento automático opcional.
- Feedback visual.
- Toasts.
- Confirmações antes de exclusões.
- Loading states.
- Empty states.

---

# 33. Recursos automáticos

Sempre que possível, o sistema deve preencher automaticamente:

```text
Data
Hora
Usuário
Navegador
Sistema operacional
Versão do relatório
```

O usuário poderá editar informações quando necessário.

---

# 34. Numeração automática

As ocorrências devem receber códigos automaticamente.

Exemplo:

```text
BUG-001
BUG-002
BUG-003

FEA-001
FEA-002

MEL-001

COR-001
```

A numeração deve ser sequencial dentro do projeto/ciclo.

---

# 35. Filtros

A listagem de ocorrências deve permitir filtrar por:

```text
Tipo
Status
Severidade
Prioridade
Responsável
Data
```

Também deve possuir pesquisa por:

```text
ID
Título
Descrição
```

---

# 36. Ordenação

Permitir ordenar por:

```text
Mais recentes
Mais antigas
Maior severidade
Maior prioridade
Código
Status
```

---

# 37. Relatório inteligente

Antes da geração do PDF, o sistema deve validar:

- Existem ocorrências sem título?
- Existem bugs sem resultado esperado?
- Existem bugs sem evidência?
- Existem ocorrências críticas?
- Existem ocorrências bloqueadas?
- Existem ocorrências abertas?
- Existem imagens muito grandes?
- Existem campos importantes vazios?

Exemplo:

```text
⚠ Atenção

Existem 3 ocorrências críticas ainda abertas.

Existem 2 bugs sem evidência.

Deseja gerar o relatório mesmo assim?

[ Cancelar ] [ Gerar mesmo assim ]
```

---

# 38. Conclusão automática

O sistema pode montar uma conclusão baseada nos dados.

Exemplo:

> Durante o ciclo de homologação foram executados 42 testes. Foram identificadas 18 ocorrências, sendo 8 bugs, 3 features, 5 melhorias e 2 correções. No momento da emissão deste relatório, 3 ocorrências permanecem bloqueadas e 2 ocorrências de severidade alta continuam abertas.

Essa funcionalidade pode ser manual no MVP e automatizada posteriormente.

---

# 39. MVP

A primeira versão deve ser simples.

## Obrigatório

- Login.
- Dashboard.
- CRUD de projetos.
- CRUD de ciclos.
- CRUD de ocorrências.
- Tipos Bug/Feature/Melhoria/Correção.
- Severidade.
- Prioridade.
- Status.
- Upload de imagens.
- Preview das imagens.
- Firestore.
- Firebase Storage.
- Geração de PDF.
- Resumo executivo.
- Template profissional.

## Não obrigatório no MVP

- IA.
- Anotação de imagens.
- Colaboração em tempo real.
- Comentários.
- Notificações.
- Integração Jira.
- Integração Azure DevOps.
- Integração Trello.
- Login Microsoft.
- Gráficos avançados.

---

# 40. Segunda versão

Possíveis funcionalidades:

- IA para melhorar descrição.
- IA para sugerir título.
- IA para sugerir severidade.
- IA para identificar informações ausentes.
- Anotação de screenshots.
- Histórico de alterações.
- Comentários.
- Menções.
- Templates personalizados.
- Logo da empresa.
- Cores personalizadas.
- Assinatura digital.
- Exportação para Excel.
- Exportação para Word.
- Integração Jira.
- Integração Azure DevOps.
- Integração GitHub Issues.
- Integração Trello.

---

# 41. Terceira versão

Possibilidade de transformar o sistema em SaaS.

## Organização

```text
Organização
  ├── Usuários
  ├── Projetos
  ├── Relatórios
  └── Configurações
```

Permissões:

```text
Administrador
QA
Gestor
Visualizador
```

---

# 42. Personalização de relatórios

Permitir configurar:

```text
Logo
Nome da empresa
Nome do cliente
Cores
Rodapé
Cabeçalho
Responsável
Assinatura
```

Isso permitirá que empresas usem o sistema como uma ferramenta própria de documentação.

---

# 43. Stack sugerida

Para o MVP:

```text
Frontend:
React + TypeScript

UI:
Tailwind CSS

Backend:
Firebase

Autenticação:
Firebase Authentication

Banco:
Cloud Firestore

Arquivos:
Firebase Storage

PDF:
Biblioteca de geração de PDF adequada ao frontend/backend
```

Alternativamente, caso seja necessário maior controle visual do PDF:

```text
Frontend:
React + TypeScript

Backend:
Node.js

PDF:
Playwright/Puppeteer
```

A abordagem com HTML/CSS renderizado para PDF tende a facilitar a criação de relatórios visualmente sofisticados.

---

# 44. Princípios técnicos

O projeto deve seguir:

- TypeScript.
- Componentização.
- Código reutilizável.
- Separação de responsabilidades.
- Validação de formulários.
- Tratamento de erros.
- Loading states.
- Empty states.
- Responsividade.
- Acessibilidade.
- Segurança do Firebase.
- Não expor dados sensíveis.
- Variáveis de ambiente.
- Código limpo.
- Nomes consistentes.

---

# 45. Dashboard ideal

O dashboard deve responder rapidamente:

> "Como está o meu ciclo de testes?"

Exemplo:

```text
┌───────────────────────────────────────────────────┐
│ QA Report Generator                               │
│                                                   │
│ Olá, Rayan                                        │
│                                                   │
├───────────────────────────────────────────────────┤
│                                                   │
│ Projetos             4                            │
│ Ciclos ativos        2                            │
│ Ocorrências          37                           │
│ Relatórios           12                           │
│                                                   │
├───────────────────────────────────────────────────┤
│                                                   │
│ Projeto: Portal Administrativo                   │
│ Ciclo: Homologação Sprint 04                     │
│                                                   │
│ 🐞 8 Bugs     ✨ 3 Features     🔧 5 Melhorias    │
│                                                   │
│ 🔴 1 Crítica   🟠 3 Altas   🟡 8 Médias           │
│                                                   │
│ [ Abrir ciclo ]        [ Gerar relatório ]       │
│                                                   │
└───────────────────────────────────────────────────┘
```

---

# 46. Requisito importante: PDF como produto principal

O PDF não deve parecer uma simples impressão da tela.

Ele deve possuir um layout próprio.

O sistema deve tratar o PDF como um **produto final**.

Características:

- Capa profissional.
- Sumário quando necessário.
- Cabeçalho.
- Rodapé.
- Número da página.
- Hierarquia de títulos.
- Cards de indicadores.
- Tabelas organizadas.
- Evidências dimensionadas corretamente.
- Quebra de página inteligente.
- Não separar título de conteúdo.
- Não deixar legenda de imagem em outra página.
- Evitar imagens cortadas.
- Manter proporção das imagens.
- Destacar severidade.
- Destacar status.
- Identificar cada ocorrência.

---

# 47. Exemplo de fluxo completo

```text
1. Usuário faz login.

2. Acessa Dashboard.

3. Cria projeto:
   "Portal Administrativo"

4. Cria ciclo:
   "Homologação Sprint 04"

5. Cria BUG-001.

6. Seleciona:
   Tipo: Bug
   Severidade: Alta
   Prioridade: Alta
   Status: Aberto

7. Preenche descrição.

8. Adiciona passos de reprodução.

9. Preenche resultado esperado.

10. Preenche resultado encontrado.

11. Adiciona 2 screenshots.

12. Salva.

13. Cria outras ocorrências.

14. Acessa "Gerar relatório".

15. Seleciona:
    Template Profissional.

16. Visualiza prévia.

17. Sistema identifica:
    3 ocorrências críticas/altas abertas.

18. Usuário confirma.

19. Sistema gera PDF.

20. Usuário visualiza o relatório.

21. Usuário compartilha o PDF com desenvolvimento/gestão.
```

---

# 48. Critérios de aceite do MVP

## Autenticação

- [ ] Usuário consegue criar conta.
- [ ] Usuário consegue fazer login.
- [ ] Usuário consegue sair.
- [ ] Rotas privadas estão protegidas.

## Projetos

- [ ] Criar projeto.
- [ ] Editar projeto.
- [ ] Visualizar projeto.
- [ ] Excluir projeto.
- [ ] Listar projetos.

## Ciclos

- [ ] Criar ciclo.
- [ ] Editar ciclo.
- [ ] Visualizar ciclo.
- [ ] Excluir ciclo.
- [ ] Listar ciclos.

## Ocorrências

- [ ] Criar Bug.
- [ ] Criar Feature.
- [ ] Criar Melhoria.
- [ ] Criar Correção.
- [ ] Editar ocorrência.
- [ ] Excluir ocorrência.
- [ ] Alterar status.
- [ ] Alterar severidade.
- [ ] Alterar prioridade.
- [ ] Filtrar ocorrências.
- [ ] Pesquisar ocorrências.

## Evidências

- [ ] Upload de imagem.
- [ ] Preview.
- [ ] Legenda.
- [ ] Ordenação.
- [ ] Exclusão.

## PDF

- [ ] Gerar capa.
- [ ] Gerar resumo.
- [ ] Gerar indicadores.
- [ ] Gerar ocorrências.
- [ ] Incluir evidências.
- [ ] Gerar conclusão.
- [ ] Numerar páginas.
- [ ] Aplicar layout profissional.

---

# 49. Visão futura

O produto pode evoluir de um simples gerador de PDF para uma plataforma completa de apoio ao QA.

Visão:

```text
                 QA REPORT GENERATOR

                        ↓

              Gestão de projetos
                        ↓
               Gestão de testes
                        ↓
              Gestão de ocorrências
                        ↓
                Evidências
                        ↓
                 Relatórios
                        ↓
                    IA
                        ↓
              Integrações externas
```

A longo prazo, o sistema poderá auxiliar o QA desde a execução do teste até a entrega do relatório final.

---

# 50. Nome provisório

Nome sugerido:

**QA Report Generator**

Outras possibilidades:

- QAFlow
- QA Report
- TestReport
- QA Docs
- TestDocs
- QA Evidence
- Quality Report
- TestHub
- QADesk
- QACentral
- QA Manager
- TestLog
- QualityHub

O nome definitivo pode ser definido posteriormente.

---

# 51. Regra de ouro do produto

> **O QA deve gastar seu tempo testando o sistema, e não formatando relatório.**

O sistema deve transformar informações simples preenchidas pelo QA em uma documentação clara, padronizada, profissional e fácil de compreender.
