import React from 'react';
import PaymentService from '../../services/paymentService';
import { userManagementService, StaffAndTenantData } from '../../services/userManagementService';
import UserCard from '../../components/users/UserCard';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import PaymentCard from '../../components/payments/PaymentCard';

interface TenantRow {
  id: string;
  name: string;
  email: string;
  roomNumber: string;
  roomId: string;
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
                  <div className="w-full sm:w-96 flex gap-2 justify-end">
                    <div className="relative">
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
                  </div>
                </div>
              </div>

              <div className="p-4 lg:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map(row => (
                    <div key={row.id} onClick={() => {
                      try {
                        sessionStorage.setItem('selectedPaymentRoom', JSON.stringify({ tenantId: row.id, roomId: row.roomId, tenant: row.name, room: row.roomNumber }));
                      } catch(e) {}
                      onNavigate && onNavigate('payment-history');
                    }} className="cursor-pointer">
                      <UserCard user={{ id: row.id, name: row.name, email: row.email, role: 'Tenant', status: 'Active', startDate: '', roomNumber: row.roomNumber }} />
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
    {/* Tenant selection navigates to dedicated history page */}
    </>
  );
};

export default PaymentPage;
