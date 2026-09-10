import { format } from 'date-fns';
import { slugify } from '@/lib/format';

export function buildReportFileName(
  projectName: string,
  cycleName: string,
  date = new Date(),
  variant?: string,
): string {
  const project = slugify(projectName) || 'Projeto';
  const cycle = slugify(cycleName) || 'Ciclo';
  const extra = variant ? `_${slugify(variant)}` : '';
  return `QA_${project}_${cycle}${extra}_${format(date, 'yyyy-MM-dd')}.pdf`;
}
