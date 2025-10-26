import React from 'react';
import PaymentService from '../../services/paymentService';
import { userManagementService, StaffAndTenantData } from '../../services/userManagementService';
import UserCard from '../../components/users/UserCard';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import PaymentCard from '../../components/payments/PaymentCard';
import ExportButton from '../../components/ui/ExportButton';
import { exportToExcel, formatDate } from '../../utils/excelExport';

interface TenantRow {
  id: string;
  name: string;
  email: string;
  roomNumber: string;
  roomId: string;
  startDate: string;
}

interface PaymentPageProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
  userRole?: 'admin' | 'staff';
}

const PaymentPage: React.FC<PaymentPageProps> = ({ currentPage, onNavigate, userRole = 'admin' }) => {
  const [query, setQuery] = React.useState('');
  const [tenants, setTenants] = React.useState<TenantRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [isSortOpen, setIsSortOpen] = React.useState(false);
  const [sortOption, setSortOption] = React.useState<'tenantAZ'|'tenantZA'|'roomAZ'|'roomZA'>('tenantAZ');
  const [isExporting, setIsExporting] = React.useState(false);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await userManagementService.getStaffAndTenants({ userType: 'tenant', tenantStatus: 'active', hasRoom: true, limit: 50, sortBy: 'lastName', sortOrder: 'asc' });
        const records = res?.data?.records || [];
        const mapped: TenantRow[] = records.filter((r: StaffAndTenantData) => r.room?._id).map((r: StaffAndTenantData) => ({
          id: r._id,
          name: r.fullName || `${r.firstName || ''} ${r.lastName || ''}`.trim() || r.email,
          email: r.email,
          roomNumber: r.room?.roomNumber || '-',
          roomId: r.room?._id || '',
          startDate: r.leaseStartDate ? new Date(r.leaseStartDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }) : (r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }) : ''),
        }));
        setTenants(mapped);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = tenants.filter(r =>
    r.roomNumber.toLowerCase().includes(query.toLowerCase()) ||
    r.name.toLowerCase().includes(query.toLowerCase()) ||
    r.email.toLowerCase().includes(query.toLowerCase())
  );

  // Apply client-side sorting based on selected option
  const sorted = [...filtered].sort((a, b) => {
    const tenantCompare = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    const roomCompare = a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true, sensitivity: 'base' });

    if (sortOption === 'tenantAZ') return tenantCompare || a.id.localeCompare(b.id);
    if (sortOption === 'tenantZA') return -tenantCompare || a.id.localeCompare(b.id);
    if (sortOption === 'roomAZ') return roomCompare || tenantCompare || a.id.localeCompare(b.id);
    if (sortOption === 'roomZA') return -roomCompare || tenantCompare || a.id.localeCompare(b.id);
    return 0;
  });

  // Export functionality
  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Fetch all tenants
      const tenantsRes = await userManagementService.getStaffAndTenants({ 
        userType: 'tenant', 
        tenantStatus: 'active', 
        hasRoom: true, 
        limit: 1000 
      });
      
      const tenantRecords = tenantsRes?.data?.records || [];
      const outstandingPayments: any[] = [];
      const paidPayments: any[] = [];
      
      // Fetch payments for each tenant
      for (const tenant of tenantRecords) {
        const tenantId = tenant._id;
        try {
          const paymentsData = await PaymentService.tenantPayments(tenantId, { 
            sortBy: 'dueDate', 
            sortOrder: 'asc', 
            limit: 1000 
          });
          
          const payments = paymentsData?.data?.payments || [];
          const tenantName = tenant.fullName || `${tenant.firstName || ''} ${tenant.lastName || ''}`.trim() || tenant.email;
          const roomNumber = tenant.room?.roomNumber || '-';
          
          payments.forEach((p: any) => {
            const paymentRow = {
              'Tenant Name': tenantName,
              'Room Number': roomNumber,
              'Description': p.description || `${p.paymentType || ''} - ${p.periodCovered?.startDate ? new Date(p.periodCovered.startDate).toLocaleDateString() : ''}`,
              'Amount': `₱${(p.amount + (p.lateFee?.amount || 0)).toLocaleString()}`,
              'Due Date': p.dueDate ? formatDate(p.dueDate) : '-',
              'Paid Date': p.paymentDate ? formatDate(p.paymentDate) : '-',
              'Status': p.status === 'paid' ? 'Paid' : (p.status === 'overdue' ? 'Overdue' : 'Due'),
              'Payment Method': p.paymentMethod || '-',
              'Transaction Reference': p.transactionReference || '-',
              'Notes': p.notes || '-'
            };
            
            if (p.status === 'paid') {
              paidPayments.push(paymentRow);
            } else {
              outstandingPayments.push(paymentRow);
            }
          });
        } catch (err) {
          console.error(`Error fetching payments for tenant ${tenantId}:`, err);
        }
      }
      
      // Prepare multi-sheet data
      const sheetsData = [
        outstandingPayments.length > 0 ? outstandingPayments.map(p => Object.values(p)) : [],
        paidPayments.length > 0 ? paidPayments.map(p => Object.values(p)) : []
      ];
      
      // Add headers
      const headers = ['Tenant Name', 'Room Number', 'Description', 'Amount', 'Due Date', 'Paid Date', 'Status', 'Payment Method', 'Transaction Reference', 'Notes'];
      sheetsData[0] = [headers, ...sheetsData[0]];
      sheetsData[1] = [headers, ...sheetsData[1]];
      
      await exportToExcel(sheetsData, 'payments_export', { 
        sheetNames: ['Outstanding Payments', 'Payment History']
      });
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export payments. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <>
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} userRole={userRole} />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <TopNavbar 
          currentPage={currentPage}
          title="Payment" 
          subtitle={userRole === 'staff' ? "Manage tenant payments and dues" : "Manage your account and preferences"} 
          // onSearch removed
          onNotificationOpen={() => onNavigate && onNavigate('notifications')}
        />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-full">

            <section className="bg-white rounded-xl shadow p-6">
              <div className="p-4 lg:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Payment Management</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {userRole === 'staff' ? 'Manage tenant payments and dues' : 'Manage tenant payments and dues'}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                    <div className="relative w-full sm:w-96">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search tenants or rooms..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>

                    <button
                      onClick={() => setIsSortOpen(true)}
                      className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm hover:bg-gray-50"
                    >
                      Sort
                    </button>
                    <ExportButton onClick={handleExport} loading={isExporting} />
                  </div>
                </div>
              </div>

              <div className="p-4 lg:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sorted.map(row => (
                    <div key={row.id} onClick={() => {
                      try {
                        sessionStorage.setItem('selectedPaymentRoom', JSON.stringify({ tenantId: row.id, roomId: row.roomId, tenant: row.name, room: row.roomNumber }));
                      } catch(e) {}
                      onNavigate && onNavigate('payment-history');
                    }} className="cursor-pointer">
                      <UserCard user={{ id: row.id, name: row.name, email: row.email, role: 'Tenant', status: 'Active', startDate: row.startDate, roomNumber: row.roomNumber }} />
                    </div>
                  ))}
                </div>
                {loading && (
                  <div className="text-sm text-gray-500 mt-4">Loading tenants...</div>
                )}
                {!loading && filtered.length === 0 && (
                  <div className="text-sm text-gray-500 mt-4">No tenants found.</div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
    {/* Sort Floating Panel */}
    {isSortOpen && (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0" onClick={() => setIsSortOpen(false)} />
        <div className="absolute right-6 top-24 w-72 bg-white border border-gray-200 p-4 rounded-lg shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Sort Payments</h3>
            <button onClick={() => setIsSortOpen(false)} className="text-gray-500 text-xl leading-none">×</button>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input type="radio" name="paymentSort" value="tenantAZ" checked={sortOption === 'tenantAZ'} onChange={() => setSortOption('tenantAZ')} />
              <span className="text-sm">Tenant (A → Z)</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="paymentSort" value="tenantZA" checked={sortOption === 'tenantZA'} onChange={() => setSortOption('tenantZA')} />
              <span className="text-sm">Tenant (Z → A)</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="paymentSort" value="roomAZ" checked={sortOption === 'roomAZ'} onChange={() => setSortOption('roomAZ')} />
              <span className="text-sm">Room (A → Z)</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="paymentSort" value="roomZA" checked={sortOption === 'roomZA'} onChange={() => setSortOption('roomZA')} />
              <span className="text-sm">Room (Z → A)</span>
            </label>
          </div>
        </div>
      </div>
    )}
    {/* Tenant selection navigates to dedicated history page */}
    </>
  );
};

export default PaymentPage;
