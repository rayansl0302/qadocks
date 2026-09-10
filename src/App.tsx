import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { GuestRoute } from '@/components/layout/GuestRoute';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { CycleFormPage } from '@/pages/cycles/CycleFormPage';
import { CycleDetailPage } from '@/pages/cycles/CycleDetailPage';
import { ProjectCyclesPage } from '@/pages/cycles/ProjectCyclesPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { IssueDetailPage } from '@/pages/issues/IssueDetailPage';
import { IssueFormPage } from '@/pages/issues/IssueFormPage';
import { ProjectDetailPage } from '@/pages/projects/ProjectDetailPage';
import { ProjectFormPage } from '@/pages/projects/ProjectFormPage';
import { ProjectsPage } from '@/pages/projects/ProjectsPage';
import { ReportGeneratePage } from '@/pages/reports/ReportGeneratePage';
import { KnowledgeBasePage } from '@/pages/KnowledgeBasePage';
import { ReportsPage } from '@/pages/reports/ReportsPage';

export function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
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
          <Route path="/issues/:issueId" element={<IssueDetailPage />} />
          <Route path="/issues/:issueId/edit" element={<IssueFormPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/:reportId" element={<ReportsPage />} />
          <Route path="/base-conhecimento" element={<KnowledgeBasePage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
