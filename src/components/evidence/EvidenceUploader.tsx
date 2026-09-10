import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { Evidence } from '@/types';

export interface PendingEvidence {
  id: string;
  file: File;
  previewUrl: string;
  caption: string;
}

interface EvidenceUploaderProps {
  saved: Evidence[];
  pending: PendingEvidence[];
  onPendingChange: (items: PendingEvidence[]) => void;
  onCaptionChange: (evidenceId: string, caption: string) => void;
  onReorderSaved: (orderedIds: string[]) => void;
  onDeleteSaved: (evidence: Evidence) => void;
}

export function EvidenceUploader({
  saved,
  pending,
  onPendingChange,
  onCaptionChange,
  onReorderSaved,
  onDeleteSaved,
}: EvidenceUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function addFiles(fileList: FileList | null) {
    if (!fileList) {
      return;
    }
    const images = Array.from(fileList).filter((file) => file.type.startsWith('image/'));
    const next = images.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      caption: '',
    }));
    onPendingChange([...pending, ...next]);
  }

  function movePending(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= pending.length) {
      return;
    }
    const clone = [...pending];
    const [item] = clone.splice(index, 1);
    clone.splice(target, 0, item);
    onPendingChange(clone);
  }

  function moveSaved(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= saved.length) {
      return;
    }
    const clone = [...saved];
    const [item] = clone.splice(index, 1);
    clone.splice(target, 0, item);
    onReorderSaved(clone.map((evidence) => evidence.id));
  }

  return (
    <div className="grid gap-4">
      <button
        type="button"
        className={`flex min-h-36 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-8 text-sm ${
          dragging ? 'border-teal bg-teal/5 text-teal' : 'border-line bg-paper text-muted'
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
      >
        <ImagePlus size={24} />
        Arraste seus prints aqui ou clique para enviar
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = '';
        }}
      />

      {[...saved.map((item, index) => ({ kind: 'saved' as const, item, index })), ...pending.map((item, index) => ({ kind: 'pending' as const, item, index }))].map(
        (entry) => {
          if (entry.kind === 'saved') {
            const evidence = entry.item;
            return (
              <article key={evidence.id} className="grid gap-3 rounded-2xl border border-line bg-paper p-4 md:grid-cols-[180px_1fr_auto]">
                <img src={evidence.url} alt={evidence.caption || evidence.fileName} className="h-32 w-full rounded-xl object-cover" />
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium">Legenda</span>
                  <input
                    value={evidence.caption}
                    onChange={(event) => onCaptionChange(evidence.id, event.target.value)}
                    className="rounded-xl border border-line bg-surface px-3 py-2"
                  />
                </label>
                <div className="flex items-start gap-2">
                  <Button variant="ghost" onClick={() => moveSaved(entry.index, -1)} aria-label="Mover para cima">
                    <ArrowUp size={16} />
                  </Button>
                  <Button variant="ghost" onClick={() => moveSaved(entry.index, 1)} aria-label="Mover para baixo">
                    <ArrowDown size={16} />
                  </Button>
                  <Button variant="ghost" onClick={() => onDeleteSaved(evidence)} aria-label="Excluir evidência">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </article>
            );
          }

          const pendingItem = entry.item;
          return (
            <article key={pendingItem.id} className="grid gap-3 rounded-2xl border border-line bg-paper p-4 md:grid-cols-[180px_1fr_auto]">
              <img src={pendingItem.previewUrl} alt={pendingItem.file.name} className="h-32 w-full rounded-xl object-cover" />
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">Legenda</span>
                <input
                  value={pendingItem.caption}
                  onChange={(event) => {
                    const next = pending.map((item) =>
                      item.id === pendingItem.id ? { ...item, caption: event.target.value } : item,
                    );
                    onPendingChange(next);
                  }}
                  className="rounded-xl border border-line bg-surface px-3 py-2"
                />
              </label>
              <div className="flex items-start gap-2">
                <Button variant="ghost" onClick={() => movePending(entry.index, -1)} aria-label="Mover para cima">
                  <ArrowUp size={16} />
                </Button>
                <Button variant="ghost" onClick={() => movePending(entry.index, 1)} aria-label="Mover para baixo">
                  <ArrowDown size={16} />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    URL.revokeObjectURL(pendingItem.previewUrl);
                    onPendingChange(pending.filter((item) => item.id !== pendingItem.id));
                  }}
                  aria-label="Excluir evidência"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </article>
          );
        },
      )}
    </div>
  );
}
