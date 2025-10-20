import React from 'react';
import { User, Calendar, Clock, MapPin } from 'lucide-react';
import { ReportItem } from '../../types/report';

const statusColor = (s: ReportItem['status']) => {
  switch (s) {
    case 'Resolved': return 'bg-green-50 text-green-700';
    case 'In Progress': return 'bg-blue-50 text-blue-700';
    case 'Pending': return 'bg-yellow-50 text-yellow-700';
    case 'Rejected': return 'bg-red-50 text-red-700';
    default: return 'bg-gray-50 text-gray-700';
  }
};

const ReportCard: React.FC<{ report: ReportItem; onChangeStatus?: (id: string, status: ReportItem['status']) => void; selected?: boolean }> = ({ report, onChangeStatus, selected }) => {
  return (
    <article id={`report-${report.id}`} className={`${selected ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' : 'bg-white'} rounded-xl shadow-sm overflow-hidden` }>
      <div className="flex flex-col sm:flex-row">
        {/* blue left bar on sm+, top bar on small screens */}
        <div className="bg-blue-500 w-full h-1 sm:w-1 sm:h-auto" />

        <div className="flex-1 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 pr-0 sm:pr-4">
              <div className="flex items-center gap-3">
                <h4 className="font-semibold text-lg">{report.title}</h4>
                <span className={`ml-2 text-xs px-2 py-1 rounded-full ${statusColor(report.status)}`}>{report.status}</span>
                {report.tags?.map(tag => (
                  <span key={tag} className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{tag}</span>
                ))}
              </div>

              <div className="text-sm text-gray-600 mt-3">{report.description}</div>

              <div className="mt-4 flex flex-wrap items-center text-xs text-gray-500 gap-4">
                <div className="flex items-center gap-2"><User className="w-4 h-4" /> <span>{report.reporter || 'undefined undefined'}</span></div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> <span>{report.createdAt}</span></div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> <span>Updated: {report.updatedAt}</span></div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> <span>Room: {report.room}</span></div>
                <div className="flex items-center gap-2"><span>Days: {report.daysOpen}</span></div>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 sm:w-40 flex-shrink-0 text-left sm:text-right sm:ml-4">
              <div className="text-sm text-gray-500">Status</div>
              <select
                value={report.status}
                onChange={e => onChangeStatus && onChangeStatus(report.id, e.target.value as any)}
                className={`mt-2 w-full sm:w-auto rounded-md px-3 py-2 ${statusColor(report.status)} border`}
              >
                <option value="Rejected">Rejected</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ReportCard;
