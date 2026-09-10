import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(import.meta.dirname, '..');
const printsDir = path.join(root, 'docs', 'manual', 'prints');
const outPdf = path.join(root, 'docs', 'Manual_QA_Report_Generator.pdf');
const publicPdf = path.join(root, 'public', 'Manual_QA_Report_Generator.pdf');
const base = 'http://localhost:5173';

const screens = [
  { id: 'login', url: `${base}/login`, title: 'Login' },
  { id: 'dashboard', url: `${base}/_manual-preview/dashboard`, title: 'Dashboard' },
  { id: 'projects', url: `${base}/_manual-preview/projects`, title: 'Projetos' },
  { id: 'project-form', url: `${base}/_manual-preview/project-form`, title: 'Novo projeto' },
  { id: 'cycle-form', url: `${base}/_manual-preview/cycle-form`, title: 'Novo ciclo' },
  { id: 'cycle-detail', url: `${base}/_manual-preview/cycle-detail`, title: 'Ciclo de teste' },
  { id: 'issue-form', url: `${base}/_manual-preview/issue-form`, title: 'Nova ocorrência' },
  { id: 'follow-up', url: `${base}/_manual-preview/follow-up`, title: 'Acompanhamento' },
  { id: 'report', url: `${base}/_manual-preview/report`, title: 'Gerar relatório' },
  { id: 'reports', url: `${base}/_manual-preview/reports`, title: 'Histórico de relatórios' },
  { id: 'profile', url: `${base}/_manual-preview/profile`, title: 'Perfil' },
];

const guide = [
  {
    id: 'login',
    title: '1. Entrar no sistema',
    text: 'Abra o QA Report Generator e informe e-mail e senha. Marque Salvar login para o e-mail voltar preenchido na próxima vez. Use Recuperar senha se esquecer o acesso. O cadastro público não existe: novas contas são criadas só pelo administrador, no Perfil.',
  },
  {
    id: 'dashboard',
    title: '2. Dashboard',
    text: 'Depois do login você cai no Dashboard. Ali aparecem totais de projetos, ciclos, ocorrências e relatórios, o ciclo em destaque e atalhos para abrir o ciclo ou gerar o PDF.',
  },
  {
    id: 'projects',
    title: '3. Projetos',
    text: 'Em Projetos ficam os sistemas testados. Cada card mostra cliente, nome, descrição e status. Clique no card para abrir o projeto ou em Novo projeto para cadastrar outro.',
  },
  {
    id: 'project-form',
    title: '4. Novo projeto',
    text: 'Preencha nome, descrição, cliente, versão, ambiente e status. O Responsável pelo QA vem do seu perfil. Ambiente e status são listas. Versão sobe com Patch, Minor ou Major.',
  },
  {
    id: 'cycle-form',
    title: '5. Novo ciclo de teste',
    text: 'Dentro do projeto, crie um ciclo (Homologação, Regressão, Smoke Test). Informe período, versão e ambiente. O nome do ciclo também pode ser escolhido na lista.',
  },
  {
    id: 'cycle-detail',
    title: '6. Tela do ciclo',
    text: 'A tela do ciclo lista as ocorrências com tipo, severidade, prioridade e status. Dali você cria ocorrência, gera o relatório PDF ou abre o Acompanhamento.',
  },
  {
    id: 'issue-form',
    title: '7. Nova ocorrência',
    text: 'Escolha o tipo: Bug, Feature, Melhoria ou Correção. Os campos mudam conforme o tipo. Bug pede passos, resultado esperado e encontrado. Anexe prints na área de evidências.',
  },
  {
    id: 'follow-up',
    title: '8. Acompanhamento',
    text: 'O acompanhamento separa o que foi resolvido (Aprovado ou Rejeitado) do que ficou pendente. Dá para gerar o PDF das duas listas ou a 2ª versão só com pendências.',
  },
  {
    id: 'report',
    title: '9. Gerar relatório PDF',
    text: 'Escolha título, modelo (Profissional, Compacto ou Executivo) e o que entra no PDF: capa, resumo, gráficos, evidências e conclusão. O arquivo segue QA_Projeto_Ciclo_AAAA-MM-DD.pdf.',
  },
  {
    id: 'reports',
    title: '10. Histórico de relatórios',
    text: 'O menu Relatórios guarda as emissões. Use Gerar novamente para voltar à tela do ciclo e emitir outra vez.',
  },
  {
    id: 'profile',
    title: '11. Perfil',
    text: 'No Perfil você altera o nome que aparece como Responsável pelo QA e troca a senha. Na conta do administrador existe a aba Criar conta para liberar acesso a outras pessoas.',
  },
];

await mkdir(printsDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

for (const screen of screens) {
  await page.goto(screen.url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(400);
  const file = path.join(printsDir, `${screen.id}.png`);
  await page.screenshot({ path: file, fullPage: true });
}

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Manual de uso — QA Report Generator</title>
  <style>
    @page { size: A4; margin: 18mm 16mm 18mm 16mm; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: "Segoe UI", Arial, sans-serif; color: #1c1917; background: #fffcf7; }
    h1, h2 { font-family: Georgia, serif; }
    .cover { min-height: 240mm; padding: 28mm 8mm 0; background: #0f3d3e; color: #fffcf7; page-break-after: always; }
    .cover p.kicker { letter-spacing: .2em; text-transform: uppercase; font-size: 11px; opacity: .75; }
    .cover h1 { font-size: 40px; line-height: 1.15; margin: 18px 0 16px; max-width: 420px; }
    .cover .lead { font-size: 16px; max-width: 460px; opacity: .88; }
    .section { page-break-after: always; }
    .section:last-child { page-break-after: auto; }
    h2 { font-size: 22px; color: #0f3d3e; margin: 0 0 10px; }
    p { font-size: 12.5px; line-height: 1.55; color: #3f3a34; margin: 0 0 14px; }
    img { width: 100%; border: 1px solid #ddd6c8; border-radius: 10px; }
    .caption { font-size: 10px; color: #6f675d; margin-top: 6px; }
  </style>
</head>
<body>
  <section class="cover">
    <p class="kicker">QA Report Generator</p>
    <h1>Como usar o sistema</h1>
    <p class="lead">Manual passo a passo com as telas reais: do login ao PDF do relatório.</p>
  </section>
  ${guide
    .map(
      (item) => `
  <section class="section">
    <h2>${item.title}</h2>
    <p>${item.text}</p>
    <img src="prints/${item.id}.png" alt="${item.title}" />
    <p class="caption">Tela: ${screens.find((screen) => screen.id === item.id)?.title ?? item.id}</p>
  </section>`,
    )
    .join('')}
</body>
</html>`;

const htmlPath = path.join(root, 'docs', 'manual', 'index.html');
await writeFile(htmlPath, html, 'utf8');

const printPage = await browser.newPage();
await printPage.goto(`file://${htmlPath.replaceAll('\\', '/')}`, { waitUntil: 'networkidle' });
await printPage.pdf({
  path: outPdf,
  format: 'A4',
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
});
await printPage.pdf({
  path: publicPdf,
  format: 'A4',
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
});

await browser.close();
console.log(`PDF gerado em ${outPdf}`);
