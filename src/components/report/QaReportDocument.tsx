import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import {
  ISSUE_STATUS_LABEL,
  ISSUE_TYPE_LABEL,
  PRIORITY_LABEL,
  SEVERITY_LABEL,
} from '@/lib/constants';
import { formatDate } from '@/lib/format';
import type { ReportStats } from '@/lib/reportStats';
import type { Evidence, Issue, Project, ReportConfig, TestCycle } from '@/types';

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1C1917',
    backgroundColor: '#FFFcf7',
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 48,
    right: 48,
    fontSize: 8,
    color: '#6F675D',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD6C8',
    paddingBottom: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 22,
    left: 48,
    right: 48,
    fontSize: 8,
    color: '#6F675D',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cover: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 40,
  },
  kicker: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#C45C26',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: '#0F3D3E',
    marginTop: 12,
    marginBottom: 16,
  },
  heading: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#0F3D3E',
    marginBottom: 12,
  },
  subheading: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    color: '#0F3D3E',
  },
  muted: {
    color: '#6F675D',
    marginBottom: 4,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD6C8',
    borderRadius: 6,
    padding: 10,
    marginRight: 8,
  },
  cardValue: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#0F3D3E',
  },
  issueBox: {
    borderTopWidth: 1,
    borderTopColor: '#DDD6C8',
    paddingTop: 10,
    paddingBottom: 12,
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  badge: {
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#F4F1EA',
    marginRight: 6,
  },
  barTrack: {
    height: 8,
    backgroundColor: '#F4F1EA',
    borderRadius: 4,
    marginBottom: 8,
  },
  barFill: {
    height: 8,
    backgroundColor: '#0F3D3E',
    borderRadius: 4,
  },
  evidenceImage: {
    width: '100%',
    maxHeight: 320,
    marginTop: 8,
    marginBottom: 6,
  },
  paragraph: {
    lineHeight: 1.45,
    marginBottom: 8,
  },
});

interface QaReportDocumentProps {
  project: Project;
  cycle: TestCycle;
  issues: Issue[];
  evidences: Array<Evidence & { dataUrl?: string }>;
  config: ReportConfig;
  stats: ReportStats;
  generatedAt: Date;
  qaOwner: string;
}

export function QaReportDocument({
  project,
  cycle,
  issues,
  evidences,
  config,
  stats,
  generatedAt,
  qaOwner,
}: QaReportDocumentProps) {
  const evidencesByIssue = new Map<string, Array<Evidence & { dataUrl?: string }>>();
  evidences.forEach((evidence) => {
    const current = evidencesByIssue.get(evidence.issueId) ?? [];
    current.push(evidence);
    evidencesByIssue.set(evidence.issueId, current);
  });

  const showCover = config.template !== 'compacto' && config.includeCover;
  const showSummary = config.includeSummary;
  const showCharts = config.includeCharts && config.template !== 'compacto';
  const showFull = config.template === 'profissional';
  const showIssues = config.template !== 'executivo';
  const showEvidences = config.includeEvidences && config.template !== 'executivo';
  const mainProblems = [...issues]
    .filter((issue) => issue.severity === 'critica' || issue.severity === 'alta')
    .slice(0, 6);

  return (
    <Document title={config.title} author={cycle.owner || project.owner}>
      {showCover ? (
        <Page size="A4" style={styles.page}>
          <Header project={project.name} cycle={cycle.name} />
          <View style={styles.cover}>
            <View>
              <Text style={styles.kicker}>Relatório de QA</Text>
              <Text style={styles.title}>{config.title}</Text>
              <Text style={styles.muted}>Projeto: {project.name}</Text>
              <Text style={styles.muted}>Ciclo: {cycle.name}</Text>
              <Text style={styles.muted}>Versão: {cycle.version || project.version || '—'}</Text>
              <Text style={styles.muted}>Ambiente: {cycle.environment || project.environment || '—'}</Text>
              <Text style={styles.muted}>
                Período: {formatDate(cycle.startDate)} — {formatDate(cycle.endDate)}
              </Text>
              <Text style={styles.muted}>Responsável: {cycle.owner || project.owner || '—'}</Text>
            </View>
            <Text style={styles.muted}>Emitido em {formatDate(generatedAt)}</Text>
          </View>
          <Footer generatedAt={generatedAt} />
        </Page>
      ) : null}

      {showSummary ? (
        <Page size="A4" style={styles.page}>
          <Header project={project.name} cycle={cycle.name} />
          <Text style={styles.heading}>Resumo executivo</Text>
          <View style={styles.cardRow}>
            <Metric label="Ocorrências" value={stats.total} />
            <Metric label="Aprovados" value={stats.approved} />
            <Metric label="Reprovados" value={stats.rejected} />
            <Metric label="Bloqueados" value={stats.blocked} />
          </View>
          {showCharts ? (
            <View>
              <Text style={styles.subheading}>Ocorrências por tipo</Text>
              <Bar label="Bugs" value={stats.byType.bug} total={stats.total} />
              <Bar label="Features" value={stats.byType.feature} total={stats.total} />
              <Bar label="Melhorias" value={stats.byType.melhoria} total={stats.total} />
              <Bar label="Correções" value={stats.byType.correcao} total={stats.total} />
              <Text style={[styles.subheading, { marginTop: 12 }]}>Ocorrências por severidade</Text>
              <Bar label="Crítica" value={stats.bySeverity.critica} total={stats.total} />
              <Bar label="Alta" value={stats.bySeverity.alta} total={stats.total} />
              <Bar label="Média" value={stats.bySeverity.media} total={stats.total} />
              <Bar label="Baixa" value={stats.bySeverity.baixa} total={stats.total} />
            </View>
          ) : null}
          {config.template === 'executivo' ? (
            <View style={{ marginTop: 16 }}>
              <Text style={styles.subheading}>Principais problemas</Text>
              {mainProblems.length === 0 ? (
                <Text style={styles.paragraph}>Não há ocorrências de severidade alta ou crítica.</Text>
              ) : (
                mainProblems.map((issue) => (
                  <Text key={issue.id} style={styles.paragraph}>
                    {issue.code} · {SEVERITY_LABEL[issue.severity]} · {issue.title}
                  </Text>
                ))
              )}
            </View>
          ) : null}
          <Footer generatedAt={generatedAt} />
        </Page>
      ) : null}

      {showFull ? (
        <Page size="A4" style={styles.page}>
          <Header project={project.name} cycle={cycle.name} />
          <Text style={styles.heading}>1. Escopo do teste</Text>
          <Text style={styles.paragraph}>{cycle.description || project.description || 'Escopo não informado.'}</Text>
          <Text style={styles.heading}>2. Ambiente</Text>
          <Text style={styles.muted}>Sistema: {project.name}</Text>
          <Text style={styles.muted}>Versão: {cycle.version || project.version || '—'}</Text>
          <Text style={styles.muted}>Ambiente: {cycle.environment || project.environment || '—'}</Text>
          <Text style={styles.heading}>3. Resultado dos testes</Text>
          <Text style={styles.paragraph}>
            Foram registradas {stats.total} ocorrências neste ciclo. {stats.approved} foram aprovadas, {stats.rejected}{' '}
            reprovadas ou rejeitadas e {stats.blocked} permanecem bloqueadas.
          </Text>
          <Footer generatedAt={generatedAt} />
        </Page>
      ) : null}

      {showIssues ? (
        <Page size="A4" style={styles.page}>
          <Header project={project.name} cycle={cycle.name} />
          <Text style={styles.heading}>{showFull ? '4. Ocorrências' : 'Ocorrências'}</Text>
          {issues.map((issue) => (
            <View key={issue.id} style={styles.issueBox} wrap={false} minPresenceAhead={90}>
              <Text style={styles.subheading}>
                {issue.code} · {issue.title}
              </Text>
              <View style={styles.badgeRow}>
                <Text style={styles.badge}>{SEVERITY_LABEL[issue.severity]}</Text>
                <Text style={styles.badge}>{ISSUE_TYPE_LABEL[issue.type]}</Text>
                <Text style={styles.badge}>{ISSUE_STATUS_LABEL[issue.status]}</Text>
                <Text style={styles.badge}>{PRIORITY_LABEL[issue.priority]}</Text>
              </View>
              <Text style={styles.paragraph}>{issue.description}</Text>
              {issue.type === 'bug' ? (
                <View>
                  <Field label="Ambiente" value={`${issue.environment || '—'} · ${issue.version || '—'} · ${issue.browser || '—'}`} />
                  <Field label="Passos" value={issue.reproductionSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')} />
                  <Field label="Resultado esperado" value={issue.expectedResult} />
                  <Field label="Resultado encontrado" value={issue.actualResult} />
                  <Field label="Impacto" value={issue.impact} />
                </View>
              ) : null}
              {issue.type === 'feature' ? (
                <View>
                  <Field label="Objetivo" value={issue.objective} />
                  <Field label="Critérios de aceite" value={issue.acceptanceCriteria} />
                </View>
              ) : null}
              {issue.type === 'melhoria' ? (
                <View>
                  <Field label="Situação atual" value={issue.currentSituation} />
                  <Field label="Sugestão" value={issue.suggestion} />
                </View>
              ) : null}
              {issue.type === 'correcao' ? (
                <View>
                  <Field label="Problema original" value={issue.originalProblem} />
                  <Field label="Correção realizada" value={issue.correctionMade} />
                </View>
              ) : null}
            </View>
          ))}
          <Footer generatedAt={generatedAt} />
        </Page>
      ) : null}

      {showEvidences ? (
        <Page size="A4" style={styles.page}>
          <Header project={project.name} cycle={cycle.name} />
          <Text style={styles.heading}>{showFull ? '5. Evidências' : 'Evidências'}</Text>
          {issues.map((issue) => {
            const items = evidencesByIssue.get(issue.id) ?? [];
            if (items.length === 0) {
              return null;
            }
            return (
              <View key={issue.id} wrap={false}>
                <Text style={styles.subheading}>
                  {issue.code} · {issue.title}
                </Text>
                {items.map((evidence, index) => (
                  <View key={evidence.id} wrap={false} minPresenceAhead={140}>
                    {evidence.dataUrl ? <Image src={evidence.dataUrl} style={styles.evidenceImage} /> : null}
                    <Text style={styles.muted}>
                      Evidência {String(index + 1).padStart(2, '0')} · {evidence.caption || evidence.fileName}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}
          <Footer generatedAt={generatedAt} />
        </Page>
      ) : null}

      {config.includeConclusion ? (
        <Page size="A4" style={styles.page}>
          <Header project={project.name} cycle={cycle.name} />
          <Text style={styles.heading}>{showFull ? '6. Conclusão' : 'Conclusão'}</Text>
          <Text style={styles.paragraph}>{config.conclusion}</Text>
          {showFull ? (
            <View style={{ marginTop: 28 }}>
              <Text style={styles.heading}>7. Aprovação</Text>
              <Text style={styles.muted}>Responsável pelo QA: {cycle.owner || project.owner || '—'}</Text>
              <Text style={styles.muted}>Data: {formatDate(generatedAt)}</Text>
              <Text style={styles.muted}>Observações: {cycle.description || '—'}</Text>
            </View>
          ) : null}
          {config.template === 'executivo' ? (
            <View style={{ marginTop: 18 }}>
              <Text style={styles.subheading}>Recomendações</Text>
              <Text style={styles.paragraph}>
                Priorizar o tratamento das ocorrências críticas e altas ainda abertas antes da homologação final.
              </Text>
            </View>
          ) : null}
          <Footer generatedAt={generatedAt} />
        </Page>
      ) : null}
    </Document>
  );
}

function Header({ project, cycle }: { project: string; cycle: string }) {
  return (
    <View style={styles.header} fixed>
      <Text>{project}</Text>
      <Text>{cycle}</Text>
    </View>
  );
}

function Footer({ generatedAt }: { generatedAt: Date }) {
  return (
    <View style={styles.footer} fixed>
      <Text>QA Report Generator · {formatDate(generatedAt)}</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.card}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

function Bar({ label, value, total }: { label: string; value: number; total: number }) {
  const width = total === 0 ? 0 : Math.max(4, Math.round((value / total) * 100));
  return (
    <View style={{ marginBottom: 6 }}>
      <Text style={{ marginBottom: 3 }}>
        {label}: {value}
      </Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${width}%` }]} />
      </View>
    </View>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  if (!value) {
    return null;
  }
  return (
    <View style={{ marginBottom: 6 }}>
      <Text style={styles.subheading}>{label}</Text>
      <Text style={styles.paragraph}>{value}</Text>
    </View>
  );
}
