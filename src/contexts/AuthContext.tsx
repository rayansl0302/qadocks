import { onAuthStateChanged } from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getAppUser } from '@/services/authService';
import { getFirebaseAuth, isFirebaseConfigured } from '@/services/firebase';
import type { AppUser } from '@/types';

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  configured: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isFirebaseConfigured();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!configured) {
      return;
    }

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const profile = await getAppUser(firebaseUser);
        setUser(profile);
      } catch {
        setUser({
          id: firebaseUser.uid,
          displayName: firebaseUser.displayName ?? 'QA',
          email: firebaseUser.email ?? '',
          createdAt: new Date(),
        });
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [configured]);

  const value = useMemo(() => ({ user, loading, configured }), [user, loading, configured]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }
  return context;
}
