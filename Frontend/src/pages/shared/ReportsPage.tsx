import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import SummaryCard from '../../components/reports/SummaryCard';
import { AlertCircle, CheckCircle2, Play, Clock, AlertTriangle } from 'lucide-react';
import ReportCard from '../../components/reports/ReportCard';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ExportButton from '../../components/ui/ExportButton';
import { ReportItem } from '../../types/report';
import { reportService } from '../../services/reportService';
import { exportToExcel, formatDate } from '../../utils/excelExport';

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
  const [isExporting, setIsExporting] = React.useState(false);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: 1, limit: 50 };
      if (query) params.search = query;
      if (activeTab && activeTab !== 'All') {
        // Map UI tab to backend status value
        let statusParam = activeTab.toLowerCase();
        if (activeTab === 'In Progress') statusParam = 'in-progress';
        if (activeTab === 'Resolved') statusParam = 'resolved';
        if (activeTab === 'Rejected') statusParam = 'rejected';
        if (activeTab === 'Pending') statusParam = 'pending';
        params.status = statusParam;
      }

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
        followUp: r.followUp || false,
        followUpDate: r.followUpDate ? new Date(r.followUpDate).toLocaleDateString() : undefined
      }));

      setReports(mapped);
  // if there's a selectedReportId in localStorage, set it so the UI can highlight/scroll, then remove it
  const stored = localStorage.getItem('selectedReportId');
  if (stored) {
    setSelectedReportId(stored);
    localStorage.removeItem('selectedReportId');
  }
    } catch (err: any) {
      setError(err?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  // Normalize status for robust filtering (e.g., 'In Progress' tab matches 'in-progress', 'in progress', etc)
  const normalizeStatus = (s: string) => s.replace(/[-_ ]/g, '').toLowerCase();
  const filtered = reports.filter(r => {
    if (activeTab !== 'All') {
      if (normalizeStatus(activeTab) !== normalizeStatus(r.status || '')) return false;
    }
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

    try {
      // First make the API call
      await reportService.updateReport(id, { status: backendStatus });
      
      // Then update UI state - clear follow-up when status changes (matches backend behavior)
      setReports(prev => prev.map(r => r.id === id ? { 
        ...r, 
        status: statusLabel,
        // Clear follow-up when status is updated (matches backend behavior)
        followUp: false,
        followUpDate: undefined
      } : r));
      
    } catch (err) {
      // Show error and refresh data on failure
      alert('Failed to update report status');
      await fetchReports();
    }
  };

  // Confirmation dialog state for any requested status change
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingChange, setPendingChange] = React.useState<null | { id: string; status: ReportItem['status']; title?: string }>(null);

  const openConfirmFor = (id: string, status: ReportItem['status'], title?: string) => {
    setPendingChange({ id, status, title });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingChange) return;
    const { id, status } = pendingChange;
    setConfirmOpen(false);
    setPendingChange(null);
    await handleStatusChange(id, status);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setPendingChange(null);
  };

  // Export functionality
  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Fetch all reports without filters
      const res = await reportService.getReports({ page: 1, limit: 10000 });
      
      // Map backend status values to UI labels
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
      
      const exportData = (res.data.reports || []).map((r: any) => ({
        'Title': r.title,
        'Type': r.type || '-',
        'Description': r.description || '-',
        'Reporter': r.tenant ? `${r.tenant.firstName || ''} ${r.tenant.lastName || ''}`.trim() : '-',
        'Room': r.room ? (r.room.roomNumber || r.room) : '-',
        'Status': mapStatusToLabel(r.status || 'pending'),
        'Days Open': r.submittedAt ? Math.floor((Date.now() - new Date(r.submittedAt).getTime()) / (1000 * 60 * 60 * 24)) : '-',
        'Created Date': r.submittedAt ? formatDate(r.submittedAt) : formatDate(r.createdAt),
        'Updated Date': formatDate(r.updatedAt),
        'Follow-up': r.followUp ? 'Yes' : 'No',
        'Follow-up Date': r.followUpDate ? formatDate(r.followUpDate) : '-'
      }));
      
      await exportToExcel(exportData, 'reports_export', { 
        sheetNames: ['Reports'],
        columnWidths: [25, 15, 40, 20, 12, 12, 12, 15, 15, 12, 15]
      });
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export reports. Please try again.');
    } finally {
      setIsExporting(false);
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
    el.classList.add('flash-highlight');
    const t = setTimeout(() => {
      el.classList.remove('flash-highlight');
      setSelectedReportId(null);
    }, 1200);
    return () => clearTimeout(t);
  }, [selectedReportId, reports]);

  // Clear selection when page changes/unmount
  React.useEffect(() => {
    return () => setSelectedReportId(null);
  }, [currentPage]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} userRole={userRole} />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
  <TopNavbar currentPage={currentPage} title="Reports" subtitle="Generate and view reports" onNotificationOpen={() => onNavigate && onNavigate('notifications')} />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-full">
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold">Reports</h1>
                  <p className="text-sm text-gray-500">Showing {filtered.length} reports</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-1/2">
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search for anything..."
                    className="flex-1 border rounded-md px-4 py-2 shadow-sm bg-white"
                  />
                  <ExportButton onClick={handleExport} loading={isExporting} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <SummaryCard
                title="Total Reports"
                value={reports.length}
                icon={<AlertCircle className="w-5 h-5" />}
                iconBgClass="bg-white"
                iconColorClass="text-blue-500"
              />
              <SummaryCard
                title="Follow-ups"
                value={reports.filter(r => r.followUp).length}
                icon={<AlertTriangle className="w-5 h-5" />}
                iconBgClass="bg-red-50"
                iconColorClass="text-red-500"
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

            {/* Tabs and summary - floating like Notifications */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-6">
                  <div className="mt-4">
                    <div className="inline-flex items-center gap-3 overflow-x-auto bg-white rounded-md px-3 py-2 shadow-sm">
                      {(['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setActiveTab(t as any)}
                          className={`px-3 py-2 rounded-md ${activeTab === t ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                          {t} {t === 'All' && `(${reports.length})`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end min-w-0">
                  {/* subtitle now shows count in header */}
                </div>
              </div>
            </div>

            {/* Report list - floating cards (each ReportCard is a floating card) */}
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
                  userRole={userRole}
                  // prefer request/change separation: ReportCard will call onRequestChange when user interacts
                  onRequestChange={canModifyReports ? (id, status, title) => openConfirmFor(id, status, title) : undefined}
                  onChangeStatus={canModifyReports ? handleStatusChange : undefined}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
      
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Change Status"
        message={pendingChange ? `Do you want to change the status of "${pendingChange.title || ''}" to "${pendingChange.status}"?` : ''}
        confirmLabel={pendingChange ? `Change to ${pendingChange.status}` : undefined}
        cancelLabel="Cancel"
        confirmStatus={pendingChange ? pendingChange.status : undefined}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default ReportsPage;
