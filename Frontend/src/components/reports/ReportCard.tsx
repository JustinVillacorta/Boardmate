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

const ReportCard: React.FC<{
  report: ReportItem;
  onChangeStatus?: (id: string, status: ReportItem['status']) => void;
  onRequestChange?: (id: string, status: ReportItem['status'], reportTitle?: string, locked?: boolean) => void;
  userRole?: 'admin' | 'staff';
  selected?: boolean;
}> = ({ report, onChangeStatus, onRequestChange, userRole = 'staff', selected }) => {
  const locked = report.status === 'Resolved' || report.status === 'Rejected';

  const StatusPicker: React.FC<{
    value: ReportItem['status'];
    onChange: (s: ReportItem['status']) => void;
    options?: ReportItem['status'][];
    disabled?: boolean;
  }> = ({ value, onChange, options = ['Pending','In Progress','Resolved','Rejected'], disabled }) => {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
      const onDoc = (e: MouseEvent) => {
        if (!ref.current) return;
        if (!ref.current.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener('click', onDoc);
      return () => document.removeEventListener('click', onDoc);
    }, []);

    return (
      <div ref={ref} className="relative text-sm">
        <button
          type="button"
          onClick={() => !disabled && setOpen(o => !o)}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md border ${disabled ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white border-gray-200 hover:shadow-sm'} focus:outline-none`}
        >
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${
              value === 'Resolved' ? 'bg-green-500' : value === 'Rejected' ? 'bg-red-500' : value === 'In Progress' ? 'bg-blue-500' : 'bg-yellow-400'
            }`} />
            <span className={`${disabled ? 'text-gray-600' : 'text-gray-800'}`}>{value}</span>
          </div>
          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {open && !disabled && (
          <ul className="absolute right-0 left-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
            {options.map(opt => (
              <li key={opt} className={`cursor-pointer px-3 py-2 hover:bg-gray-50 flex items-center justify-between ${opt === value ? 'bg-gray-50' : ''}`} onClick={() => { onChange(opt); setOpen(false); }}>
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    opt === 'Resolved' ? 'bg-green-500' : opt === 'Rejected' ? 'bg-red-500' : opt === 'In Progress' ? 'bg-blue-500' : 'bg-yellow-400'
                  }`} />
                  <span className="text-gray-800">{opt}</span>
                </div>
                {opt === value && (
                  <svg className="w-4 h-4 text-blue-500" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 10l3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <article id={`report-${report.id}`} className={`${selected ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' : 'bg-white'} rounded-xl shadow-sm relative overflow-visible border ${selected ? 'border-blue-300' : 'border-gray-200'} transition-shadow hover:shadow-md`}>
      {/* left/top accent — clipped by rounded corners */}
      <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-blue-500" />
      <div className="block sm:hidden absolute left-0 top-0 right-0 h-1 rounded-t-xl bg-blue-500" />

      <div className="flex flex-col sm:flex-row">

        <div className="flex-1 p-4 md:p-6 sm:pl-6">
          <div className="flex flex-col sm:flex-row sm:items-stretch sm:justify-between">
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
  <div className={`mt-4 sm:mt-0 sm:w-40 flex-shrink-0 text-left sm:text-right sm:ml-4 ${locked && userRole === 'admin' ? 'sm:flex sm:items-center sm:justify-end' : ''}`}>
              {!(locked && userRole === 'admin') && (
                <div className="text-sm text-gray-500">Status</div>
              )}
              {onChangeStatus ? (
                  locked && userRole === 'admin' ? (
                    <div className="mt-2 sm:mt-0">
                      <button
                        onClick={() => onRequestChange ? onRequestChange(report.id, 'Pending', report.title, true) : onChangeStatus && onChangeStatus(report.id, 'Pending')}
                        className="text-sm px-3 py-1 rounded-md bg-white border text-blue-600 hover:bg-blue-50"
                      >
                        Reopen
                      </button>
                    </div>
                ) : locked ? (
                  // locked and not admin: show no duplicate label on the right — status pill is shown next to title
                  <div className="mt-2" />
                ) : (
                  <div className="mt-2 relative">
                    <StatusPicker
                      value={report.status}
                      onChange={(val) => {
                        if (onRequestChange) onRequestChange(report.id, val, report.title, false);
                        else onChangeStatus && onChangeStatus(report.id, val);
                      }}
                      disabled={false}
                    />
                  </div>
                )
              ) : (
                <div className={`mt-2 inline-flex items-center rounded-md px-3 py-2 ${statusColor(report.status)} border`}>{report.status}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ReportCard;
