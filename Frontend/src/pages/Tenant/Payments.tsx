import React, { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import TopNavbar from "../../components/layout/TopNavbar";
import DownloadDialog from "../../components/ui/DownloadDialog";
import PaymentService from "../../services/paymentService";
import { generateReceiptPDF } from "../../utils/receiptPdfGenerator";

interface PaymentsProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending';
  method: string;
  hasReceipt: boolean;
}

const Payments: React.FC<PaymentsProps> = ({ currentPage, onNavigate }) => {
  const [tab, setTab] = useState<'all' | 'deposit' | 'rent' | 'utility'>('all');
  const [items, setItems] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const tenantId = localStorage.getItem('tenantId');
        const data = await PaymentService.tenantPayments(tenantId || '');
        const payments = data?.data?.payments || [];
        const rows: PaymentRecord[] = payments.map((p: any) => ({
          id: p._id,
          date: p.paymentDate || p.dueDate,
          amount: p.amount,
          status: p.status === 'paid' ? 'Paid' : 'Pending',
          method: p.paymentMethod,
          hasReceipt: p.status === 'paid',
          type: p.paymentType,
        }));
        setItems(rows);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const payments: any[] = items.filter((p: any) => tab === 'all' ? true : p.type === tab);

  const handleDownloadReceipt = (payment: PaymentRecord) => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    generateReceiptPDF({
      id: payment.id,
      description: `Payment - ${payment.date}`,
      amount: `₱${payment.amount.toLocaleString()}`,
      dueDate: payment.date,
      paidDate: payment.date,
      status: payment.status,
      paymentMethod: payment.method,
      tenantName: userData.fullName || userData.name,
      roomNumber: userData.room?.roomNumber,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      
      {/* Main Content - Responsive */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navigation */}
        <TopNavbar currentPage={currentPage} />

        {/* Payments Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
          <div className="p-4 flex gap-2">
            <button onClick={() => setTab('all')} className={`px-3 py-1 rounded ${tab==='all'?'bg-blue-600 text-white':'bg-gray-100'}`}>All</button>
            <button onClick={() => setTab('deposit')} className={`px-3 py-1 rounded ${tab==='deposit'?'bg-blue-600 text-white':'bg-gray-100'}`}>Deposit</button>
            <button onClick={() => setTab('rent')} className={`px-3 py-1 rounded ${tab==='rent'?'bg-blue-600 text-white':'bg-gray-100'}`}>Rent</button>
            <button onClick={() => setTab('utility')} className={`px-3 py-1 rounded ${tab==='utility'?'bg-blue-600 text-white':'bg-gray-100'}`}>Utilities</button>
          </div>
        </div>

        {/* Payment History Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
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
                        {payment.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₱{payment.amount.toLocaleString()}
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.type}
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payment history</h3>
              <p className="text-gray-500">Your payment records will appear here once you make payments.</p>
            </div>
          )}
        </main>
      </div>

    </div>
  );
};

export default Payments;
