import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { asString, toDate } from '@/lib/firestore';
import { getFirebaseAuth, getFirebaseDb } from '@/services/firebase';
import type { AppUser } from '@/types';

export async function registerUser(name: string, email: string, password: string): Promise<AppUser> {
  const auth = getFirebaseAuth();
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  return persistUser(credential.user, name);
}

export async function loginUser(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  return credential.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(getFirebaseAuth());
}

export async function recoverPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(getFirebaseAuth(), email);
}

export async function updateUserProfile(displayName: string): Promise<AppUser> {
  const auth = getFirebaseAuth();
  const current = auth.currentUser;
  if (!current) {
    throw new Error('Usuário não autenticado.');
  }
  await updateProfile(current, { displayName });
  try {
    await setDoc(
      doc(getFirebaseDb(), 'users', current.uid),
      {
        displayName,
        email: current.email ?? '',
      },
      { merge: true },
    );
  } catch {
    return {
      id: current.uid,
      displayName,
      email: current.email ?? '',
      createdAt: new Date(),
    };
  }
  return getAppUser(current);
}

export async function getAppUser(user: User): Promise<AppUser> {
  const fallback: AppUser = {
    id: user.uid,
    displayName: user.displayName ?? 'QA',
    email: user.email ?? '',
    createdAt: new Date(),
  };

  try {
    const snapshot = await getDoc(doc(getFirebaseDb(), 'users', user.uid));
    if (snapshot.exists()) {
      const data = snapshot.data();
      return {
        id: snapshot.id,
        displayName: asString(data.displayName, user.displayName ?? 'QA'),
        email: asString(data.email, user.email ?? ''),
        createdAt: toDate(data.createdAt),
      };
    }
    return await persistUser(user, user.displayName ?? 'QA');
  } catch {
    return fallback;
  }
}

async function persistUser(user: User, displayName: string): Promise<AppUser> {
  const createdAt = new Date();
  await setDoc(doc(getFirebaseDb(), 'users', user.uid), {
    displayName,
    email: user.email ?? '',
    createdAt: serverTimestamp(),
  });
  return {
    id: user.uid,
    displayName,
    email: user.email ?? '',
    createdAt,
  };
}
