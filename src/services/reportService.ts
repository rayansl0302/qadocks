import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { asString, toDate } from '@/lib/firestore';
import { getFirebaseDb } from '@/services/firebase';
import type { ReportRecord, ReportTemplate } from '@/types';

function mapReport(id: string, data: Record<string, unknown>): ReportRecord {
  return {
    id,
    projectId: asString(data.projectId),
    cycleId: asString(data.cycleId),
    title: asString(data.title),
    template: asString(data.template, 'profissional') as ReportTemplate,
    fileName: asString(data.fileName),
    createdAt: toDate(data.createdAt),
    createdBy: asString(data.createdBy),
  };
}

export async function listReports(userId: string): Promise<ReportRecord[]> {
  const snapshot = await getDocs(
    query(collection(getFirebaseDb(), 'reports'), where('createdBy', '==', userId)),
  );
  return snapshot.docs
    .map((item) => mapReport(item.id, item.data() as Record<string, unknown>))
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
}

export async function createReportRecord(params: {
  userId: string;
  projectId: string;
  cycleId: string;
  title: string;
  template: ReportTemplate;
  fileName: string;
}): Promise<string> {
  const reference = await addDoc(collection(getFirebaseDb(), 'reports'), {
    projectId: params.projectId,
    cycleId: params.cycleId,
    title: params.title,
    template: params.template,
    fileName: params.fileName,
    createdBy: params.userId,
    createdAt: serverTimestamp(),
  });
  return reference.id;
}
