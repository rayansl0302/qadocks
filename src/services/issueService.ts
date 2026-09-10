import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { nextIssueCode } from '@/lib/issueCode';
import { asString, asStringArray, toDate } from '@/lib/firestore';
import { getFirebaseAuth, getFirebaseDb } from '@/services/firebase';
import { deleteEvidencesByIssue } from '@/services/evidenceService';
import type { Issue, IssueStatus, IssueType, Priority, Severity } from '@/types';

export type IssueInput = Omit<Issue, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'authorId' | 'authorName'>;

function mapIssue(id: string, data: Record<string, unknown>): Issue {
  return {
    id,
    projectId: asString(data.projectId),
    cycleId: asString(data.cycleId),
    code: asString(data.code),
    type: asString(data.type, 'bug') as IssueType,
    title: asString(data.title),
    description: asString(data.description),
    status: asString(data.status, 'aberto') as IssueStatus,
    severity: asString(data.severity, 'media') as Severity,
    priority: asString(data.priority, 'normal') as Priority,
    authorId: asString(data.authorId),
    authorName: asString(data.authorName),
    assignee: asString(data.assignee),
    notes: asString(data.notes),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    preconditions: asString(data.preconditions),
    reproductionSteps: asStringArray(data.reproductionSteps),
    expectedResult: asString(data.expectedResult),
    actualResult: asString(data.actualResult),
    impact: asString(data.impact),
    environment: asString(data.environment),
    version: asString(data.version),
    browser: asString(data.browser),
    operatingSystem: asString(data.operatingSystem),
    device: asString(data.device),
    objective: asString(data.objective),
    businessRules: asString(data.businessRules),
    acceptanceCriteria: asString(data.acceptanceCriteria),
    currentSituation: asString(data.currentSituation),
    opportunity: asString(data.opportunity),
    suggestion: asString(data.suggestion),
    expectedBenefit: asString(data.expectedBenefit),
    originalProblem: asString(data.originalProblem),
    correctionMade: asString(data.correctionMade),
    resultAfterCorrection: asString(data.resultAfterCorrection),
    correctedVersion: asString(data.correctedVersion),
    correctionDate: asString(data.correctionDate),
    correctionOwner: asString(data.correctionOwner),
  };
}

export async function listIssuesByCycle(cycleId: string): Promise<Issue[]> {
  const userId = getFirebaseAuth().currentUser?.uid;
  if (!userId) {
    return [];
  }
  const issues = await listIssuesByUser(userId);
  return issues
    .filter((issue) => issue.cycleId === cycleId)
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
}

export async function listIssuesByUser(userId: string): Promise<Issue[]> {
  const snapshot = await getDocs(
    query(collection(getFirebaseDb(), 'issues'), where('authorId', '==', userId)),
  );
  return snapshot.docs.map((item) => mapIssue(item.id, item.data() as Record<string, unknown>));
}

export async function getIssue(issueId: string): Promise<Issue | null> {
  const snapshot = await getDoc(doc(getFirebaseDb(), 'issues', issueId));
  if (!snapshot.exists()) {
    return null;
  }
  return mapIssue(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function createIssue(
  authorId: string,
  authorName: string,
  input: IssueInput,
): Promise<string> {
  const existing = await listIssuesByCycle(input.cycleId);
  const code = nextIssueCode(existing, input.type);
  const reference = await addDoc(collection(getFirebaseDb(), 'issues'), {
    ...input,
    code,
    authorId,
    authorName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return reference.id;
}

export async function updateIssue(issueId: string, input: Partial<IssueInput>): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), 'issues', issueId), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteIssueById(issueId: string): Promise<void> {
  await deleteEvidencesByIssue(issueId);
  await deleteDoc(doc(getFirebaseDb(), 'issues', issueId));
}
