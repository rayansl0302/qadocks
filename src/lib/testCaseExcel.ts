import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { slugify } from '@/lib/format';
import type { TestCase, TestScenarioType, TestStep } from '@/types';

const HEADERS = ['Cenário / passo', 'Dados', 'Resultado esperado', 'Resultado obtido', 'Comentário'];

const SECTION_TITLE: Record<TestScenarioType, string> = {
  happy_path: 'Caminho feliz  ·  quando o fluxo acontece da forma correta',
  negative: 'Testes negativos  ·  quando o fluxo não acontece da forma correta',
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sheetName(name: string, index: number): string {
  const cleaned = name.replace(/[:\\/?*[\]]/g, '-').trim().slice(0, 28);
  return cleaned || `Caso ${index + 1}`;
}

function cell(value: string, style: string): string {
  return `<Cell ss:StyleID="${style}"><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`;
}

function emptyCell(style: string): string {
  return `<Cell ss:StyleID="${style}"/>`;
}

function mergedRow(style: string, value: string, height: number): string {
  return `<Row ss:AutoFitHeight="1" ss:Height="${height}"><Cell ss:MergeAcross="4" ss:StyleID="${style}"><Data ss:Type="String">${escapeXml(value)}</Data></Cell></Row>`;
}

function dataRow(styles: [string, string, string, string, string], values: [string, string, string, string, string], height = 42): string {
  return `<Row ss:AutoFitHeight="1" ss:Height="${height}">${values
    .map((value, index) => (value ? cell(value, styles[index]) : emptyCell(styles[index])))
    .join('')}</Row>`;
}

function writeSteps(steps: TestStep[], startIndex: number): { xml: string; nextIndex: number } {
  const xml = steps
    .map((step, offset) => {
      const even = (startIndex + offset) % 2 === 1;
      const base = even ? 'BodyEven' : 'BodyOdd';
      const resultStyle = step.result.trim() ? `${base}Result` : `${base}Empty`;
      return dataRow(
        [base, base, base, resultStyle, base],
        [step.action, step.data, step.expected, step.result, step.comment],
      );
    })
    .join('');
  return { xml, nextIndex: startIndex + steps.length };
}

function writeWorksheet(testCase: TestCase, index: number): string {
  const rows: string[] = [];
  const scenarioCount = testCase.scenarios.length;
  const stepCount =
    testCase.setupSteps.length + testCase.scenarios.reduce((total, scenario) => total + scenario.steps.length, 0);
  const generatedAt = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  rows.push(mergedRow('Brand', 'QA DOCS    ·    PLANO DE TESTES', 28));
  rows.push(mergedRow('Title', testCase.name, 44));
  if (testCase.description.trim()) {
    rows.push(mergedRow('Subtitle', testCase.description, 32));
  }
  rows.push(
    mergedRow(
      'Meta',
      `Gerado em ${generatedAt}    ·    ${scenarioCount} cenário${scenarioCount === 1 ? '' : 's'}    ·    ${stepCount} passo${stepCount === 1 ? '' : 's'}`,
      26,
    ),
  );
  rows.push(mergedRow('Spacer', '', 14));
  rows.push(`<Row ss:Height="34">${HEADERS.map((header) => cell(header, 'Header')).join('')}</Row>`);

  let bodyIndex = 0;
  if (testCase.setupSteps.length > 0) {
    rows.push(mergedRow('SectionSetup', 'Preparação  ·  passos iniciais antes da execução', 32));
    const setup = writeSteps(testCase.setupSteps, bodyIndex);
    rows.push(setup.xml);
    bodyIndex = setup.nextIndex;
  }

  let lastType: TestScenarioType | null = null;
  for (const scenario of testCase.scenarios) {
    if (scenario.type !== lastType) {
      rows.push(
        mergedRow(scenario.type === 'negative' ? 'SectionNegative' : 'SectionHappy', SECTION_TITLE[scenario.type], 32),
      );
      lastType = scenario.type;
    }
    if (scenario.title.trim()) {
      rows.push(
        dataRow(
          ['Scenario', 'Scenario', 'ScenarioExpected', 'Scenario', 'Scenario'],
          [scenario.title, '', scenario.expected, '', ''],
          40,
        ),
      );
    }
    const steps = writeSteps(scenario.steps, bodyIndex);
    rows.push(steps.xml);
    bodyIndex = steps.nextIndex;
  }

  const frozenRows = testCase.description.trim() ? 6 : 5;

  return `<Worksheet ss:Name="${escapeXml(sheetName(testCase.name, index))}">
    <Table ss:ExpandedColumnCount="5" ss:DefaultRowHeight="36">
      <Column ss:Width="260"/>
      <Column ss:Width="150"/>
      <Column ss:Width="230"/>
      <Column ss:Width="150"/>
      <Column ss:Width="170"/>
      ${rows.join('')}
    </Table>
    <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
      <PageSetup>
        <Layout x:Orientation="Landscape" x:CenterHorizontal="1"/>
        <Header x:Margin="0.28"/>
        <Footer x:Margin="0.28"/>
        <PageMargins x:Bottom="0.4" x:Left="0.4" x:Right="0.4" x:Top="0.4"/>
      </PageSetup>
      <FitToPage/>
      <Print>
        <ValidPrinterInfo/>
        <PaperSizeIndex>9</PaperSizeIndex>
        <FitWidth>1</FitWidth>
        <FitHeight>0</FitHeight>
      </Print>
      <FreezePanes/>
      <FrozenNoSplit/>
      <SplitHorizontal>${frozenRows}</SplitHorizontal>
      <TopRowBottomPane>${frozenRows}</TopRowBottomPane>
      <TabColorIndex>${index % 2 === 0 ? 50 : 44}</TabColorIndex>
    </WorksheetOptions>
  </Worksheet>`;
}

function borderBlock(): string {
  return `<Borders>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D6DDD9"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D6DDD9"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D6DDD9"/>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D6DDD9"/>
      </Borders>`;
}

function buildWorkbookXml(testCases: TestCase[]): string {
  const title = testCases.length === 1 ? testCases[0].name : 'Plano de testes';
  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Title>${escapeXml(title)}</Title>
    <Author>QA Report Generator</Author>
    <Description>Plano de casos e cenários de teste</Description>
  </DocumentProperties>
  <Styles>
    <Style ss:ID="Brand">
      <Alignment ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#E7F3EF" ss:Bold="1"/>
      <Interior ss:Color="#0F3D38" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Title">
      <Alignment ss:Vertical="Center" ss:WrapText="1"/>
      <Font ss:FontName="Calibri" ss:Size="20" ss:Color="#10241F" ss:Bold="1"/>
      <Interior ss:Color="#F3F7F5" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Subtitle">
      <Alignment ss:Vertical="Center" ss:WrapText="1"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#5C6F6A"/>
      <Interior ss:Color="#F3F7F5" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Meta">
      <Alignment ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="9" ss:Color="#7A8B86"/>
      <Interior ss:Color="#F3F7F5" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Spacer">
      <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Header">
      <Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Left"/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#F7FBFA" ss:Bold="1"/>
      <Interior ss:Color="#14665C" ss:Pattern="Solid"/>
      ${borderBlock()}
    </Style>
    <Style ss:ID="SectionSetup">
      <Alignment ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#334155" ss:Bold="1"/>
      <Interior ss:Color="#E8EEF4" ss:Pattern="Solid"/>
      ${borderBlock()}
    </Style>
    <Style ss:ID="SectionHappy">
      <Alignment ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#14532D" ss:Bold="1"/>
      <Interior ss:Color="#D8F3E3" ss:Pattern="Solid"/>
      ${borderBlock()}
    </Style>
    <Style ss:ID="SectionNegative">
      <Alignment ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#7A4B12" ss:Bold="1"/>
      <Interior ss:Color="#F8E6C8" ss:Pattern="Solid"/>
      ${borderBlock()}
    </Style>
    <Style ss:ID="Scenario">
      <Alignment ss:WrapText="1" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#134E4A" ss:Bold="1"/>
      <Interior ss:Color="#E7F2EF" ss:Pattern="Solid"/>
      ${borderBlock()}
    </Style>
    <Style ss:ID="ScenarioExpected">
      <Alignment ss:WrapText="1" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#3F5B56"/>
      <Interior ss:Color="#E7F2EF" ss:Pattern="Solid"/>
      ${borderBlock()}
    </Style>
    <Style ss:ID="BodyOdd">
      <Alignment ss:WrapText="1" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1F2933"/>
      <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
      ${borderBlock()}
    </Style>
    <Style ss:ID="BodyEven">
      <Alignment ss:WrapText="1" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1F2933"/>
      <Interior ss:Color="#F6FAF8" ss:Pattern="Solid"/>
      ${borderBlock()}
    </Style>
    <Style ss:ID="BodyOddResult">
      <Alignment ss:WrapText="1" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1F2933"/>
      <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
      ${borderBlock()}
    </Style>
    <Style ss:ID="BodyEvenResult">
      <Alignment ss:WrapText="1" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1F2933"/>
      <Interior ss:Color="#F6FAF8" ss:Pattern="Solid"/>
      ${borderBlock()}
    </Style>
    <Style ss:ID="BodyOddEmpty">
      <Alignment ss:WrapText="1" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#94A3B8"/>
      <Interior ss:Color="#FBF8F1" ss:Pattern="Solid"/>
      ${borderBlock()}
    </Style>
    <Style ss:ID="BodyEvenEmpty">
      <Alignment ss:WrapText="1" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#94A3B8"/>
      <Interior ss:Color="#F7F3EA" ss:Pattern="Solid"/>
      ${borderBlock()}
    </Style>
  </Styles>
  ${testCases.map((item, index) => writeWorksheet(item, index)).join('')}
</Workbook>`;
}

export function buildTestCaseExcelFileName(projectName: string, caseName?: string, date = new Date()): string {
  const project = slugify(projectName) || 'Projeto';
  const extra = caseName ? `_${slugify(caseName) || 'Caso'}` : '';
  return `Casos_${project}${extra}_${format(date, 'yyyy-MM-dd')}.xls`;
}

export function downloadTestCasesExcel(testCases: TestCase[], fileName: string): void {
  if (testCases.length === 0) {
    return;
  }
  const xml = buildWorkbookXml(testCases);
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function countTestCaseSteps(testCase: TestCase): number {
  const scenarioSteps = testCase.scenarios.reduce((total, scenario) => total + scenario.steps.length, 0);
  return testCase.setupSteps.length + scenarioSteps;
}
