import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import DownloadDialog from '../../components/ui/DownloadDialog';
import CreatePaymentForm, { PaymentPayload } from '../../components/payments/CreatePaymentForm';

interface PaymentRecord {
  id: string;
  description: string;
  amount: string;
  dueDate: string;
  paidDate?: string;
  status: 'Paid' | 'Due' | 'Overdue';
}

const MOCK: PaymentRecord[] = [
  { id: 'p1', description: 'Monthly rent - October 2025', amount: '₱500', dueDate: '10/5/2025', paidDate: '10/16/2025', status: 'Paid' },
  { id: 'p2', description: 'Utility bill - September 2025', amount: '₱150', dueDate: '9/10/2025', paidDate: '10/16/2025', status: 'Paid' },
  { id: 'p3', description: 'Monthly rent - August 2025', amount: '₱500', dueDate: '8/5/2025', paidDate: '8/3/2025', status: 'Paid' },
];

const PaymentHistory: React.FC<{ currentPage?: string; onNavigate?: (p: string) => void }> = ({ currentPage, onNavigate }) => {
  const [downloadRow, setDownloadRow] = React.useState<PaymentRecord | null>(null);
  const [showCreateForm, setShowCreateForm] = React.useState(false);

  const startDownload = (row: PaymentRecord, fmt: 'csv' | 'json') => {
    if (fmt === 'json') {
      const blob = new Blob([JSON.stringify(row, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${row.id}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } else {
      // simple CSV of the fields
      const headers = ['description', 'amount', 'dueDate', 'paidDate', 'status'];
      const values = [row.description, row.amount, row.dueDate, row.paidDate || '', row.status];
      const csv = headers.join(',') + '\n' + values.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${row.id}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  };
  // read selected room info from sessionStorage
  const sel = typeof window !== 'undefined' ? sessionStorage.getItem('selectedPaymentRoom') : null;
  const parsed = sel ? JSON.parse(sel) : { room: 'Unknown', tenant: '' };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <TopNavbar title="Payment" subtitle="Manage your account and preferences" />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-full">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Payment History</h1>
                <p className="text-sm text-gray-500">{parsed.room} - {parsed.tenant}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  Create Payment
                </button>
              </div>
            </div>

            <section className="bg-white rounded-xl shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-3">Current Outstanding Payments</h3>
              <div className="py-8 text-center text-gray-500">No outstanding payments for this room.</div>
            </section>

            <section className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-3">Payment History</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-b">
                      <th className="py-4 pr-6">Description</th>
                      <th className="py-4 pr-6">Amount</th>
                      <th className="py-4 pr-6">Due Date</th>
                      <th className="py-4 pr-6">Paid Date</th>
                      <th className="py-4 pr-6">Status</th>
                      <th className="py-4 pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {MOCK.map(row => (
                      <tr key={row.id}>
                        <td className="py-4 pr-6">{row.description}</td>
                        <td className="py-4 pr-6 font-medium">{row.amount}</td>
                        <td className="py-4 pr-6">{row.dueDate}</td>
                        <td className="py-4 pr-6">{row.paidDate || '-'}</td>
                        <td className="py-4 pr-6"><span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">{row.status}</span></td>
                        <td className="py-4 pr-6">
                          <button onClick={() => { setDownloadRow(row); }} className="px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-sm">Download</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <DownloadDialog open={!!downloadRow} row={downloadRow} onClose={() => setDownloadRow(null)} onDownload={startDownload} />
            {showCreateForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <div className="fixed inset-0 bg-black/40" onClick={() => setShowCreateForm(false)} />
                <div className="bg-white rounded-xl shadow max-w-3xl w-full z-10 p-6 max-h-[90vh] overflow-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Create Payment</h3>
                    <button aria-label="Close create payment" className="text-gray-500 text-xl leading-none" onClick={() => setShowCreateForm(false)}>×</button>
                  </div>
                  <CreatePaymentForm
                    onCancel={() => setShowCreateForm(false)}
                    onSubmit={(payload: PaymentPayload) => {
                      // TODO: POST to backend; for now log and close
                      // eslint-disable-next-line no-console
                      console.log('CreatePayment (modal) payload', payload);
                      setShowCreateForm(false);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PaymentHistory;
