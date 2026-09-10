import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { buildBreadcrumbs } from '@/lib/breadcrumbs';
import { getCycle } from '@/services/cycleService';
import { getIssue } from '@/services/issueService';
import { getProject } from '@/services/projectService';

export function AppBreadcrumbs() {
  const { pathname } = useLocation();
  const { projectId, cycleId, issueId } = useParams();
  const [projectName, setProjectName] = useState('');
  const [cycleName, setCycleName] = useState('');
  const [issueLabel, setIssueLabel] = useState('');
  const [resolvedProjectId, setResolvedProjectId] = useState(projectId ?? '');
  const [resolvedCycleId, setResolvedCycleId] = useState(cycleId ?? '');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let nextProjectId = projectId ?? '';
      let nextCycleId = cycleId ?? '';
      let nextProjectName = '';
      let nextCycleName = '';
      let nextIssueLabel = '';

      try {
        if (issueId) {
          const issue = await getIssue(issueId);
          if (issue) {
            nextIssueLabel = issue.code || issue.title;
            nextCycleId = issue.cycleId;
            nextProjectId = issue.projectId;
          }
        }
        if (nextCycleId) {
          const cycle = await getCycle(nextCycleId);
          if (cycle) {
            nextCycleName = cycle.name;
            nextProjectId = cycle.projectId;
          }
        }
        if (nextProjectId) {
          const project = await getProject(nextProjectId);
          if (project) {
            nextProjectName = project.name;
          }
        }
      } catch {
      }

      if (cancelled) {
        return;
      }
      setProjectName(nextProjectName);
      setCycleName(nextCycleName);
      setIssueLabel(nextIssueLabel);
      setResolvedProjectId(nextProjectId);
      setResolvedCycleId(nextCycleId);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [projectId, cycleId, issueId]);

  const items = buildBreadcrumbs({
    pathname,
    projectId: resolvedProjectId,
    cycleId: resolvedCycleId,
    issueId: issueId ?? '',
    projectName,
    cycleName,
    issueLabel,
  });

  return (
    <nav aria-label="Caminho da página" className="mb-4 overflow-x-auto">
      <ol className="flex min-w-min items-center gap-1.5 text-sm">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 ? <ChevronRight size={14} className="shrink-0 text-muted" aria-hidden /> : null}
            {item.to ? (
              <Link to={item.to} className="whitespace-nowrap text-muted hover:text-teal">
                {item.label}
              </Link>
            ) : (
              <span className="whitespace-nowrap font-medium text-ink" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
