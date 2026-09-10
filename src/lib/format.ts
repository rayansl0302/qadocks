import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
}

export function formatDateTime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
