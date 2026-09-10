import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { asNumber, asString, toDate } from '@/lib/firestore';
import { getFirebaseDb } from '@/services/firebase';
import type { Evidence } from '@/types';

function mapEvidence(id: string, data: Record<string, unknown>): Evidence {
  return {
    id,
    issueId: asString(data.issueId),
    projectId: asString(data.projectId),
    cycleId: asString(data.cycleId),
    url: asString(data.url),
    storagePath: asString(data.storagePath),
    fileName: asString(data.fileName),
    caption: asString(data.caption),
    order: asNumber(data.order),
    size: asNumber(data.size),
    createdAt: toDate(data.createdAt),
  };
}

export async function listEvidences(issueId: string): Promise<Evidence[]> {
  const snapshot = await getDocs(
    query(collection(getFirebaseDb(), 'evidences'), where('issueId', '==', issueId)),
  );
  return snapshot.docs
    .map((item) => mapEvidence(item.id, item.data() as Record<string, unknown>))
    .sort((left, right) => left.order - right.order);
}

export async function listEvidencesByCycle(cycleId: string): Promise<Evidence[]> {
  const snapshot = await getDocs(
    query(collection(getFirebaseDb(), 'evidences'), where('cycleId', '==', cycleId)),
  );
  return snapshot.docs
    .map((item) => mapEvidence(item.id, item.data() as Record<string, unknown>))
    .sort((left, right) => left.order - right.order);
}

export async function uploadEvidence(params: {
  file: File;
  issueId: string;
  projectId: string;
  cycleId: string;
  order: number;
}): Promise<string> {
  const url = await fileToStoredUrl(params.file);
  return saveEvidenceRecord({ ...params, url, storagePath: '' });
}

async function saveEvidenceRecord(params: {
  file: File;
  issueId: string;
  projectId: string;
  cycleId: string;
  order: number;
  url: string;
  storagePath: string;
}): Promise<string> {
  const reference = await addDoc(collection(getFirebaseDb(), 'evidences'), {
    issueId: params.issueId,
    projectId: params.projectId,
    cycleId: params.cycleId,
    url: params.url,
    storagePath: params.storagePath,
    fileName: params.file.name,
    caption: '',
    order: params.order,
    size: params.file.size,
    createdAt: serverTimestamp(),
  });
  return reference.id;
}

async function fileToStoredUrl(file: File): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  if (dataUrl.length <= 800000) {
    return dataUrl;
  }
  return compressImage(file);
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.readAsDataURL(file);
  });
}

async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    throw new Error('Não foi possível compactar a imagem.');
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.72);
}

export async function updateEvidenceCaption(evidenceId: string, caption: string): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), 'evidences', evidenceId), { caption });
}

export async function reorderEvidences(orderedIds: string[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, index) => updateDoc(doc(getFirebaseDb(), 'evidences', id), { order: index })),
  );
}

export async function deleteEvidence(evidence: Evidence): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), 'evidences', evidence.id));
}

export async function deleteEvidencesByIssue(issueId: string): Promise<void> {
  const evidences = await listEvidences(issueId);
  await Promise.all(evidences.map((item) => deleteEvidence(item)));
}
