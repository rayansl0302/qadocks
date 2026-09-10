import { ISSUE_TYPE_PREFIX } from '@/lib/constants';
import type { Issue, IssueType } from '@/types';

export function nextIssueCode(issues: Issue[], type: IssueType): string {
  const prefix = ISSUE_TYPE_PREFIX[type];
  const max = issues.reduce((current, issue) => {
    if (!issue.code.startsWith(`${prefix}-`)) {
      return current;
    }
    const numeric = Number.parseInt(issue.code.split('-')[1] ?? '0', 10);
    return Number.isNaN(numeric) ? current : Math.max(current, numeric);
  }, 0);

  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
}
