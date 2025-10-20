import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import ReportCard from '../../components/reports/ReportCard';
import SubmitMaintenanceForm from '../../components/tenant/SubmitMaintenanceForm';
import { reportService } from '../../services/reportService';
import { ReportItem } from '../../types/report';

interface ReportsProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const TenantReports: React.FC<ReportsProps> = ({ currentPage, onNavigate }) => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [isSubmitFormOpen, setIsSubmitFormOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: 1, limit: 50 };
      if (query) params.search = query;
      // backend will scope to tenant if token belongs to tenant
      const res = await reportService.getReports(params);
      const mapped: ReportItem[] = (res.data.reports || []).map((r: any) => ({
        id: r._id,
        title: r.title,
        tags: r.type ? [r.type] : [],
        description: r.description,
        reporter: r.tenant ? `${r.tenant.firstName || ''} ${r.tenant.lastName || ''}`.trim() : undefined,
        createdAt: r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : r.createdAt,
        updatedAt: r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : undefined,
        room: r.room ? (r.room.roomNumber || r.room) : undefined,
        daysOpen: r.submittedAt ? Math.floor((Date.now() - new Date(r.submittedAt).getTime()) / (1000 * 60 * 60 * 24)) : undefined,
        status: (function(s: string){
          if (!s) return 'Pending';
          switch (s.toLowerCase()){
            case 'in-progress': return 'In Progress';
            case 'resolved': return 'Resolved';
            case 'rejected': return 'Rejected';
            default: return 'Pending';
          }
        })(r.status || 'pending') as any
      }));
      setReports(mapped);

      const stored = localStorage.getItem('selectedReportId');
      if (stored) setSelectedReportId(stored);
    } catch (err: any) {
      setError(err?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleSubmitMaintenance = async (payload: any) => {
    try {
      await reportService.createReport(payload);
      setIsSubmitFormOpen(false);
      await fetchReports();
    } catch (err: any) {
      alert('Failed to submit report');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} userRole="tenant" />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <TopNavbar currentPage={currentPage} title="Reports" subtitle="Your maintenance requests" />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-full">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">My Reports</h1>
                <p className="text-sm text-gray-500">View the status of your maintenance requests</p>
              </div>
              <div className="w-64">
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search reports..." className="w-full border rounded-md px-4 py-2 shadow-sm bg-white" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-500">Showing {reports.length} reports</div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsSubmitFormOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded">+ New Request</button>
                </div>
              </div>

              <div className="space-y-4">
                {loading && <div className="py-8 text-center text-gray-500">Loading reports...</div>}
                {error && <div className="py-4 text-center text-red-500">{error}</div>}
                {!loading && !error && reports.length === 0 && (
                  <div className="py-8 text-center text-gray-500">No reports found.</div>
                )}

                {!loading && !error && reports.map(r => (
                  <ReportCard key={r.id} report={r} selected={r.id === selectedReportId} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {isSubmitFormOpen && (
        <SubmitMaintenanceForm onClose={() => setIsSubmitFormOpen(false)} onSubmit={handleSubmitMaintenance} />
      )}
    </div>
  );
};

export default TenantReports;
