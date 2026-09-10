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
import { getFirebaseDb } from '@/services/firebase';
import { deleteCycleById, listCycles } from '@/services/cycleService';
import { deleteTestCasesByProject } from '@/services/testCaseService';
import type { Project, ProjectStatus } from '@/types';

export interface ProjectInput {
  name: string;
  description: string;
  client: string;
  version: string;
  environment: string;
  owner: string;
  status: ProjectStatus;
}

function mapProject(id: string, data: Record<string, unknown>): Project {
  return {
    id,
    name: asString(data.name),
    description: asString(data.description),
    client: asString(data.client),
    version: asString(data.version),
    environment: asString(data.environment),
    owner: asString(data.owner),
    status: asString(data.status, 'ativo') as ProjectStatus,
    createdAt: toDate(data.createdAt),
    createdBy: asString(data.createdBy),
  };
}

export async function listProjects(userId: string): Promise<Project[]> {
  const snapshot = await getDocs(
    query(collection(getFirebaseDb(), 'projects'), where('createdBy', '==', userId)),
  );
  return snapshot.docs
    .map((item) => mapProject(item.id, item.data() as Record<string, unknown>))
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
}

export async function getProject(projectId: string): Promise<Project | null> {
  const snapshot = await getDoc(doc(getFirebaseDb(), 'projects', projectId));
  if (!snapshot.exists()) {
    return null;
  }
  return mapProject(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function createProject(userId: string, input: ProjectInput): Promise<string> {
  const reference = await addDoc(collection(getFirebaseDb(), 'projects'), {
    ...input,
    createdBy: userId,
    createdAt: serverTimestamp(),
  });
  return reference.id;
}

export async function updateProject(projectId: string, input: ProjectInput): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), 'projects', projectId), { ...input });
}

export async function deleteProject(projectId: string): Promise<void> {
  const cycles = await listCycles(projectId);
  await Promise.all(cycles.map((cycle) => deleteCycleById(cycle.id)));
  await deleteTestCasesByProject(projectId);
  await deleteDoc(doc(getFirebaseDb(), 'projects', projectId));
}
