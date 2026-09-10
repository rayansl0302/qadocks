import { BookOpen, FileText, FolderKanban, LayoutDashboard, LogOut } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getErrorMessage } from '@/lib/errors';
import { logoutUser } from '@/services/authService';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projetos', icon: FolderKanban },
  { to: '/reports', label: 'Relatórios', icon: FileText },
  { to: '/base-conhecimento', label: 'Base de conhecimento', icon: BookOpen },
];

export function AppLayout() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-line bg-teal text-paper lg:border-b-0 lg:border-r lg:border-teal-soft">
        <div className="px-6 py-6">
          <p className="text-xs uppercase tracking-[0.2em] text-paper/70">QA Docs</p>
          <h1 className="mt-2 font-display text-2xl">QA Report Generator</h1>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium ${
                    isActive ? 'bg-paper text-teal' : 'text-paper/80 hover:bg-teal-soft hover:text-paper'
                  }`
                }
              >
                <Icon size={18} />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="hidden px-6 py-6 lg:block">
          <p className="text-sm text-paper/80">{user?.displayName}</p>
          <p className="text-xs text-paper/60">{user?.email}</p>
          <Button variant="secondary" className="mt-4 w-full" onClick={handleLogout}>
            <LogOut size={16} />
            Sair
          </Button>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 lg:hidden">
          <div>
            <p className="text-sm font-semibold">{user?.displayName}</p>
            <p className="text-xs text-muted">{user?.email}</p>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            Sair
          </Button>
        </header>
        <main className="px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
