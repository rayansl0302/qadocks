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
import { asString, toDate } from '@/lib/firestore';
import { getFirebaseAuth, getFirebaseDb } from '@/services/firebase';
import { deleteIssueById, listIssuesByCycle } from '@/services/issueService';
import type { CycleStatus, TestCycle } from '@/types';

export interface CycleInput {
  name: string;
  description: string;
  version: string;
  environment: string;
  startDate: string;
  endDate: string;
  owner: string;
  status: CycleStatus;
}

function mapCycle(id: string, data: Record<string, unknown>): TestCycle {
  return {
    id,
    projectId: asString(data.projectId),
    name: asString(data.name),
    description: asString(data.description),
    version: asString(data.version),
    environment: asString(data.environment),
    startDate: asString(data.startDate),
    endDate: asString(data.endDate),
    owner: asString(data.owner),
    status: asString(data.status, 'ativo') as CycleStatus,
    createdAt: toDate(data.createdAt),
    createdBy: asString(data.createdBy),
  };
}

export async function listCycles(projectId: string): Promise<TestCycle[]> {
  const userId = getFirebaseAuth().currentUser?.uid;
  if (!userId) {
    return [];
  }
  const cycles = await listCyclesByUser(userId);
  return cycles.filter((cycle) => cycle.projectId === projectId);
}

export async function listCyclesByUser(userId: string): Promise<TestCycle[]> {
  const snapshot = await getDocs(
    query(collection(getFirebaseDb(), 'testCycles'), where('createdBy', '==', userId)),
  );
  return snapshot.docs
    .map((item) => mapCycle(item.id, item.data() as Record<string, unknown>))
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
}

export async function getCycle(cycleId: string): Promise<TestCycle | null> {
  const snapshot = await getDoc(doc(getFirebaseDb(), 'testCycles', cycleId));
  if (!snapshot.exists()) {
    return null;
  }
  return mapCycle(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function createCycle(userId: string, projectId: string, input: CycleInput): Promise<string> {
  const reference = await addDoc(collection(getFirebaseDb(), 'testCycles'), {
    ...input,
    projectId,
    createdBy: userId,
    createdAt: serverTimestamp(),
  });
  return reference.id;
}

export async function updateCycle(cycleId: string, input: CycleInput): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), 'testCycles', cycleId), { ...input });
}

export async function deleteCycleById(cycleId: string): Promise<void> {
  const issues = await listIssuesByCycle(cycleId);
  await Promise.all(issues.map((issue) => deleteIssueById(issue.id)));
  await deleteDoc(doc(getFirebaseDb(), 'testCycles', cycleId));
}
