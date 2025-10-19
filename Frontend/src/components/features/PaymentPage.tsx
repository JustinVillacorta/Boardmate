import React from 'react';
import Sidebar from '../layout/Sidebar';
import TopNavbar from '../layout/TopNavbar';
import PaymentCard from '../payments/PaymentCard';

interface PaymentRow {
  id: string;
  room: string;
  tenant: string;
  pending: string;
  overdue: string;
  lastPayment: string;
}

const SAMPLE: PaymentRow[] = [
  { id: '1', room: 'Room 111', tenant: 'John Doe', pending: '₱0', overdue: '₱0', lastPayment: 'No payments yet' },
  { id: '2', room: 'Room 20', tenant: 'Keith Pogi', pending: '₱0', overdue: '₱0', lastPayment: 'No payments yet' },
];

interface PaymentPageProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
  userRole?: 'admin' | 'staff';
}

const PaymentPage: React.FC<PaymentPageProps> = ({ currentPage, onNavigate, userRole = 'admin' }) => {
  const [query, setQuery] = React.useState('');

  const filtered = SAMPLE.filter(r =>
    r.room.toLowerCase().includes(query.toLowerCase()) ||
    r.tenant.toLowerCase().includes(query.toLowerCase())
  );
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} userRole={userRole} />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <TopNavbar 
          currentPage={currentPage}
          title="Payment" 
          subtitle={userRole === 'staff' ? "Manage tenant payments and dues" : "Manage your account and preferences"} 
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

                  <div className="w-full sm:w-96">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search rooms..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 lg:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map(row => (
                    <PaymentCard key={row.id} payment={row} onView={(id: string) => {
                      // store selected room info and navigate
                      try { sessionStorage.setItem('selectedPaymentRoom', JSON.stringify({ room: row.room, tenant: row.tenant })); } catch(e){}
                      onNavigate && onNavigate('payment-history');
                    }} />
                  ))}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PaymentPage;
