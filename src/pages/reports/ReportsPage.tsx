import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { REPORT_TEMPLATE_LABEL } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import { formatDateTime } from '@/lib/format';
import { listReports } from '@/services/reportService';
import type { ReportRecord } from '@/types';

export function ReportsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    const userId = user.id;

    async function load() {
      try {
        setReports(await listReports(userId));
      } catch (error) {
        showToast(getErrorMessage(error), 'error');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [user, showToast]);

  if (loading) {
    return <Spinner label="Carregando relatórios..." />;
  }

  return (
    <div>
      <PageHeader
        title="Relatórios"
        description="Histórico dos relatórios gerados a partir dos seus ciclos de teste."
      />
      {reports.length === 0 ? (
        <EmptyState
          title="Nenhum relatório gerado"
          description="Abra um ciclo e use o botão Gerar relatório PDF."
        />
      ) : (
        <div className="grid gap-3">
          {reports.map((report) => (
            <Card key={report.id}>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-display text-2xl">{report.title}</h2>
                  <p className="text-sm text-muted">
                    {REPORT_TEMPLATE_LABEL[report.template]} · {report.fileName}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span>{formatDateTime(report.createdAt)}</span>
                  <Link to={`/cycles/${report.cycleId}/relatorio`} className="font-semibold text-teal">
                    Gerar novamente
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
