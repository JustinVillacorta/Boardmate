import React, { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import TopNavbar from "../../components/layout/TopNavbar";
import TenantPaymentSummary from "../../components/tenant/TenantPaymentSummary";
import PaymentService from "../../services/paymentService";
import { generateReceiptPDF } from "../../utils/receiptPdfGenerator";
import api from "../../config/api";

interface PaymentsProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  method: string;
  hasReceipt: boolean;
  type: string;
  description: string;
  dueDate: string;
  paidDate?: string;
}

interface PaymentSummary {
  totalPayments: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
  depositStatus: 'paid' | 'pending' | 'none';
  depositAmount: number;
}

const Payments: React.FC<PaymentsProps> = ({ currentPage, onNavigate }) => {
  const [tab, setTab] = useState<'all' | 'deposit' | 'rent' | 'utility' | 'overdue'>('all');
  const [items, setItems] = useState<PaymentRecord[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get authenticated user
        const userResponse = await api.get('/auth/me');
        const userData = userResponse.data.data;
        
        console.log('User Data:', userData);
        
        // Check if user is a tenant
        if (userData.userType !== 'tenant' || !userData.tenant) {
          console.log('User is not a tenant:', userData.userType, userData.tenant);
          throw new Error('This page is only accessible to tenants');
        }
        
        const tenant = userData.tenant;
        const tenantId = tenant._id;
        
        // Store tenant info for receipts
        setTenantName(`${tenant.firstName} ${tenant.lastName}`);
        setRoomNumber(tenant.room?.roomNumber || 'N/A');

        // Fetch payments and summary in parallel
        const [paymentsResponse, summaryResponse] = await Promise.allSettled([
          PaymentService.tenantPayments(tenantId, { sortBy: 'dueDate', sortOrder: 'desc' }),
          PaymentService.tenantSummary(tenantId)
        ]);


        // Handle payments response
        if (paymentsResponse.status === 'rejected') {
          throw new Error('Failed to fetch payments: ' + paymentsResponse.reason?.message);
        }
        const payments = paymentsResponse.value.data?.payments || [];
        
        // Map payments to records
        const rows: PaymentRecord[] = payments.map((p: any) => {
          let status: 'Paid' | 'Pending' | 'Overdue' = 'Pending';
          if (p.status === 'paid') {
            status = 'Paid';
          } else if (p.status === 'overdue') {
            status = 'Overdue';
          }

          return {
            id: p._id,
            date: p.paidDate || p.dueDate,
            dueDate: p.dueDate,
            paidDate: p.paidDate,
            amount: p.amount,
            status,
            method: p.paymentMethod || 'N/A',
            hasReceipt: p.status === 'paid',
            type: p.paymentType,
            description: p.description || '',
          };
        });
        
        setItems(rows);

        // Handle summary response
        if (summaryResponse.status === 'rejected') {
          console.error('Summary API failed:', summaryResponse.reason);
          // Set default summary if API fails
          setSummary({
            totalPayments: payments.length,
            totalPaidAmount: payments.filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + p.amount, 0),
            totalPendingAmount: payments.filter((p: any) => p.status !== 'paid').reduce((sum: number, p: any) => sum + p.amount, 0),
            depositStatus: 'none',
            depositAmount: 0,
          });
          return;
        }

        console.log('Summary Response Success:', summaryResponse.value);

        // Process summary data
        const summaryData = summaryResponse.value.data || {};
        const summaryArray = summaryData.summary || [];
        
        console.log('Summary Data:', summaryData);
        console.log('Summary Array:', summaryArray);
        
        // Calculate totals from the summary array
        let totalPayments = 0;
        let totalPaidAmount = 0;
        let totalPendingAmount = 0;
        let depositAmount = 0;
        let depositStatus: 'paid' | 'pending' | 'none' = 'none';
        
        summaryArray.forEach((item: any) => {
          console.log('Processing item:', item);
          totalPayments += item.count || 0;
          totalPaidAmount += item.paidAmount || 0;
          totalPendingAmount += (item.totalAmount || 0) - (item.paidAmount || 0);
          
          if (item._id === 'deposit') {
            depositAmount = item.totalAmount || 0;
            depositStatus = summaryData.depositStatus || 'none';
          }
        });
        
        console.log('Final calculated summary:', {
          totalPayments,
          totalPaidAmount,
          totalPendingAmount,
          depositStatus,
          depositAmount,
        });
        
        setSummary({
          totalPayments,
          totalPaidAmount,
          totalPendingAmount,
          depositStatus,
          depositAmount,
        });
      } catch (err: any) {
        console.error('Failed to fetch payment data:', err);
        setError(err?.message || 'Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const payments = items.filter((p: any) => {
    if (tab === 'all') return true;
    if (tab === 'overdue') return p.status === 'Overdue';
    return p.type === tab;
  });

  const formatPaymentType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'deposit': 'Security Deposit',
      'rent': 'Monthly Rent',
      'utility': 'Utility',
      'maintenance': 'Maintenance',
      'penalty': 'Penalty',
      'other': 'Other'
    };
    return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownloadReceipt = (payment: PaymentRecord) => {
    generateReceiptPDF({
      id: payment.id,
      description: payment.description || formatPaymentType(payment.type),
      amount: `₱${payment.amount.toLocaleString()}`,
      dueDate: formatDate(payment.dueDate),
      paidDate: payment.paidDate ? formatDate(payment.paidDate) : '',
      status: payment.status,
      paymentMethod: payment.method,
      tenantName: tenantName,
      roomNumber: roomNumber,
      notes: '',
      transactionReference: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentCount = (filterTab: string): number => {
    if (filterTab === 'all') return items.length;
    if (filterTab === 'overdue') return items.filter(p => p.status === 'Overdue').length;
    return items.filter(p => p.type === filterTab).length;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      
      {/* Main Content - Responsive */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
  {/* Top Navigation */}
  <TopNavbar currentPage={currentPage} onNotificationOpen={() => onNavigate && onNavigate('notifications')} />

        {/* Payments Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-600">Loading payment history...</div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
              {error.includes('only accessible to tenants') && (
                <p className="text-red-500 text-sm mt-2">
                  Please log in as a tenant to view payment history.
                </p>
              )}
            </div>
          )}

          {/* Content */}
          {!loading && !error && (
            <>
              {/* Payment Summary */}
              {summary && <TenantPaymentSummary summary={summary} />}

              {/* Filters */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
                <div className="p-4 flex flex-wrap gap-2">
                  <button 
                    onClick={() => setTab('all')} 
                    className={`px-3 py-1 rounded inline-flex items-center gap-2 ${tab==='all'?'bg-blue-600 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    All
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab==='all'?'bg-blue-500':'bg-gray-200'}`}>
                      {getPaymentCount('all')}
                    </span>
                  </button>
                  <button 
                    onClick={() => setTab('deposit')} 
                    className={`px-3 py-1 rounded inline-flex items-center gap-2 ${tab==='deposit'?'bg-blue-600 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Deposit
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab==='deposit'?'bg-blue-500':'bg-gray-200'}`}>
                      {getPaymentCount('deposit')}
                    </span>
                  </button>
                  <button 
                    onClick={() => setTab('rent')} 
                    className={`px-3 py-1 rounded inline-flex items-center gap-2 ${tab==='rent'?'bg-blue-600 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Rent
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab==='rent'?'bg-blue-500':'bg-gray-200'}`}>
                      {getPaymentCount('rent')}
                    </span>
                  </button>
                  <button 
                    onClick={() => setTab('utility')} 
                    className={`px-3 py-1 rounded inline-flex items-center gap-2 ${tab==='utility'?'bg-blue-600 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Utilities
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab==='utility'?'bg-blue-500':'bg-gray-200'}`}>
                      {getPaymentCount('utility')}
                    </span>
                  </button>
                  <button 
                    onClick={() => setTab('overdue')} 
                    className={`px-3 py-1 rounded inline-flex items-center gap-2 ${tab==='overdue'?'bg-red-600 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Overdue
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab==='overdue'?'bg-red-500 text-white':'bg-gray-200'}`}>
                      {getPaymentCount('overdue')}
                    </span>
                  </button>
                </div>
              </div>

              {/* Payment History Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Receipt
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(payment.dueDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatPaymentType(payment.type)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                            {payment.description || formatPaymentType(payment.type)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₱{payment.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {payment.method}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.hasReceipt ? (
                              <button
                                onClick={() => handleDownloadReceipt(payment)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download
                              </button>
                            ) : (
                              <span className="text-gray-400 text-xs">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Empty State */}
              {payments.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                    <p className="text-gray-500">
                      {tab === 'all' 
                        ? 'Your payment records will appear here once you make payments.' 
                        : `No ${tab} payments found.`}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Payments;
