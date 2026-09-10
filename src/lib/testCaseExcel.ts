import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ExcelJS from 'exceljs';
import { STEP_FEEDBACK_LABEL } from '@/lib/constants';
import { slugify } from '@/lib/format';
import type { TestCase, TestScenarioType, TestStep } from '@/types';

const HEADERS = ['Cenário / passo', 'Dados', 'Resultado esperado', 'Resultado', 'Resultado obtido', 'Comentário'];

const SECTION_TITLE: Record<TestScenarioType, string> = {
  happy_path: 'Caminho feliz  ·  quando o fluxo acontece da forma correta',
  negative: 'Testes negativos  ·  quando o fluxo não acontece da forma correta',
};

const thin = { style: 'thin' as const, color: { argb: 'FFD6DDD9' } };
const border = { top: thin, left: thin, bottom: thin, right: thin };

function sheetName(name: string, index: number): string {
  const cleaned = name.replace(/[:\\/?*[\]]/g, '-').trim().slice(0, 28);
  return cleaned || `Caso ${index + 1}`;
}

function paint(
  cell: ExcelJS.Cell,
  value: string,
  fill: string,
  font: Partial<ExcelJS.Font>,
  extra?: Partial<ExcelJS.Style>,
): void {
  cell.value = value || null;
  cell.alignment = { vertical: 'middle', wrapText: true, ...(extra?.alignment ?? {}) };
  cell.font = { name: 'Calibri', ...font };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
  cell.border = extra?.border ?? border;
}

function mergeRow(sheet: ExcelJS.Worksheet, rowNumber: number, value: string, height: number, fill: string, font: Partial<ExcelJS.Font>): void {
  sheet.mergeCells(rowNumber, 1, rowNumber, 6);
  sheet.getRow(rowNumber).height = height;
  paint(sheet.getCell(rowNumber, 1), value, fill, font, { border: {} });
}

function applyFeedbackValidation(cell: ExcelJS.Cell): void {
  cell.dataValidation = {
    type: 'list',
    allowBlank: true,
    formulae: ['"Passou,Falhou,Bloqueado"'],
    showErrorMessage: true,
    errorStyle: 'warning',
    errorTitle: 'Resultado',
    error: 'Escolha uma opção: Passou, Falhou ou Bloqueado.',
  };
}

function applyFeedbackColors(sheet: ExcelJS.Worksheet, fromRow: number): void {
  sheet.addConditionalFormatting({
    ref: `D${fromRow}:D400`,
    rules: [
      {
        type: 'cellIs',
        operator: 'equal',
        formulae: ['"Passou"'],
        priority: 1,
        style: {
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FF86EFAC' } },
          font: { name: 'Calibri', bold: true, size: 14, color: { argb: 'FF14532D' } },
        },
      },
      {
        type: 'cellIs',
        operator: 'equal',
        formulae: ['"Falhou"'],
        priority: 2,
        style: {
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFCA5A5' } },
          font: { name: 'Calibri', bold: true, size: 14, color: { argb: 'FF7F1D1D' } },
        },
      },
      {
        type: 'cellIs',
        operator: 'equal',
        formulae: ['"Bloqueado"'],
        priority: 3,
        style: {
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFDE68A' } },
          font: { name: 'Calibri', bold: true, size: 14, color: { argb: 'FF78350F' } },
        },
      },
    ],
  });
}

function writeStepRow(sheet: ExcelJS.Worksheet, rowNumber: number, step: TestStep, even: boolean): void {
  const baseFill = even ? 'FFF6FAF8' : 'FFFFFFFF';
  const values = [
    step.action,
    step.data,
    step.expected,
    step.feedback ? STEP_FEEDBACK_LABEL[step.feedback] : '',
    step.result,
    step.comment,
  ];
  const feedbackFill =
    step.feedback === 'passed'
      ? 'FF86EFAC'
      : step.feedback === 'failed'
        ? 'FFFCA5A5'
        : step.feedback === 'blocked'
          ? 'FFFDE68A'
          : even
            ? 'FFF7F3EA'
            : 'FFFBF8F1';
  const feedbackFont =
    step.feedback === 'passed'
      ? { size: 14, color: { argb: 'FF14532D' }, bold: true }
      : step.feedback === 'failed'
        ? { size: 14, color: { argb: 'FF7F1D1D' }, bold: true }
        : step.feedback === 'blocked'
          ? { size: 14, color: { argb: 'FF78350F' }, bold: true }
          : { size: 12, color: { argb: 'FF94A3B8' }, bold: true };
  const resultFill = step.result.trim() ? baseFill : even ? 'FFF7F3EA' : 'FFFBF8F1';

  sheet.getRow(rowNumber).height = 42;
  values.forEach((value, index) => {
    const column = index + 1;
    if (column === 4) {
      paint(sheet.getCell(rowNumber, column), value, feedbackFill, feedbackFont, {
        alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
      });
      applyFeedbackValidation(sheet.getCell(rowNumber, column));
      return;
    }
    paint(
      sheet.getCell(rowNumber, column),
      value,
      column === 5 ? resultFill : baseFill,
      { size: 10, color: { argb: 'FF1F2933' } },
    );
  });
}

function writeCaseSheet(workbook: ExcelJS.Workbook, testCase: TestCase, index: number): void {
  const sheet = workbook.addWorksheet(sheetName(testCase.name, index));
  sheet.columns = [
    { width: 42 },
    { width: 24 },
    { width: 36 },
    { width: 18 },
    { width: 24 },
    { width: 26 },
  ];
  sheet.pageSetup = {
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    paperSize: 9,
  };

  const scenarioCount = testCase.scenarios.length;
  const stepCount =
    testCase.setupSteps.length + testCase.scenarios.reduce((total, scenario) => total + scenario.steps.length, 0);
  const generatedAt = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  let row = 1;
  mergeRow(sheet, row, 'QA DOCS    ·    PLANO DE TESTES', 28, 'FF0F3D38', {
    size: 10,
    bold: true,
    color: { argb: 'FFE7F3EF' },
  });
  row += 1;
  mergeRow(sheet, row, testCase.name, 44, 'FFF3F7F5', { size: 20, bold: true, color: { argb: 'FF10241F' } });
  row += 1;
  if (testCase.description.trim()) {
    mergeRow(sheet, row, testCase.description, 32, 'FFF3F7F5', { size: 11, color: { argb: 'FF5C6F6A' } });
    row += 1;
  }
  mergeRow(
    sheet,
    row,
    `Gerado em ${generatedAt}    ·    ${scenarioCount} cenário${scenarioCount === 1 ? '' : 's'}    ·    ${stepCount} passo${stepCount === 1 ? '' : 's'}`,
    26,
    'FFF3F7F5',
    { size: 9, color: { argb: 'FF7A8B86' } },
  );
  row += 1;
  mergeRow(sheet, row, '', 14, 'FFFFFFFF', { size: 9 });
  row += 1;

  const headerRow = sheet.getRow(row);
  headerRow.height = 34;
  HEADERS.forEach((header, index) => {
    paint(sheet.getCell(row, index + 1), header, 'FF14665C', { size: 10, bold: true, color: { argb: 'FFF7FBFA' } });
  });
  const frozenRows = row;
  row += 1;

  let bodyIndex = 0;
  if (testCase.setupSteps.length > 0) {
    mergeRow(sheet, row, 'Preparação  ·  passos iniciais antes da execução', 32, 'FFE8EEF4', {
      size: 10,
      bold: true,
      color: { argb: 'FF334155' },
    });
    row += 1;
    for (const step of testCase.setupSteps) {
      writeStepRow(sheet, row, step, bodyIndex % 2 === 1);
      bodyIndex += 1;
      row += 1;
    }
  }

  let lastType: TestScenarioType | null = null;
  for (const scenario of testCase.scenarios) {
    if (scenario.type !== lastType) {
      mergeRow(
        sheet,
        row,
        SECTION_TITLE[scenario.type],
        32,
        scenario.type === 'negative' ? 'FFF8E6C8' : 'FFD8F3E3',
        {
          size: 10,
          bold: true,
          color: { argb: scenario.type === 'negative' ? 'FF7A4B12' : 'FF14532D' },
        },
      );
      lastType = scenario.type;
      row += 1;
    }
    if (scenario.title.trim()) {
      sheet.getRow(row).height = 40;
      for (let column = 1; column <= 6; column += 1) {
        const value = column === 1 ? scenario.title : column === 3 ? scenario.expected : '';
        paint(sheet.getCell(row, column), value, 'FFE7F2EF', {
          size: column === 1 ? 11 : 10,
          bold: column === 1,
          color: { argb: column === 1 ? 'FF134E4A' : 'FF3F5B56' },
        });
      }
      row += 1;
    }
    for (const step of scenario.steps) {
      writeStepRow(sheet, row, step, bodyIndex % 2 === 1);
      bodyIndex += 1;
      row += 1;
    }
  }

  applyFeedbackColors(sheet, frozenRows + 1);
  sheet.views = [{ state: 'frozen', ySplit: frozenRows, showGridLines: false }];
}

async function buildWorkbook(testCases: TestCase[]): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'QA Report Generator';
  workbook.created = new Date();
  testCases.forEach((item, index) => {
    writeCaseSheet(workbook, item, index);
  });
  return workbook;
}

export function buildTestCaseExcelFileName(projectName: string, caseName?: string, date = new Date()): string {
  const project = slugify(projectName) || 'Projeto';
  const extra = caseName ? `_${slugify(caseName) || 'Caso'}` : '';
  return `Casos_${project}${extra}_${format(date, 'yyyy-MM-dd')}.xlsx`;
}

export async function downloadTestCasesExcel(testCases: TestCase[], fileName: string): Promise<void> {
  if (testCases.length === 0) {
    return;
  }
  const workbook = await buildWorkbook(testCases);
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
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
