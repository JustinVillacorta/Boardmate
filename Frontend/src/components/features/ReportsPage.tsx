import React from 'react';
import Sidebar from '../layout/Sidebar';
import TopNavbar from '../layout/TopNavbar';
import SummaryCard from '../reports/SummaryCard';
import { AlertCircle, CheckCircle2, Play, Clock } from 'lucide-react';
import ReportCard from '../reports/ReportCard';
import { ReportItem } from '../reports/types';

const MOCK_REPORTS: ReportItem[] = [
  {
    id: 'r1',
    title: 'Leaking faucet',
    tags: ['maintenance'],
    description: 'The bathroom faucet is leaking and needs repair.',
    reporter: 'John Doe',
    createdAt: '2025-11-10',
    updatedAt: '2025-11-10',
    room: '101',
    daysOpen: 7,
    status: 'Rejected',
  },
];

interface ReportsPageProps {
  currentPage?: string;
  onNavigate?: (p: string) => void;
  userRole?: 'admin' | 'staff';
}

const ReportsPage: React.FC<ReportsPageProps> = ({ currentPage, onNavigate, userRole = 'admin' }) => {
  const [query, setQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'All' | 'Resolved' | 'In Progress' | 'Pending' | 'Rejected'>('All');
  const [reports, setReports] = React.useState<ReportItem[]>(MOCK_REPORTS);

  const filtered = reports.filter(r => {
    if (activeTab !== 'All' && activeTab !== r.status && !(activeTab === 'In Progress' && r.status === 'In Progress')) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (r.title + ' ' + (r.description || '') + ' ' + (r.reporter || '')).toLowerCase().includes(q);
  });

  const handleStatusChange = (id: string, status: ReportItem['status']) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  // Role-based functionality
  const canCreateReports = userRole === 'admin'; // Only admin can create reports
  const canModifyReports = userRole === 'admin'; // Only admin can modify reports

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
                {filtered.length === 0 && <div className="py-8 text-center text-gray-500">No reports found.</div>}

                {filtered.map(r => (
                  <ReportCard 
                    key={r.id} 
                    report={r} 
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
