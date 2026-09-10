import { PRIORITY_ORDER, SEVERITY_ORDER } from '@/lib/constants';
import type { Issue, IssueFilters, IssueSort } from '@/types';

export function filterIssues(issues: Issue[], filters: IssueFilters): Issue[] {
  const search = filters.search.trim().toLowerCase();

  return issues.filter((issue) => {
    if (filters.type !== 'todos' && issue.type !== filters.type) {
      return false;
    }
    if (filters.status !== 'todos' && issue.status !== filters.status) {
      return false;
    }
    if (filters.severity !== 'todos' && issue.severity !== filters.severity) {
      return false;
    }
    if (filters.priority !== 'todos' && issue.priority !== filters.priority) {
      return false;
    }
    if (filters.assignee && !issue.assignee.toLowerCase().includes(filters.assignee.toLowerCase())) {
      return false;
    }
    if (filters.dateFrom && issue.createdAt < new Date(`${filters.dateFrom}T00:00:00`)) {
      return false;
    }
    if (filters.dateTo && issue.createdAt > new Date(`${filters.dateTo}T23:59:59`)) {
      return false;
    }
    if (!search) {
      return true;
    }
    return (
      issue.code.toLowerCase().includes(search) ||
      issue.title.toLowerCase().includes(search) ||
      issue.description.toLowerCase().includes(search)
    );
  });
}

export function sortIssues(issues: Issue[], sort: IssueSort): Issue[] {
  const cloned = [...issues];
  cloned.sort((left, right) => {
    if (sort === 'mais_antigas') {
      return left.createdAt.getTime() - right.createdAt.getTime();
    }
    if (sort === 'maior_severidade') {
      return SEVERITY_ORDER[right.severity] - SEVERITY_ORDER[left.severity];
    }
    if (sort === 'maior_prioridade') {
      return PRIORITY_ORDER[right.priority] - PRIORITY_ORDER[left.priority];
    }
    if (sort === 'codigo') {
      return left.code.localeCompare(right.code);
    }
    if (sort === 'status') {
      return left.status.localeCompare(right.status);
    }
    return right.createdAt.getTime() - left.createdAt.getTime();
  });
  return cloned;
}
