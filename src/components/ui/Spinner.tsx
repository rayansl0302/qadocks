export function Spinner({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted" role="status" aria-live="polite">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-teal" />
      {label}
    </div>
  );
}
