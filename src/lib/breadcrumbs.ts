import { matchPath } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbInput {
  pathname: string;
  projectId: string;
  cycleId: string;
  issueId: string;
  projectName: string;
  cycleName: string;
  issueLabel: string;
}

export function buildBreadcrumbs(input: BreadcrumbInput): BreadcrumbItem[] {
  const home: BreadcrumbItem = { label: 'Dashboard', to: '/dashboard' };
  const projects: BreadcrumbItem = { label: 'Projetos', to: '/projects' };
  const project: BreadcrumbItem = {
    label: input.projectName || 'Projeto',
    to: input.projectId ? `/projects/${input.projectId}` : undefined,
  };
  const cycles: BreadcrumbItem = {
    label: 'Ciclos',
    to: input.projectId ? `/projects/${input.projectId}/cycles` : undefined,
  };
  const cycle: BreadcrumbItem = {
    label: input.cycleName || 'Ciclo',
    to: input.cycleId ? `/cycles/${input.cycleId}` : undefined,
  };
  const issue: BreadcrumbItem = {
    label: input.issueLabel || 'Ocorrência',
    to: input.issueId ? `/issues/${input.issueId}` : undefined,
  };

  if (matchPath({ path: '/dashboard', end: true }, input.pathname)) {
    return [{ label: 'Dashboard' }];
  }
  if (matchPath({ path: '/projects/new', end: true }, input.pathname)) {
    return [home, projects, { label: 'Novo projeto' }];
  }
  if (matchPath({ path: '/projects/:projectId/edit', end: true }, input.pathname)) {
    return [home, projects, project, { label: 'Editar' }];
  }
  if (matchPath({ path: '/projects/:projectId/cycles/new', end: true }, input.pathname)) {
    return [home, projects, project, cycles, { label: 'Novo ciclo' }];
  }
  if (matchPath({ path: '/projects/:projectId/cycles', end: true }, input.pathname)) {
    return [home, projects, project, { label: 'Ciclos' }];
  }
  if (matchPath({ path: '/projects/:projectId', end: true }, input.pathname)) {
    return [home, projects, { label: project.label }];
  }
  if (matchPath({ path: '/projects', end: true }, input.pathname)) {
    return [home, { label: 'Projetos' }];
  }
  if (matchPath({ path: '/cycles/:cycleId/issues/new', end: true }, input.pathname)) {
    return [home, projects, project, cycle, { label: 'Nova ocorrência' }];
  }
  if (matchPath({ path: '/cycles/:cycleId/relatorio', end: true }, input.pathname)) {
    return [home, projects, project, cycle, { label: 'Relatório' }];
  }
  if (matchPath({ path: '/cycles/:cycleId/acompanhamento', end: true }, input.pathname)) {
    return [home, projects, project, cycle, { label: 'Acompanhamento' }];
  }
  if (matchPath({ path: '/cycles/:cycleId/edit', end: true }, input.pathname)) {
    return [home, projects, project, cycle, { label: 'Editar' }];
  }
  if (matchPath({ path: '/cycles/:cycleId/issues', end: true }, input.pathname)) {
    return [home, projects, project, { label: cycle.label }];
  }
  if (matchPath({ path: '/cycles/:cycleId', end: true }, input.pathname)) {
    return [home, projects, project, { label: cycle.label }];
  }
  if (matchPath({ path: '/issues/:issueId/edit', end: true }, input.pathname)) {
    return [home, projects, project, cycle, issue, { label: 'Editar' }];
  }
  if (matchPath({ path: '/issues/:issueId', end: true }, input.pathname)) {
    return [home, projects, project, cycle, { label: issue.label }];
  }
  if (matchPath({ path: '/reports/:reportId', end: true }, input.pathname)) {
    return [home, { label: 'Relatórios' }];
  }
  if (matchPath({ path: '/reports', end: true }, input.pathname)) {
    return [home, { label: 'Relatórios' }];
  }
  if (matchPath({ path: '/base-conhecimento', end: true }, input.pathname)) {
    return [home, { label: 'Base de conhecimento' }];
  }
  if (matchPath({ path: '/perfil', end: true }, input.pathname)) {
    return [home, { label: 'Perfil' }];
  }

  return [home];
}
