import { Button } from '@/components/ui/Button';

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <h2 id="confirm-title" className="font-display text-2xl">
          {title}
        </h2>
        <p className="mt-3 text-sm text-muted">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
