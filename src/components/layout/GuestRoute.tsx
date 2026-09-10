import { Navigate, Outlet } from 'react-router-dom';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/contexts/AuthContext';

export function GuestRoute() {
  const { user, loading, configured } = useAuth();

  if (configured && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
