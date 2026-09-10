import { FieldLayout } from '@/components/ui/FieldLayout';
import { bumpVersion } from '@/lib/version';
import { cn } from '@/lib/cn';

export function VersionField({
  label,
  hint,
  error,
  value,
  onChange,
  baseVersion = '',
  id,
}: {
  label: string;
  hint?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  baseVersion?: string;
  id?: string;
}) {
  const patch = bumpVersion(value, 'patch', baseVersion);
  const minor = bumpVersion(value, 'minor', baseVersion);
  const major = bumpVersion(value, 'major', baseVersion);

  return (
    <FieldLayout label={label} htmlFor={id} error={error} hint={hint}>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={baseVersion || '1.0.0'}
        className={cn(
          'rounded-xl border border-line bg-surface px-3 py-2.5 text-ink outline-none placeholder:text-muted/70',
          error && 'border-danger',
        )}
      />
      <div className="mt-2 grid gap-2">
        <BumpButton
          label={`Patch ${patch}`}
          description="Correção pequena. Sobe o último número: 1.4.2 → 1.4.3."
          onClick={() => onChange(patch)}
        />
        <BumpButton
          label={`Minor ${minor}`}
          description="Funcionalidade nova, sem quebrar o que já existe. Sobe o do meio: 1.4.2 → 1.5.0."
          onClick={() => onChange(minor)}
        />
        <BumpButton
          label={`Major ${major}`}
          description="Mudança grande ou incompatível. Sobe o primeiro número: 1.4.2 → 2.0.0."
          onClick={() => onChange(major)}
        />
      </div>
    </FieldLayout>
  );
}

function BumpButton({
  label,
  description,
  onClick,
}: {
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col items-start gap-0.5 rounded-lg border border-line bg-paper px-3 py-2 text-left hover:border-teal"
    >
      <span className="text-xs font-semibold text-teal">{label}</span>
      <span className="text-xs leading-4 text-muted">{description}</span>
    </button>
  );
}
