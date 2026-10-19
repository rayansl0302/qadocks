import { Circle, Document, Image, Line, Page, Polyline, StyleSheet, Svg, Text, View } from '@react-pdf/renderer';
import { SEVERITY_LABEL } from '@/lib/constants';
import { buildCycleNarrative, type CycleSummary, type FinalReportData, type FinalReportTexts } from '@/lib/finalReport';
import { formatDate } from '@/lib/format';
import type { Project, Severity } from '@/types';

const teal = '#0F3D3E';
const ink = '#1C1917';
const muted = '#6F675D';
const line = '#DDD6C8';
const paper = '#F4F1EA';
const surface = '#FFFcf7';
const accent = '#C45C26';
const green = '#3F6212';
const red = '#B42318';

const severityColor: Record<Severity, string> = {
  critica: '#B42318',
  alta: '#C2410C',
  media: '#A16207',
  baixa: '#3F6212',
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
  headerText: { fontSize: 8, color: surface, letterSpacing: 0.4 },
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
  footerText: { fontSize: 8, color: muted },
  coverAccent: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 14, backgroundColor: teal },
  cover: { flex: 1, justifyContent: 'space-between', paddingLeft: 16, paddingTop: 28, paddingBottom: 12 },
  kicker: { fontSize: 9, letterSpacing: 2.4, textTransform: 'uppercase', color: accent, marginBottom: 8 },
  title: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: teal,
    lineHeight: 1.2,
    marginBottom: 22,
    maxWidth: 420,
  },
  metaGrid: { borderWidth: 1, borderColor: line, borderRadius: 8, padding: 16, backgroundColor: paper },
  metaRow: { flexDirection: 'row', marginBottom: 10 },
  metaItem: { width: '50%', paddingRight: 12 },
  metaLabel: { fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: muted, marginBottom: 3 },
  metaValue: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: ink },
  heading: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: teal,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: teal,
  },
  subheading: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 6, color: teal },
  muted: { color: muted, marginBottom: 4 },
  paragraph: { lineHeight: 1.5, marginBottom: 8, fontSize: 10 },
  cardRow: { flexDirection: 'row', marginBottom: 16, marginTop: 4 },
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
  cardLast: { marginRight: 0 },
  cardLabel: { fontSize: 8, letterSpacing: 0.6, textTransform: 'uppercase', color: muted, marginBottom: 4 },
  cardValue: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: teal },
  block: { marginBottom: 16 },
  split: { flexDirection: 'row', marginBottom: 16 },
  splitCol: { flex: 1 },
  chartRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  chartLabel: { width: 78, fontSize: 9 },
  barTrack: { flex: 1, height: 7, backgroundColor: paper, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 7, borderRadius: 4 },
  chartCount: { width: 22, textAlign: 'right', fontSize: 9, fontFamily: 'Helvetica-Bold', color: teal },
  stackTrack: { flex: 1, height: 12, flexDirection: 'row', backgroundColor: paper, borderRadius: 3, overflow: 'hidden' },
  legend: { flexDirection: 'row', marginBottom: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 14 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  legendText: { fontSize: 8, color: muted },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: teal,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 3,
  },
  tableHeadText: { fontSize: 8, color: surface, fontFamily: 'Helvetica-Bold' },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: line,
  },
  tableText: { fontSize: 9 },
  issueCodeLike: { fontSize: 8, letterSpacing: 1.2, textTransform: 'uppercase', color: accent, marginBottom: 3 },
  signature: { borderTopWidth: 1, borderTopColor: ink, paddingTop: 4 },
});

interface FinalReportDocumentProps {
  project: Project;
  data: FinalReportData;
  texts: FinalReportTexts;
  title: string;
  generatedAt: Date;
  qaOwner: string;
  includePendingList: boolean;
  showCycleDescriptions: boolean;
  /** PNG (data URL) da assinatura do QA; omitida quando vazia. */
  signature?: string;
}

export function FinalReportDocument({
  project,
  data,
  texts,
  title,
  generatedAt,
  qaOwner,
  includePendingList,
  showCycleDescriptions,
  signature,
}: FinalReportDocumentProps) {
  const hasPendingPage = includePendingList && data.pendingIssues.length > 0;
  const period =
    data.startDate || data.endDate ? `${formatDate(data.startDate)} — ${formatDate(data.endDate)}` : '—';

  return (
    <Document title={title} author={qaOwner}>
      <Page size="A4" style={styles.page}>
        <View style={styles.coverAccent} />
        <Header project={project.name} />
        <View style={styles.cover}>
          <View>
            <Text style={styles.kicker}>Considerações finais de QA</Text>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.metaGrid}>
              <View style={styles.metaRow}>
                <Meta label="Projeto" value={project.name} />
                {project.client ? (
                  <Meta label="Cliente" value={project.client} />
                ) : (
                  <Meta label="Ciclos de teste" value={String(data.cycles.length)} />
                )}
              </View>
              {project.version || project.environment ? (
                <View style={styles.metaRow}>
                  <Meta label="Versão" value={project.version || '—'} />
                  <Meta label="Ambiente" value={project.environment || '—'} />
                </View>
              ) : null}
              <View style={[styles.metaRow, { marginBottom: 0 }]}>
                <Meta label="Período dos testes" value={period} />
                <Meta label="Responsável pelo QA" value={qaOwner || '—'} />
              </View>
            </View>
          </View>
          <Text style={styles.muted}>Emitido em {formatDate(generatedAt)}</Text>
        </View>
        <Footer generatedAt={generatedAt} />
      </Page>

      <Page size="A4" style={styles.page}>
        <Header project={project.name} />
        <Text style={styles.heading}>1. Visão geral</Text>
        <View style={styles.cardRow}>
          <Metric label="Ciclos" value={String(data.cycles.length)} />
          <Metric label="Ocorrências" value={String(data.allIssues.length)} />
          <Metric label="Resolvidas" value={String(data.resolved)} />
          <Metric label="Pendentes" value={String(data.pending)} last />
        </View>
        <Text style={styles.paragraph}>{texts.summary}</Text>

        <View style={styles.split}>
          <View style={[styles.splitCol, { alignItems: 'center', justifyContent: 'center' }]}>
            <Donut percent={data.resolutionRate} />
            <Text style={[styles.muted, { marginTop: 6 }]}>Taxa de resolução geral</Text>
          </View>
          <View style={[styles.splitCol, { paddingLeft: 12 }]}>
            <Text style={styles.subheading}>Por tipo</Text>
            <Bar label="Bugs" value={data.stats.byType.bug} total={data.stats.total} color="#B42318" />
            <Bar label="Features" value={data.stats.byType.feature} total={data.stats.total} color="#1A5556" />
            <Bar label="Melhorias" value={data.stats.byType.melhoria} total={data.stats.total} color="#A16207" />
            <Bar label="Correções" value={data.stats.byType.correcao} total={data.stats.total} color={green} />
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.subheading}>Por severidade</Text>
          {(['critica', 'alta', 'media', 'baixa'] as Severity[]).map((severity) => (
            <Bar
              key={severity}
              label={SEVERITY_LABEL[severity]}
              value={data.stats.bySeverity[severity]}
              total={data.stats.total}
              color={severityColor[severity]}
            />
          ))}
        </View>
        <Footer generatedAt={generatedAt} />
      </Page>

      <Page size="A4" style={styles.page}>
        <Header project={project.name} />
        <Text style={styles.heading}>2. Evolução ao longo dos ciclos</Text>
        {texts.evolution ? <Text style={styles.paragraph}>{texts.evolution}</Text> : null}

        <View style={styles.block}>
          <Text style={styles.subheading}>Resolvidas x pendentes por ciclo</Text>
          <View style={styles.legend}>
            <LegendItem color={green} label="Resolvidas" />
            <LegendItem color={red} label="Pendentes" />
          </View>
          {data.cycles.map((item) => (
            <StackedBar key={item.cycle.id} item={item} max={Math.max(...data.cycles.map((c) => c.issues.length), 1)} />
          ))}
        </View>

        {data.cycles.length >= 2 ? (
          <View style={styles.block} wrap={false}>
            <Text style={styles.subheading}>Ocorrências encontradas por ciclo</Text>
            <View style={styles.legend}>
              <LegendItem color={teal} label="Total" />
              <LegendItem color={accent} label="Severidade crítica ou alta" />
            </View>
            <LineChart cycles={data.cycles} />
          </View>
        ) : null}

        <View style={styles.block} wrap={false}>
          <Text style={styles.subheading}>Resumo por ciclo</Text>
          <View style={styles.tableHead}>
            <Text style={[styles.tableHeadText, { flex: 3 }]}>Ciclo</Text>
            <Text style={[styles.tableHeadText, { flex: 2 }]}>Período</Text>
            <Text style={[styles.tableHeadText, { width: 40, textAlign: 'right' }]}>Total</Text>
            <Text style={[styles.tableHeadText, { width: 48, textAlign: 'right' }]}>Resolv.</Text>
            <Text style={[styles.tableHeadText, { width: 48, textAlign: 'right' }]}>Pend.</Text>
            <Text style={[styles.tableHeadText, { width: 40, textAlign: 'right' }]}>Taxa</Text>
          </View>
          {data.cycles.map((item) => (
            <View key={item.cycle.id} style={styles.tableRow}>
              <Text style={[styles.tableText, { flex: 3 }]}>{item.cycle.name}</Text>
              <Text style={[styles.tableText, { flex: 2 }]}>
                {formatDate(item.cycle.startDate)} — {formatDate(item.cycle.endDate)}
              </Text>
              <Text style={[styles.tableText, { width: 40, textAlign: 'right' }]}>{item.issues.length}</Text>
              <Text style={[styles.tableText, { width: 48, textAlign: 'right' }]}>{item.resolved}</Text>
              <Text style={[styles.tableText, { width: 48, textAlign: 'right' }]}>{item.pending}</Text>
              <Text style={[styles.tableText, { width: 40, textAlign: 'right' }]}>{item.resolutionRate}%</Text>
            </View>
          ))}
        </View>
        <Footer generatedAt={generatedAt} />
      </Page>

      <Page size="A4" style={styles.page}>
        <Header project={project.name} />
        <Text style={styles.heading}>3. Ciclo a ciclo</Text>
        {data.cycles.map((item, index) => (
          <CycleBlock
            key={item.cycle.id}
            item={item}
            index={index}
            previous={data.cycles[index - 1]}
            showDescription={showCycleDescriptions}
          />
        ))}
        <Footer generatedAt={generatedAt} />
      </Page>

      {hasPendingPage ? (
        <Page size="A4" style={styles.page}>
          <Header project={project.name} />
          <Text style={styles.heading}>4. Pendências remanescentes</Text>
          <View style={styles.tableHead}>
            <Text style={[styles.tableHeadText, { width: 62 }]}>Código</Text>
            <Text style={[styles.tableHeadText, { flex: 1 }]}>Título</Text>
            <Text style={[styles.tableHeadText, { width: 56 }]}>Severidade</Text>
          </View>
          {data.pendingIssues.map((issue) => (
            <View key={issue.id} style={styles.tableRow} wrap={false}>
              <Text style={[styles.tableText, { width: 62, fontFamily: 'Helvetica-Bold' }]}>{issue.code}</Text>
              <Text style={[styles.tableText, { flex: 1 }]}>{issue.title}</Text>
              <Text style={[styles.tableText, { width: 56, color: severityColor[issue.severity] }]}>
                {SEVERITY_LABEL[issue.severity]}
              </Text>
            </View>
          ))}
          <Footer generatedAt={generatedAt} />
        </Page>
      ) : null}

      <Page size="A4" style={styles.page}>
        <Header project={project.name} />
        <Text style={styles.heading}>{hasPendingPage ? '5. Considerações finais' : '4. Considerações finais'}</Text>
        <Text style={styles.paragraph}>{texts.considerations}</Text>
        {texts.recommendations ? (
          <View style={{ marginTop: 14 }}>
            <Text style={styles.subheading}>Recomendações</Text>
            <Text style={styles.paragraph}>{texts.recommendations}</Text>
          </View>
        ) : null}
        <View style={{ marginTop: 24, width: 220 }} wrap={false}>
          {signature ? (
            <Image src={signature} style={{ height: 56, objectFit: 'contain', objectPosition: 'left', marginBottom: 2 }} />
          ) : (
            <View style={{ height: 40 }} />
          )}
          <View style={styles.signature}>
            <Text style={styles.metaValue}>{qaOwner || '—'}</Text>
            <Text style={styles.muted}>Responsável pelo QA · {formatDate(generatedAt)}</Text>
          </View>
        </View>
        <Footer generatedAt={generatedAt} />
      </Page>
    </Document>
  );
}

function Header({ project }: { project: string }) {
  return (
    <View style={styles.header} fixed>
      <Text style={styles.headerText}>{project}</Text>
      <Text style={styles.headerText}>Considerações finais</Text>
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

function Metric({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.card, last ? styles.cardLast : {}]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

function Bar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const width = total === 0 || value === 0 ? 0 : Math.max(6, Math.round((value / total) * 100));
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

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function StackedBar({ item, max }: { item: CycleSummary; max: number }) {
  const scale = (item.issues.length / max) * 100;
  const resolvedWidth = item.issues.length === 0 ? 0 : (item.resolved / item.issues.length) * scale;
  const pendingWidth = item.issues.length === 0 ? 0 : (item.pending / item.issues.length) * scale;
  return (
    <View style={styles.chartRow}>
      <Text style={[styles.chartLabel, { width: 110 }]}>{item.cycle.name}</Text>
      <View style={styles.stackTrack}>
        <View style={{ width: `${resolvedWidth}%`, backgroundColor: green }} />
        <View style={{ width: `${pendingWidth}%`, backgroundColor: red }} />
      </View>
      <Text style={styles.chartCount}>{item.issues.length}</Text>
    </View>
  );
}

function CycleBlock({
  item,
  index,
  previous,
  showDescription,
}: {
  item: CycleSummary;
  index: number;
  previous?: CycleSummary;
  showDescription: boolean;
}) {
  const { cycle, stats } = item;
  const details = [
    cycle.version ? `Versão ${cycle.version}` : '',
    cycle.environment,
    `${formatDate(cycle.startDate)} — ${formatDate(cycle.endDate)}`,
  ]
    .filter(Boolean)
    .join('  ·  ');
  return (
    <View
      wrap={false}
      style={{ borderWidth: 1, borderColor: line, borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: paper }}
    >
      <Text style={styles.issueCodeLike}>Ciclo {String(index + 1).padStart(2, '0')}</Text>
      <Text style={{ fontSize: 13, fontFamily: 'Helvetica-Bold', color: teal, marginBottom: 2 }}>{cycle.name}</Text>
      <Text style={[styles.muted, { marginBottom: 6 }]}>{details}</Text>
      {showDescription && cycle.description ? <Text style={styles.paragraph}>{cycle.description}</Text> : null}
      <Text style={styles.paragraph}>{buildCycleNarrative(item, previous)}</Text>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          {(['critica', 'alta', 'media', 'baixa'] as Severity[]).map((severity) => (
            <Bar
              key={severity}
              label={SEVERITY_LABEL[severity]}
              value={stats.bySeverity[severity]}
              total={stats.total}
              color={severityColor[severity]}
            />
          ))}
        </View>
        <View style={{ width: 150 }}>
          <Text style={styles.subheading}>Resolução: {item.resolutionRate}%</Text>
          <View style={styles.stackTrack}>
            <View style={{ width: `${item.resolutionRate}%`, backgroundColor: green }} />
            <View style={{ width: `${100 - item.resolutionRate}%`, backgroundColor: red }} />
          </View>
          <Text style={[styles.legendText, { marginTop: 4 }]}>
            {item.resolved} resolvidas · {item.pending} pendentes
          </Text>
        </View>
      </View>
    </View>
  );
}

function Donut({ percent }: { percent: number }) {
  const size = 110;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.min(Math.max(percent, 0), 100) / 100) * circumference;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={paper} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={green}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${filled} ${circumference}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: 'absolute', top: 0, left: 0, width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 20, fontFamily: 'Helvetica-Bold', color: teal }}>{percent}%</Text>
      </View>
    </View>
  );
}

function LineChart({ cycles }: { cycles: CycleSummary[] }) {
  const width = 500;
  const height = 150;
  const padLeft = 24;
  const padRight = 12;
  const padTop = 12;
  const padBottom = 14;
  const maxValue = Math.max(...cycles.map((item) => item.issues.length), 1);
  const stepX = (width - padLeft - padRight) / (cycles.length - 1);
  const x = (index: number) => padLeft + index * stepX;
  const y = (value: number) => padTop + (1 - value / maxValue) * (height - padTop - padBottom);
  const totalPoints = cycles.map((item, index) => `${x(index)},${y(item.issues.length)}`).join(' ');
  const highPoints = cycles.map((item, index) => `${x(index)},${y(item.highSeverity)}`).join(' ');

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Line x1={padLeft} y1={y(0)} x2={width - padRight} y2={y(0)} stroke={line} strokeWidth={1} />
        <Line x1={padLeft} y1={padTop} x2={width - padRight} y2={padTop} stroke={line} strokeWidth={0.5} />
        <Polyline points={totalPoints} stroke={teal} strokeWidth={2} fill="none" />
        <Polyline points={highPoints} stroke={accent} strokeWidth={2} fill="none" />
        {cycles.map((item, index) => (
          <Circle key={`t${item.cycle.id}`} cx={x(index)} cy={y(item.issues.length)} r={3} fill={teal} />
        ))}
        {cycles.map((item, index) => (
          <Circle key={`h${item.cycle.id}`} cx={x(index)} cy={y(item.highSeverity)} r={3} fill={accent} />
        ))}
      </Svg>
      <View style={{ flexDirection: 'row', paddingLeft: padLeft, paddingRight: padRight, justifyContent: 'space-between' }}>
        {cycles.map((item) => (
          <Text key={item.cycle.id} style={{ fontSize: 8, color: muted }}>
            {item.cycle.name} ({item.issues.length}/{item.highSeverity})
          </Text>
        ))}
      </View>
    </View>
  );
}
