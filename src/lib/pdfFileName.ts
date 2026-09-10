import { format } from 'date-fns';
import { slugify } from '@/lib/format';

export function buildReportFileName(projectName: string, cycleName: string, date = new Date()): string {
  const project = slugify(projectName) || 'Projeto';
  const cycle = slugify(cycleName) || 'Ciclo';
  return `QA_${project}_${cycle}_${format(date, 'yyyy-MM-dd')}.pdf`;
}
