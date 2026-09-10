import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

const OTHER_VALUE = '__other__';

export function SelectWithOther({
  label,
  hint,
  error,
  options,
  value,
  onChange,
  id,
}: {
  label: string;
  hint?: string;
  error?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  id?: string;
}) {
  const [useOther, setUseOther] = useState(Boolean(value) && !options.includes(value));

  useEffect(() => {
    if (value && !options.includes(value)) {
      setUseOther(true);
    }
  }, [value, options]);

  return (
    <div className="grid gap-3">
      <Select
        id={id}
        label={label}
        hint={useOther ? undefined : hint}
        error={error}
        value={useOther ? OTHER_VALUE : value}
        onChange={(event) => {
          const next = event.target.value;
          if (next === OTHER_VALUE) {
            setUseOther(true);
            if (options.includes(value)) {
              onChange('');
            }
            return;
          }
          setUseOther(false);
          onChange(next);
        }}
        options={[
          { value: '', label: 'Selecione' },
          ...options.map((item) => ({ value: item, label: item })),
          { value: OTHER_VALUE, label: 'Outro' },
        ]}
      />
      {useOther ? (
        <Input
          label={`${label} (escrever)`}
          hint={hint}
          value={options.includes(value) ? '' : value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : null}
    </div>
  );
}
