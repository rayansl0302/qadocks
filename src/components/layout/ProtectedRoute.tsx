import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute() {
  const { user, loading, configured } = useAuth();
  const location = useLocation();

  if (!configured) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Verificando sessão..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
