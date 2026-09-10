import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AccountCreatorRoute } from '@/components/layout/AccountCreatorRoute';
import { GuestRoute } from '@/components/layout/GuestRoute';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { CycleFormPage } from '@/pages/cycles/CycleFormPage';
import { CycleDetailPage } from '@/pages/cycles/CycleDetailPage';
import { CycleFollowUpPage } from '@/pages/cycles/CycleFollowUpPage';
import { ProjectCyclesPage } from '@/pages/cycles/ProjectCyclesPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { IssueDetailPage } from '@/pages/issues/IssueDetailPage';
import { IssueFormPage } from '@/pages/issues/IssueFormPage';
import { ProjectDetailPage } from '@/pages/projects/ProjectDetailPage';
import { ProjectFormPage } from '@/pages/projects/ProjectFormPage';
import { ProjectsPage } from '@/pages/projects/ProjectsPage';
import { ReportGeneratePage } from '@/pages/reports/ReportGeneratePage';
import { KnowledgeBasePage } from '@/pages/KnowledgeBasePage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ReportsPage } from '@/pages/reports/ReportsPage';

export function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AccountCreatorRoute />}>
          <Route path="/interno-qa/criar-usuario" element={<RegisterPage />} />
        </Route>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/new" element={<ProjectFormPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="/projects/:projectId/edit" element={<ProjectFormPage />} />
          <Route path="/projects/:projectId/cycles" element={<ProjectCyclesPage />} />
          <Route path="/projects/:projectId/cycles/new" element={<CycleFormPage />} />
          <Route path="/cycles/:cycleId" element={<CycleDetailPage />} />
          <Route path="/cycles/:cycleId/edit" element={<CycleFormPage />} />
          <Route path="/cycles/:cycleId/issues" element={<CycleDetailPage />} />
          <Route path="/cycles/:cycleId/issues/new" element={<IssueFormPage />} />
          <Route path="/cycles/:cycleId/relatorio" element={<ReportGeneratePage />} />
          <Route path="/cycles/:cycleId/acompanhamento" element={<CycleFollowUpPage />} />
          <Route path="/issues/:issueId" element={<IssueDetailPage />} />
          <Route path="/issues/:issueId/edit" element={<IssueFormPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/:reportId" element={<ReportsPage />} />
          <Route path="/base-conhecimento" element={<KnowledgeBasePage />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
