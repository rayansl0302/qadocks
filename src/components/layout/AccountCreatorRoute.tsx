import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { canManageAccounts } from '@/services/authService';

export function AccountCreatorRoute() {
  const { user } = useAuth();

  if (!user || !canManageAccounts(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
