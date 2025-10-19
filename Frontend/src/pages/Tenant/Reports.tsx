import React, { useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import TopNavbar from "../../components/layout/TopNavbar";
import SubmitMaintenanceForm from "../../components/tenant/SubmitMaintenanceForm";

interface ReportsProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

interface ReportItem {
  id: string;
  title: string;
  description: string;
  submittedDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  type: 'Maintenance' | 'Complaint';
  icon: string;
}

const Reports: React.FC<ReportsProps> = ({ currentPage, onNavigate }) => {
  const [isSubmitFormOpen, setIsSubmitFormOpen] = useState(false);

  // Hardcoded reports data
  const reports: ReportItem[] = [
    {
      id: '1',
      title: 'Light Bulb',
      description: 'Bedroom light bulb needs replacement',
      submittedDate: '2024-01-20',
      status: 'Pending',
      type: 'Maintenance',
      icon: '💡'
    },
    {
      id: '2',
      title: 'Air Conditioning',
      description: 'AC not cooling properly',
      submittedDate: '2024-01-15',
      status: 'In Progress',
      type: 'Maintenance',
      icon: '❄️'
    },
    {
      id: '3',
      title: 'Leaky Faucet',
      description: 'Bathroom faucet drips constantly.',
      submittedDate: '2024-01-10',
      status: 'Completed',
      type: 'Maintenance',
      icon: '🔧'
    },
    {
      id: '4',
      title: 'Loud Noise On Next Room',
      description: 'Noise complaint at room 382',
      submittedDate: '2024-01-20',
      status: 'Pending',
      type: 'Complaint',
      icon: '🔊'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Maintenance':
        return 'bg-blue-100 text-blue-800';
      case 'Complaint':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'In Progress':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'Completed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleSubmitMaintenance = (formData: any) => {
    console.log('New maintenance request submitted:', formData);
    setIsSubmitFormOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      
      {/* Main Content - Responsive */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navigation */}
        <TopNavbar currentPage={currentPage} />

        {/* Reports Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Reports</h1>
              <p className="text-gray-600 mt-1">Submit and track your complaints and maintenance requests.</p>
            </div>
            <button
              onClick={() => setIsSubmitFormOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              + New Request
            </button>
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {reports.length > 0 ? (
              reports.map((report) => (
                <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">{report.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {report.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                            {report.type}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3">{report.description}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">Submitted: {report.submittedDate}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          {getStatusIcon(report.status)}
                          <span>{report.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
                <p className="text-gray-500 mb-6">Submit your first maintenance request or complaint.</p>
                <button
                  onClick={() => setIsSubmitFormOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Submit New Request
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Submit Maintenance Form Modal */}
      {isSubmitFormOpen && (
        <SubmitMaintenanceForm
          onClose={() => setIsSubmitFormOpen(false)}
          onSubmit={handleSubmitMaintenance}
        />
      )}
    </div>
  );
};

export default Reports;
