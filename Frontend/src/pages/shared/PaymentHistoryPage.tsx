import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import DownloadDialog from '../../components/ui/DownloadDialog';
import CreatePaymentForm, { PaymentPayload } from '../../components/payments/CreatePaymentForm';
import MarkAsPaidForm, { default as _MarkAsPaidForm } from '../../components/payments/MarkAsPaidForm';
import PaymentService from '../../services/paymentService';

interface PaymentRecord {
  id: string;
  description: string;
  amount: string;
  dueDate: string;
  paidDate?: string;
  status: 'Paid' | 'Due' | 'Overdue';
  paymentMethod?: string;
  transactionReference?: string;
  notes?: string;
}

interface PaymentHistoryPageProps {
  currentPage?: string;
  onNavigate?: (p: string) => void;
  userRole?: 'admin' | 'staff';
}

const PaymentHistoryPage: React.FC<PaymentHistoryPageProps> = ({ currentPage, onNavigate, userRole = 'admin' }) => {
  const [downloadRow, setDownloadRow] = React.useState<PaymentRecord | null>(null);
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [outstanding, setOutstanding] = React.useState<PaymentRecord[]>([]);
  const [history, setHistory] = React.useState<PaymentRecord[]>([]);
  const [payingRow, setPayingRow] = React.useState<PaymentRecord | null>(null);
  const [payForm, setPayForm] = React.useState({ paymentDate: '', paymentMethod: 'cash', transactionReference: '', notes: '' });
  const [depositStatus, setDepositStatus] = React.useState<'paid' | 'pending' | 'none' | undefined>(undefined);
  const [loading, setLoading] = React.useState(false);
  // read selected room info from sessionStorage
  const sel = typeof window !== 'undefined' ? sessionStorage.getItem('selectedPaymentRoom') : null;
  const parsed = sel ? JSON.parse(sel) : { room: 'Unknown', tenant: '', tenantId: '', roomId: '' };

  const refresh = React.useCallback(async () => {
    // Re-read from sessionStorage inside callback
    const freshSel = typeof window !== 'undefined' ? sessionStorage.getItem('selectedPaymentRoom') : null;
    const freshParsed = freshSel ? JSON.parse(freshSel) : { room: 'Unknown', tenant: '', tenantId: '', roomId: '' };
    
    if (!freshParsed.tenantId) {
      console.error('No tenantId in sessionStorage');
      return;
    }
    setLoading(true);
    try {
      console.log('Fetching payments for tenant:', freshParsed.tenantId);
      const data = await PaymentService.tenantPayments(freshParsed.tenantId, { sortBy: 'dueDate', sortOrder: 'asc', limit: 100 });
      const payments = data?.data?.payments || [];
      const toRow = (p: any): PaymentRecord => ({
        id: p._id,
        description: p.description || `${p.paymentType} - ${p.periodCovered?.startDate ? new Date(p.periodCovered.startDate).toLocaleDateString() : ''}`,
        amount: `₱${(p.amount + (p.lateFee?.amount || 0)).toLocaleString()}`,
        dueDate: p.dueDate ? new Date(p.dueDate).toLocaleDateString() : '-',
        paidDate: p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : undefined,
        status: p.status === 'paid' ? 'Paid' : (p.status === 'overdue' ? 'Overdue' : 'Due'),
        paymentMethod: p.paymentMethod,
        transactionReference: p.transactionReference,
        notes: p.notes,
      });
      const out = payments.filter((p: any) => p.status !== 'paid').map(toRow);
      const hist = payments.filter((p: any) => p.status === 'paid').map(toRow);
      setOutstanding(out);
      setHistory(hist);

      const summary = await PaymentService.tenantSummary(freshParsed.tenantId);
      setDepositStatus(summary?.data?.depositStatus);
      console.log('Payments loaded:', { outstanding: out.length, history: hist.length, depositStatus: summary?.data?.depositStatus });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error fetching payments:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  // Role-based functionality
  const canCreatePayments = userRole === 'admin' || userRole === 'staff'; // Admin and staff can create payments
  const canMarkAsPaid = userRole === 'admin' || userRole === 'staff'; // Both can mark as paid
  const canDownload = userRole === 'admin' || userRole === 'staff'; // admin and staff can download

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} userRole={userRole} />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <TopNavbar 
          currentPage={currentPage}
          title="Payment" 
          subtitle={userRole === 'staff' ? "Manage tenant payments and dues" : "Manage your account and preferences"} 
          // onSearch removed
          onNotificationOpen={() => onNavigate && onNavigate('notifications')}
          onAnnouncementOpen={() => onNavigate && onNavigate('announcements')}
        />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-full">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onNavigate && onNavigate('payment')}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <div>
                  <h1 className="text-2xl font-semibold">Payment History</h1>
                  <p className="text-sm text-gray-500">{parsed.room} - {parsed.tenant}</p>
                </div>
              </div>
              {canCreatePayments && (
                <div className="flex items-center space-x-3">
                  {depositStatus && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${depositStatus==='paid'?'bg-green-100 text-green-800':depositStatus==='pending'?'bg-yellow-100 text-yellow-800':'bg-gray-100 text-gray-800'}`}>
                      Deposit: {depositStatus}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    Create Payment
                  </button>
                </div>
              )}
            </div>

            <section className="bg-white rounded-xl shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-3">Current Outstanding Payments</h3>
              {loading && <div className="text-sm text-gray-500">Loading...</div>}
              {!loading && outstanding.length === 0 && (
                <div className="text-sm text-gray-500 py-4">No outstanding payments</div>
              )}
              {!loading && outstanding.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-b">
                      <th className="py-3 pr-6">Description</th>
                      <th className="py-3 pr-6">Amount</th>
                      <th className="py-3 pr-6">Due Date</th>
                      <th className="py-3 pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {outstanding.map(row => (
                      <tr key={row.id}>
                        <td className="py-3 pr-6">{row.description}</td>
                        <td className="py-3 pr-6 font-medium">{row.amount}</td>
                        <td className="py-3 pr-6">{row.dueDate}</td>
                        <td className="py-3 pr-6">
                          {canMarkAsPaid && (
                            <button
                              onClick={() => {
                                setPayingRow(row);
                                const today = new Date();
                                const yyyy = today.getFullYear();
                                const mm = String(today.getMonth() + 1).padStart(2, '0');
                                const dd = String(today.getDate()).padStart(2, '0');
                                setPayForm({ paymentDate: `${yyyy}-${mm}-${dd}`, paymentMethod: 'cash', transactionReference: '', notes: '' });
                              }}
                              className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm"
                            >
                              Mark as Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </section>

            <section className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-3">Payment History</h3>
              {!loading && history.length === 0 && (
                <div className="text-sm text-gray-500 py-4">No payment history</div>
              )}
              {!loading && history.length > 0 && (
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
                    {history.map(row => (
                      <tr key={row.id}>
                        <td className="py-4 pr-6">{row.description}</td>
                        <td className="py-4 pr-6 font-medium">{row.amount}</td>
                        <td className="py-4 pr-6">{row.dueDate}</td>
                        <td className="py-4 pr-6">{row.paidDate || '-'}</td>
                        <td className="py-4 pr-6"><span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">{row.status}</span></td>
                        <td className="py-4 pr-6">
                          {canDownload && (
                            <button onClick={() => { setDownloadRow(row); }} className="px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-sm">Download</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </section>
            {canDownload && (
              <DownloadDialog 
                open={!!downloadRow} 
                row={downloadRow} 
                onClose={() => setDownloadRow(null)} 
                tenantName={parsed.tenant}
                roomNumber={parsed.room}
              />
            )}
            {/* Mark as Paid modal (component) */}
            {payingRow && canMarkAsPaid && (
              <React.Suspense>
                {/* lazy-free render: MarkAsPaidForm is local so normal import */}
                <MarkAsPaidForm
                  open={!!payingRow}
                  initial={{ paymentDate: payForm.paymentDate, paymentMethod: payForm.paymentMethod, transactionReference: payForm.transactionReference, notes: payForm.notes }}
                  onCancel={() => setPayingRow(null)}
                  onSubmit={async (data: { paymentDate: string; paymentMethod: string; transactionReference: string; notes?: string }) => {
                    if (!payingRow) return;
                    try {
                      await PaymentService.markPaid(payingRow.id, { transactionReference: data.transactionReference, notes: data.notes });
                      setPayingRow(null);
                      await refresh();
                    } catch (e) {
                      // eslint-disable-next-line no-console
                      console.error(e);
                    }
                  }}
                />
              </React.Suspense>
            )}
            {showCreateForm && canCreatePayments && (
              <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <div className="fixed inset-0 bg-black/40" onClick={() => setShowCreateForm(false)} />
                <div className="bg-white rounded-xl shadow max-w-3xl w-full z-10 p-6 max-h-[90vh] overflow-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Create Payment</h3>
                    <button aria-label="Close create payment" className="text-gray-500 text-xl leading-none" onClick={() => setShowCreateForm(false)}>×</button>
                  </div>
                  <CreatePaymentForm
                    onCancel={() => setShowCreateForm(false)}
                    onSubmit={async (payload: PaymentPayload) => {
                      try {
                        const freshSel = typeof window !== 'undefined' ? sessionStorage.getItem('selectedPaymentRoom') : null;
                        const freshParsed = freshSel ? JSON.parse(freshSel) : { tenantId: '', roomId: '' };
                        if (!freshParsed.tenantId || !freshParsed.roomId) { alert('No tenant/room in context'); return; }
                        // Cast to CreatePaymentDTO to satisfy stricter paymentType union in service types
                        await PaymentService.create({ ...payload, tenant: freshParsed.tenantId, room: freshParsed.roomId } as any);
                        setShowCreateForm(false);
                        await refresh();
                      } catch (e) {
                        // eslint-disable-next-line no-console
                        console.error(e);
                      }
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

export default PaymentHistoryPage;
