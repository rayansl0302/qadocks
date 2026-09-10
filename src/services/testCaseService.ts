import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { EXAMPLE_TEST_CASE, EXAMPLE_TEST_CASE_NAME } from '@/lib/testCaseExample';
import { asString, toDate } from '@/lib/firestore';
import { getFirebaseAuth, getFirebaseDb } from '@/services/firebase';
import type { TestCase, TestScenario, TestScenarioType, TestStep } from '@/types';

export interface TestCaseInput {
  name: string;
  description: string;
  setupSteps: TestStep[];
  scenarios: TestScenario[];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function mapStep(value: unknown): TestStep {
  const data = asRecord(value);
  if (!data) {
    return { action: '', data: '', expected: '', result: '', comment: '' };
  }
  return {
    action: asString(data.action),
    data: asString(data.data),
    expected: asString(data.expected),
    result: asString(data.result),
    comment: asString(data.comment),
  };
}

function mapScenarioType(value: unknown): TestScenarioType {
  return asString(value) === 'negative' ? 'negative' : 'happy_path';
}

function mapScenario(value: unknown): TestScenario {
  const data = asRecord(value);
  if (!data) {
    return { type: 'happy_path', title: '', expected: '', steps: [] };
  }
  return {
    type: mapScenarioType(data.type),
    title: asString(data.title),
    expected: asString(data.expected),
    steps: Array.isArray(data.steps) ? data.steps.map(mapStep) : [],
  };
}

function mapTestCase(projectId: string, value: unknown): TestCase | null {
  const data = asRecord(value);
  if (!data) {
    return null;
  }
  return {
    id: asString(data.id),
    projectId: asString(data.projectId, projectId),
    name: asString(data.name),
    description: asString(data.description),
    setupSteps: Array.isArray(data.setupSteps) ? data.setupSteps.map(mapStep) : [],
    scenarios: Array.isArray(data.scenarios) ? data.scenarios.map(mapScenario) : [],
    createdAt: toDate(data.createdAt),
    createdBy: asString(data.createdBy),
  };
}

function serializeCase(testCase: TestCase): Record<string, unknown> {
  return {
    id: testCase.id,
    projectId: testCase.projectId,
    name: testCase.name,
    description: testCase.description,
    setupSteps: testCase.setupSteps,
    scenarios: testCase.scenarios,
    createdAt: testCase.createdAt.toISOString(),
    createdBy: testCase.createdBy,
  };
}

async function readProjectCases(projectId: string): Promise<TestCase[]> {
  const snapshot = await getDoc(doc(getFirebaseDb(), 'projects', projectId));
  if (!snapshot.exists()) {
    return [];
  }
  const data = snapshot.data() as Record<string, unknown>;
  if (!Array.isArray(data.testCases)) {
    return [];
  }
  return data.testCases
    .map((item) => mapTestCase(projectId, item))
    .filter((item): item is TestCase => Boolean(item?.id))
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
}

async function writeProjectCases(projectId: string, testCases: TestCase[]): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), 'projects', projectId), {
    testCases: testCases.map(serializeCase),
  });
}

export async function listTestCases(projectId: string): Promise<TestCase[]> {
  const userId = getFirebaseAuth().currentUser?.uid;
  if (!userId) {
    return [];
  }
  return readProjectCases(projectId);
}

export async function getTestCase(projectId: string, caseId: string): Promise<TestCase | null> {
  const testCases = await readProjectCases(projectId);
  return testCases.find((item) => item.id === caseId) ?? null;
}

export async function createTestCase(userId: string, projectId: string, input: TestCaseInput): Promise<string> {
  const current = await readProjectCases(projectId);
  const id = crypto.randomUUID();
  await writeProjectCases(projectId, [
    {
      id,
      projectId,
      ...input,
      createdAt: new Date(),
      createdBy: userId,
    },
    ...current,
  ]);
  return id;
}

export async function updateTestCase(projectId: string, caseId: string, input: TestCaseInput): Promise<void> {
  const current = await readProjectCases(projectId);
  await writeProjectCases(
    projectId,
    current.map((item) => (item.id === caseId ? { ...item, ...input } : item)),
  );
}

export async function deleteTestCase(projectId: string, caseId: string): Promise<void> {
  const current = await readProjectCases(projectId);
  await writeProjectCases(
    projectId,
    current.filter((item) => item.id !== caseId),
  );
}

export async function deleteTestCasesByProject(projectId: string): Promise<void> {
  const snapshot = await getDoc(doc(getFirebaseDb(), 'projects', projectId));
  if (!snapshot.exists()) {
    return;
  }
  await writeProjectCases(projectId, []);
}

export async function ensureExampleTestCase(userId: string, projectId: string): Promise<TestCase[]> {
  const snapshot = await getDoc(doc(getFirebaseDb(), 'projects', projectId));
  if (!snapshot.exists()) {
    return [];
  }
  const data = snapshot.data() as Record<string, unknown>;
  const current = Array.isArray(data.testCases)
    ? data.testCases
        .map((item) => mapTestCase(projectId, item))
        .filter((item): item is TestCase => Boolean(item?.id))
        .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    : [];
  if (data.exampleTestCaseSeeded === true || current.some((item) => item.name === EXAMPLE_TEST_CASE_NAME)) {
    return current;
  }
  await createTestCase(userId, projectId, EXAMPLE_TEST_CASE);
  await updateDoc(doc(getFirebaseDb(), 'projects', projectId), { exampleTestCaseSeeded: true });
  return listTestCases(projectId);
}
