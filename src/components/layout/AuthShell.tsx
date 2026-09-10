import type { ReactNode } from 'react';

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-teal px-12 py-12 text-paper lg:flex">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-paper/70">QA Report Generator</p>
          <h1 className="mt-6 max-w-md font-display text-5xl leading-tight">
            O QA testa. O sistema formata o relatório.
          </h1>
        </div>
        <p className="max-w-md text-paper/80">
          Crie projetos, registre ocorrências e gere um PDF profissional sem perder tempo com formatação.
        </p>
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h2 className="font-display text-4xl">{title}</h2>
          <p className="mt-2 mb-8 text-muted">{subtitle}</p>
          {children}
        </div>
      </section>
    </div>
  );
}
