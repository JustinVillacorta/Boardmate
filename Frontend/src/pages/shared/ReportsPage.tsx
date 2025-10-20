import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import SummaryCard from '../../components/reports/SummaryCard';
import { AlertCircle, CheckCircle2, Play, Clock } from 'lucide-react';
import ReportCard from '../../components/reports/ReportCard';
import { ReportItem } from '../../types/report';
import { reportService } from '../../services/reportService';

interface ReportsPageProps {
  currentPage?: string;
  onNavigate?: (p: string) => void;
  userRole?: 'admin' | 'staff';
}

const ReportsPage: React.FC<ReportsPageProps> = ({ currentPage, onNavigate, userRole = 'admin' }) => {
  const [query, setQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'All' | 'Resolved' | 'In Progress' | 'Pending' | 'Rejected'>('All');
  const [reports, setReports] = React.useState<ReportItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = React.useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: 1, limit: 50 };
      if (query) params.search = query;
      if (activeTab && activeTab !== 'All') params.status = activeTab.toLowerCase();

      const res = await reportService.getReports(params);
      // Map backend status values (e.g., 'in-progress') to UI labels ('In Progress')
      const mapStatusToLabel = (s: string) => {
        if (!s) return 'Pending';
        switch (s.toLowerCase()) {
          case 'in-progress':
          case 'in progress':
            return 'In Progress';
          case 'resolved':
            return 'Resolved';
          case 'rejected':
            return 'Rejected';
          case 'pending':
          default:
            return 'Pending';
        }
      };

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
        status: mapStatusToLabel(r.status || 'pending') as any,
      }));

      setReports(mapped);
  // if there's a selectedReportId in localStorage, set it so the UI can highlight/scroll
  const stored = localStorage.getItem('selectedReportId');
  if (stored) setSelectedReportId(stored);
    } catch (err: any) {
      setError(err?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const filtered = reports.filter(r => {
    if (activeTab !== 'All' && activeTab !== r.status && !(activeTab === 'In Progress' && r.status === 'In Progress')) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (r.title + ' ' + (r.description || '') + ' ' + (r.reporter || '')).toLowerCase().includes(q);
  });

  const handleStatusChange = async (id: string, statusLabel: ReportItem['status']) => {
    // Map UI label back to backend status value
    const mapLabelToStatus = (label: string) => {
      switch (label) {
        case 'In Progress':
          return 'in-progress';
        case 'Resolved':
          return 'resolved';
        case 'Rejected':
          return 'rejected';
        case 'Pending':
        default:
          return 'pending';
      }
    };

    const backendStatus = mapLabelToStatus(statusLabel as string);

    // Optimistic update (keep UI label)
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: statusLabel } : r));
    try {
      await reportService.updateReport(id, { status: backendStatus });
    } catch (err) {
      // Revert on error and show basic alert
      await fetchReports();
      alert('Failed to update report status');
    }
  };

  // Role-based functionality
  const canCreateReports = userRole === 'admin'; // Only admin can create reports
  const canModifyReports = userRole === 'admin' || userRole === 'staff'; // Admin and staff can modify reports

  React.useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeTab]);

  // when selectedReportId is set and reports are loaded, scroll into view and flash
  React.useEffect(() => {
    if (!selectedReportId) return;
    const el = document.getElementById(`report-${selectedReportId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('ring-2', 'ring-blue-300');
    const t = setTimeout(() => el.classList.remove('ring-2', 'ring-blue-300'), 1200);
    return () => clearTimeout(t);
  }, [selectedReportId, reports]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} userRole={userRole} />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <TopNavbar currentPage={currentPage} title="Reports" subtitle="Generate and view reports" />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-full">
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold">Reports</h1>
                  <p className="text-sm text-gray-500">
                    {userRole === 'staff' ? 'View reports and maintenance requests' : 'Generate and view reports'}
                  </p>
                </div>
                <div className="w-full md:w-1/2">
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search for anything..."
                    className="w-full border rounded-md px-4 py-2 shadow-sm bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <SummaryCard
                title="Total Reports"
                value={reports.length}
                icon={<AlertCircle className="w-5 h-5" />}
                iconBgClass="bg-white"
                iconColorClass="text-blue-500"
              />
              <SummaryCard
                title="Resolved"
                value={reports.filter(r => r.status === 'Resolved').length}
                icon={<CheckCircle2 className="w-5 h-5" />}
                iconBgClass="bg-green-50"
                iconColorClass="text-green-500"
              />
              <SummaryCard
                title="In Progress"
                value={reports.filter(r => r.status === 'In Progress').length}
                icon={<Play className="w-5 h-5" />}
                iconBgClass="bg-blue-50"
                iconColorClass="text-blue-500"
              />
              <SummaryCard
                title="Pending"
                value={reports.filter(r => r.status === 'Pending').length}
                icon={<Clock className="w-5 h-5" />}
                iconBgClass="bg-red-50"
                iconColorClass="text-red-500"
              />
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                <div className="flex items-center space-x-3 overflow-x-auto">
                  {(['All', 'Resolved', 'In Progress', 'Pending', 'Rejected'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t as any)}
                      className={`px-3 py-2 rounded-md ${activeTab === t ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {t} {t === 'All' && `(${reports.length})`}
                    </button>
                  ))}
                </div>
                <div className="text-sm text-gray-500">Showing {filtered.length} reports</div>
              </div>

                <div className="space-y-4">
                  {loading && <div className="py-8 text-center text-gray-500">Loading reports...</div>}
                  {error && <div className="py-4 text-center text-red-500">{error}</div>}

                  {!loading && !error && filtered.length === 0 && (
                    <div className="py-8 text-center text-gray-500">No reports found.</div>
                  )}

                  {!loading && !error && filtered.map(r => (
                    <ReportCard 
                      key={r.id}
                      report={r}
                      selected={r.id === selectedReportId}
                      onChangeStatus={canModifyReports ? handleStatusChange : undefined}
                    />
                  ))}
                </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsPage;
