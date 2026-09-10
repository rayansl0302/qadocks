import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import {
  ISSUE_STATUS_LABEL,
  ISSUE_TYPE_LABEL,
  PRIORITY_LABEL,
  SEVERITY_LABEL,
} from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { isIssueResolved } from '@/lib/issueResolution';
import type { ReportStats } from '@/lib/reportStats';
import type { Evidence, Issue, IssueType, Project, ReportConfig, Severity, TestCycle } from '@/types';

const teal = '#0F3D3E';
const ink = '#1C1917';
const muted = '#6F675D';
const line = '#DDD6C8';
const paper = '#F4F1EA';
const surface = '#FFFcf7';
const accent = '#C45C26';

const severityColor: Record<Severity, string> = {
  critica: '#B42318',
  alta: '#C2410C',
  media: '#A16207',
  baixa: '#3F6212',
};

const typeColor: Record<IssueType, string> = {
  bug: '#9F1239',
  feature: '#155E75',
  melhoria: '#B45309',
  correcao: '#3F6212',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 64,
    paddingBottom: 58,
    paddingHorizontal: 44,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: ink,
    backgroundColor: surface,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 36,
    paddingHorizontal: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: teal,
  },
  headerText: {
    fontSize: 8,
    color: surface,
    letterSpacing: 0.4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 32,
    paddingHorizontal: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: line,
    backgroundColor: paper,
  },
  footerText: {
    fontSize: 8,
    color: muted,
  },
  coverAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 14,
    backgroundColor: teal,
  },
  cover: {
    flex: 1,
    justifyContent: 'space-between',
    paddingLeft: 16,
    paddingTop: 28,
    paddingBottom: 12,
  },
  kicker: {
    fontSize: 9,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: accent,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: teal,
    lineHeight: 1.2,
    marginBottom: 22,
    maxWidth: 420,
  },
  metaGrid: {
    borderWidth: 1,
    borderColor: line,
    borderRadius: 8,
    padding: 16,
    backgroundColor: paper,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  metaItem: {
    width: '50%',
    paddingRight: 12,
  },
  metaLabel: {
    fontSize: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: muted,
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: ink,
  },
  heading: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: teal,
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: teal,
  },
  subheading: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    color: teal,
  },
  muted: {
    color: muted,
    marginBottom: 4,
  },
  paragraph: {
    lineHeight: 1.5,
    marginBottom: 8,
    fontSize: 10,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 18,
    marginTop: 10,
  },
  card: {
    flex: 1,
    backgroundColor: paper,
    borderWidth: 1,
    borderColor: line,
    borderTopWidth: 3,
    borderTopColor: teal,
    borderRadius: 6,
    padding: 10,
    marginRight: 8,
  },
  cardLast: {
    marginRight: 0,
  },
  cardLabel: {
    fontSize: 8,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: muted,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: teal,
  },
  chartBlock: {
    marginBottom: 14,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  chartLabel: {
    width: 78,
    fontSize: 9,
  },
  barTrack: {
    flex: 1,
    height: 7,
    backgroundColor: paper,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: 7,
    backgroundColor: teal,
    borderRadius: 4,
  },
  chartCount: {
    width: 22,
    textAlign: 'right',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: teal,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
    marginTop: 8,
  },
  infoCell: {
    width: '50%',
    marginBottom: 10,
    paddingRight: 10,
  },
  issueBox: {
    borderWidth: 1,
    borderColor: line,
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  issueAccent: {
    width: 6,
  },
  issueBody: {
    flex: 1,
    padding: 12,
  },
  issueTop: {
    flexDirection: 'row',
  },
  issueCode: {
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: accent,
    marginBottom: 3,
  },
  issueTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: ink,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  badge: {
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: paper,
    color: ink,
    marginRight: 5,
    marginBottom: 4,
  },
  field: {
    marginBottom: 7,
  },
  fieldLabel: {
    fontSize: 8,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: muted,
    marginBottom: 2,
  },
  fieldValue: {
    lineHeight: 1.45,
    fontSize: 10,
  },
  evidenceBlock: {
    marginBottom: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: line,
    borderRadius: 8,
    backgroundColor: paper,
  },
  evidenceImage: {
    width: '100%',
    maxHeight: 280,
    marginBottom: 6,
    objectFit: 'contain',
  },
  caption: {
    fontSize: 9,
    color: muted,
    fontFamily: 'Helvetica-Oblique',
  },
  problemRow: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: line,
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
  groupByResolution?: boolean;
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
  groupByResolution = false,
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
    <Document title={config.title} author={qaOwner}>
      {showCover ? (
        <Page size="A4" style={styles.page}>
          <View style={styles.coverAccent} />
          <Header project={project.name} cycle={cycle.name} />
          <View style={styles.cover}>
            <View>
              <Text style={styles.kicker}>Relatório de QA</Text>
              <Text style={styles.title}>{config.title}</Text>
              <View style={styles.metaGrid}>
                <View style={styles.metaRow}>
                  <Meta label="Projeto" value={project.name} />
                  <Meta label="Ciclo" value={cycle.name} />
                </View>
                <View style={styles.metaRow}>
                  <Meta label="Versão" value={cycle.version || project.version || '—'} />
                  <Meta label="Ambiente" value={cycle.environment || project.environment || '—'} />
                </View>
                <View style={[styles.metaRow, { marginBottom: 0 }]}>
                  <Meta label="Período" value={`${formatDate(cycle.startDate)} — ${formatDate(cycle.endDate)}`} />
                  <Meta label="Responsável pelo QA" value={qaOwner || '—'} />
                </View>
              </View>
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
            <Metric label="Bloqueados" value={stats.blocked} last />
          </View>
          {showCharts ? (
            <View>
              <View style={styles.chartBlock}>
                <Text style={styles.subheading}>Ocorrências por tipo</Text>
                <Bar label="Bugs" value={stats.byType.bug} total={stats.total} color="#B42318" />
                <Bar label="Features" value={stats.byType.feature} total={stats.total} color="#1A5556" />
                <Bar label="Melhorias" value={stats.byType.melhoria} total={stats.total} color="#A16207" />
                <Bar label="Correções" value={stats.byType.correcao} total={stats.total} color="#3F6212" />
              </View>
              <View style={styles.chartBlock}>
                <Text style={styles.subheading}>Ocorrências por severidade</Text>
                <Bar label="Crítica" value={stats.bySeverity.critica} total={stats.total} color="#B42318" />
                <Bar label="Alta" value={stats.bySeverity.alta} total={stats.total} color="#C2410C" />
                <Bar label="Média" value={stats.bySeverity.media} total={stats.total} color="#A16207" />
                <Bar label="Baixa" value={stats.bySeverity.baixa} total={stats.total} color="#3F6212" />
              </View>
            </View>
          ) : null}
          {config.template === 'executivo' ? (
            <View>
              <Text style={styles.subheading}>Principais problemas</Text>
              {mainProblems.length === 0 ? (
                <Text style={styles.paragraph}>Não há ocorrências de severidade alta ou crítica.</Text>
              ) : (
                mainProblems.map((issue) => (
                  <View key={issue.id} style={styles.problemRow}>
                    <Text style={{ width: 70, fontFamily: 'Helvetica-Bold', color: severityColor[issue.severity] }}>
                      {issue.code}
                    </Text>
                    <Text style={{ width: 70, color: severityColor[issue.severity] }}>{SEVERITY_LABEL[issue.severity]}</Text>
                    <Text style={{ flex: 1 }}>{issue.title}</Text>
                  </View>
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
          <View style={styles.infoGrid}>
            <InfoCell label="Sistema" value={project.name} />
            <InfoCell label="Versão" value={cycle.version || project.version || '—'} />
            <InfoCell label="Ambiente" value={cycle.environment || project.environment || '—'} />
            <InfoCell label="Cliente" value={project.client || '—'} />
          </View>
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
          {groupByResolution ? (
            <View>
              <Text style={styles.subheading}>Resolvidas</Text>
              {issues.filter((issue) => isIssueResolved(issue.status)).length === 0 ? (
                <Text style={styles.paragraph}>Nenhuma ocorrência resolvida.</Text>
              ) : (
                issues
                  .filter((issue) => isIssueResolved(issue.status))
                  .map((issue) => (
                    <ReportIssueBlock
                      key={issue.id}
                      issue={issue}
                      showEvidences={showEvidences}
                      evidences={evidencesByIssue.get(issue.id) ?? []}
                    />
                  ))
              )}
              <Text style={styles.subheading}>Pendentes</Text>
              {issues.filter((issue) => !isIssueResolved(issue.status)).length === 0 ? (
                <Text style={styles.paragraph}>Nenhuma ocorrência pendente.</Text>
              ) : (
                issues
                  .filter((issue) => !isIssueResolved(issue.status))
                  .map((issue) => (
                    <ReportIssueBlock
                      key={issue.id}
                      issue={issue}
                      showEvidences={showEvidences}
                      evidences={evidencesByIssue.get(issue.id) ?? []}
                    />
                  ))
              )}
            </View>
          ) : (
            issues.map((issue) => (
              <ReportIssueBlock
                key={issue.id}
                issue={issue}
                showEvidences={showEvidences}
                evidences={evidencesByIssue.get(issue.id) ?? []}
              />
            ))
          )}
          <Footer generatedAt={generatedAt} />
        </Page>
      ) : null}

      {showEvidences ? (
        <Page size="A4" style={styles.page}>
          <Header project={project.name} cycle={cycle.name} />
          <Text style={styles.heading}>{showFull ? '5. Evidências' : 'Evidências'}</Text>
          {issues.map((issue) => {
            const items = (evidencesByIssue.get(issue.id) ?? []).filter((item) => item.dataUrl);
            if (items.length === 0) {
              return null;
            }
            return (
              <View key={issue.id}>
                {items.map((evidence, index) => (
                  <View key={evidence.id} style={styles.evidenceBlock} wrap={false} minPresenceAhead={160}>
                    <Text style={styles.issueCode}>
                      {issue.code} · Evidência {String(index + 1).padStart(2, '0')}
                    </Text>
                    <Text style={styles.issueTitle}>{issue.title}</Text>
                    <Image src={evidence.dataUrl} style={styles.evidenceImage} />
                    <Text style={styles.caption}>{evidence.caption || evidence.fileName}</Text>
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
      <Text style={styles.headerText}>{project}</Text>
      <Text style={styles.headerText}>{cycle}</Text>
    </View>
  );
}

function Footer({ generatedAt }: { generatedAt: Date }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>QA Report Generator · {formatDate(generatedAt)}</Text>
      <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
    </View>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoCell}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function Metric({ label, value, last = false }: { label: string; value: number; last?: boolean }) {
  return (
    <View style={[styles.card, last ? styles.cardLast : {}]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

function Bar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const width = total === 0 ? 0 : Math.max(6, Math.round((value / total) * 100));
  return (
    <View style={styles.chartRow}>
      <Text style={styles.chartLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${width}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.chartCount}>{value}</Text>
    </View>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  if (!value) {
    return null;
  }
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function ReportIssueBlock({
  issue,
  showEvidences,
  evidences,
}: {
  issue: Issue;
  showEvidences: boolean;
  evidences: Array<Evidence & { dataUrl?: string }>;
}) {
  const issueEvidences = showEvidences ? evidences.filter((item) => item.dataUrl) : [];
  return (
    <View style={styles.issueBox} wrap minPresenceAhead={80}>
      <View style={styles.issueTop}>
        <View style={[styles.issueAccent, { backgroundColor: severityColor[issue.severity] }]} />
        <View style={styles.issueBody}>
          <Text style={styles.issueCode}>{issue.code}</Text>
          <Text style={styles.issueTitle}>{issue.title}</Text>
          <View style={styles.badgeRow}>
            <Text style={[styles.badge, { color: surface, backgroundColor: severityColor[issue.severity] }]}>
              {SEVERITY_LABEL[issue.severity]}
            </Text>
            <Text style={[styles.badge, { color: surface, backgroundColor: typeColor[issue.type] }]}>
              {ISSUE_TYPE_LABEL[issue.type]}
            </Text>
            <Text style={styles.badge}>{ISSUE_STATUS_LABEL[issue.status]}</Text>
            <Text style={styles.badge}>{PRIORITY_LABEL[issue.priority]}</Text>
          </View>
          <Field label="Descrição" value={issue.description} />
          {issue.type === 'bug' ? (
            <View>
              <Field
                label="Ambiente"
                value={`Ambiente: ${issue.environment || '—'}  ·  Versão: ${issue.version || '—'}  ·  Navegador: ${issue.browser || '—'}  ·  SO: ${issue.operatingSystem || '—'}`}
              />
              <Field
                label="Passos para reprodução"
                value={issue.reproductionSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}
              />
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
          {issueEvidences[0]?.dataUrl ? (
            <View wrap={false} minPresenceAhead={160}>
              <Text style={styles.fieldLabel}>Evidência</Text>
              <Image src={issueEvidences[0].dataUrl} style={styles.evidenceImage} />
              <Text style={styles.caption}>{issueEvidences[0].caption || issueEvidences[0].fileName}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
