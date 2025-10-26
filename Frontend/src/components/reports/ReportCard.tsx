import React from 'react';
import ReactDOM from 'react-dom';
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
  onRequestChange?: (id: string, status: ReportItem['status'], reportTitle?: string) => void;
  onFollowUp?: (id: string) => void;
  userRole?: 'admin' | 'staff' | 'tenant';
  selected?: boolean;
}> = ({ report, onChangeStatus, onRequestChange, onFollowUp, userRole = 'staff', selected }) => {
  const locked = report.status === 'Resolved' || report.status === 'Rejected';

    const StatusPicker: React.FC<{
    value: ReportItem['status'];
    onChange: (s: ReportItem['status']) => void;
    options?: ReportItem['status'][];
    disabled?: boolean;
  }> = ({ value, onChange, options = ['Pending','In Progress','Resolved','Rejected'], disabled }) => {
    const [open, setOpen] = React.useState(false);
    const wrapperRef = React.useRef<HTMLDivElement | null>(null);
    const buttonRef = React.useRef<HTMLButtonElement | null>(null);
    const [portalStyle, setPortalStyle] = React.useState<React.CSSProperties | null>(null);

    React.useEffect(() => {
      const onDoc = (e: MouseEvent) => {
        if (!wrapperRef.current) return;
        if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener('click', onDoc);
      return () => document.removeEventListener('click', onDoc);
    }, []);

    React.useEffect(() => {
      if (!open || !buttonRef.current) {
        setPortalStyle(null);
        return;
      }
      const rect = buttonRef.current.getBoundingClientRect();
      setPortalStyle({
        position: 'absolute',
        left: rect.left + window.scrollX,
        top: rect.bottom + window.scrollY,
        width: rect.width,
        zIndex: 9999,
      });
    }, [open]);

    const dropdown = (
      <ul className="bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden" style={portalStyle as React.CSSProperties | undefined}>
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
    );

    return (
      <div ref={wrapperRef} className="relative text-sm">
        <button
          ref={buttonRef}
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

        {open && !disabled && portalStyle && ReactDOM.createPortal(dropdown, document.body)}
      </div>
    );
  };

  // Function to get available status options based on current status
  const getAvailableStatuses = (currentStatus: ReportItem['status']): ReportItem['status'][] => {
    switch (currentStatus) {
      case 'Pending':
        return ['Pending', 'In Progress', 'Rejected'];
      case 'In Progress':
        return ['In Progress', 'Resolved'];
      case 'Resolved':
      case 'Rejected':
        return [currentStatus]; // No transitions allowed from final states
      default:
        return ['Pending', 'In Progress', 'Resolved', 'Rejected'];
    }
  };

  return (
  <article id={`report-${report.id}`} className={`${selected ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' : 'bg-white'} ${(userRole === 'admin' || userRole === 'staff') && report.followUp ? 'border-red-300 ring-1 ring-red-200 bg-red-50' : ''} rounded-xl shadow-sm relative overflow-hidden border ${selected ? 'border-blue-300' : (userRole === 'admin' || userRole === 'staff') && report.followUp ? 'border-red-300' : 'border-gray-200'} transition-shadow hover:shadow-md`}>
      {/* left/top accent — clipped by rounded corners */}
      <div className={`hidden sm:block absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${(userRole === 'admin' || userRole === 'staff') && report.followUp ? 'bg-red-500' : 'bg-blue-500'}`} />
      <div className={`block sm:hidden absolute left-0 top-0 right-0 h-1 rounded-t-xl ${(userRole === 'admin' || userRole === 'staff') && report.followUp ? 'bg-red-500' : 'bg-blue-500'}`} />

      <div className="flex flex-col sm:flex-row">

        <div className="flex-1 p-4 md:p-6 sm:pl-6">
          <div className="flex flex-col sm:flex-row sm:items-stretch sm:justify-between">
            <div className="flex-1 pr-0 sm:pr-4">
              <div className="flex items-center gap-3">
                <h4 className="font-semibold text-lg">{report.title}</h4>
                <span className={`ml-2 text-xs px-2 py-1 rounded-full ${statusColor(report.status)}`}>{report.status}</span>
                
                {/* Follow-up Indicator for Admin/Staff */}
                {(userRole === 'admin' || userRole === 'staff') && report.followUp && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 border border-red-200 rounded-full animate-pulse">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    FOLLOW-UP
                  </span>
                )}
                
                {report.tags?.map(tag => (
                  <span key={tag} className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{tag}</span>
                ))}
              </div>

              <div className="text-sm text-gray-600 mt-3">{report.description}</div>

              {/* Follow-up Alert for Admin/Staff */}
              {(userRole === 'admin' || userRole === 'staff') && report.followUp && (
                <div className="mt-4 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-red-800">
                          Tenant Follow-up Required
                        </h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          HIGH PRIORITY
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-red-700">
                        <p>
                          The tenant has followed up on this report, indicating they need urgent attention or are not satisfied with the current progress.
                        </p>
                        {report.followUpDate && (
                          <p className="mt-1 text-xs text-red-600">
                            <strong>Follow-up submitted:</strong> {report.followUpDate}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
              {onChangeStatus ? (
                locked ? (
                  // locked: show a read-only status badge
                  <div className={`mt-2 inline-flex items-center rounded-md px-3 py-2 ${statusColor(report.status)} border`}>{report.status}</div>
                ) : (
                  <div className="mt-2">
                    {/* Current Status Display */}
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">Current Status</div>
                      <div className={`inline-flex items-center rounded-lg px-3 py-2 font-medium ${statusColor(report.status)} border`}>
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                          report.status === 'Resolved' ? 'bg-green-500' : 
                          report.status === 'Rejected' ? 'bg-red-500' : 
                          report.status === 'In Progress' ? 'bg-blue-500' : 'bg-yellow-400'
                        }`} />
                        {report.status}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {getAvailableStatuses(report.status)
                      .filter(status => status !== report.status)
                      .length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs text-gray-500 mb-2">Available Actions</div>
                        <div className="flex flex-col gap-2">
                          {getAvailableStatuses(report.status)
                            .filter(status => status !== report.status)
                            .map(status => (
                              <button
                                key={status}
                                onClick={() => {
                                  if (onRequestChange) onRequestChange(report.id, status, report.title);
                                  else onChangeStatus && onChangeStatus(report.id, status);
                                }}
                                className={`
                                  relative overflow-hidden text-sm font-medium px-4 py-2 rounded-lg 
                                  border transition-all duration-200 transform hover:scale-105 
                                  active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1
                                  ${status === 'Resolved' 
                                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-green-500 shadow-green-200 focus:ring-green-300'
                                    : status === 'Rejected'
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-red-500 shadow-red-200 focus:ring-red-300'
                                    : status === 'In Progress'
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-blue-500 shadow-blue-200 focus:ring-blue-300'
                                    : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white border-yellow-400 shadow-yellow-200 focus:ring-yellow-300'
                                  } shadow-lg hover:shadow-xl
                                `}
                              >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                  {status === 'Resolved' && (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                  )}
                                  {status === 'Rejected' && (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                  )}
                                  {status === 'In Progress' && (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                  )}
                                  {status === 'In Progress' ? 'Start Work' : status === 'Resolved' ? 'Mark Resolved' : status}
                                </span>
                                <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-200"></div>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className={`mt-2 inline-flex items-center rounded-md px-3 py-2 ${statusColor(report.status)} border`}>{report.status}</div>
              )}

              {/* Tenant Follow-up Section */}
              {userRole === 'tenant' && onFollowUp && (
                <div className="mt-4">
                  {report.followUp ? (
                    <div className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-blue-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span className="font-medium">Follow-up submitted</span>
                      </div>
                      {report.followUpDate && (
                        <div className="mt-1 text-blue-600">
                          Followed up on {report.followUpDate}
                        </div>
                      )}
                    </div>
                  ) : report.status === 'Pending' ? (
                    <div className="text-xs">
                      <div className="text-gray-500 mb-2">Need urgent attention?</div>
                      <button
                        onClick={() => onFollowUp(report.id)}
                        className="
                          w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 
                          hover:from-orange-600 hover:to-orange-700 text-white font-medium 
                          rounded-lg border border-orange-500 transition-all duration-200 
                          transform hover:scale-105 active:scale-95 focus:outline-none 
                          focus:ring-2 focus:ring-orange-300 focus:ring-offset-1 shadow-lg hover:shadow-xl
                        "
                      >
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Follow Up
                        </span>
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ReportCard;
