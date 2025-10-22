

import React from 'react';
import { Home, DollarSign, Calendar, CheckCircle } from 'lucide-react';

interface TenantInfoCardsProps {
  tenant: {
    tenantStatus: 'active' | 'inactive' | 'pending';
    room?: any; // Accept any to allow tenants array and monthlyRent
    monthlyRent: number;
  };
  nextPaymentDue: {
    date: string | null;
    status: 'paid' | 'pending' | 'overdue';
    daysRemaining: number;
  };
}


const TenantInfoCards: React.FC<TenantInfoCardsProps> = ({ tenant, nextPaymentDue }) => {

  const formatPaymentDueDate = () => {
    if (nextPaymentDue.status === 'overdue') {
      return 'Overdue';
    }
    if (nextPaymentDue.date) {
      return new Date(nextPaymentDue.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
    return 'N/A';
  };

  const getAccountStatusDisplay = () => {
    return tenant.tenantStatus.charAt(0).toUpperCase() + tenant.tenantStatus.slice(1);
  };

  const getAccountStatusColor = () => {
    if (tenant.tenantStatus === 'active') return 'text-green-600 bg-green-100';
    if (tenant.tenantStatus === 'inactive') return 'text-red-600 bg-red-100';
    return 'text-yellow-600 bg-yellow-100';
  };


  // Calculate per-tenant rent if room info and tenants are available
  let perTenantRent: number | null = null;
  let numActive = 1;
  if (tenant.room && typeof tenant.room.monthlyRent === 'number' && Array.isArray(tenant.room.tenants)) {
    const activeTenants = tenant.room.tenants.filter((t: any) => t.tenantStatus === 'active');
    numActive = activeTenants.length || 1;
    perTenantRent = tenant.room.monthlyRent / numActive;
  } else if (typeof tenant.monthlyRent === 'number') {
    perTenantRent = tenant.monthlyRent;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {/* Room Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Home className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Room</h3>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {tenant.room?.roomNumber || 'N/A'}
          </p>
          <p className="text-sm text-gray-600">
            {tenant.room?.roomType || 'Not Assigned'}
          </p>
        </div>
      </div>

      {/* Monthly Rent Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Monthly Rent</h3>
          <p className="text-2xl font-bold text-green-600 mb-1">
            {perTenantRent !== null
              ? `₱${perTenantRent.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
              : `₱${tenant.monthlyRent?.toLocaleString() || '0'}`}
          </p>
          <p className="text-sm text-gray-600">
            Per Month (Your Share)
            {tenant.room && Array.isArray(tenant.room.tenants) && tenant.room.tenants.length > 1 }
          </p>
        </div>
      </div>

      {/* Next Payment Due Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-lg ${
            nextPaymentDue.status === 'overdue' ? 'bg-red-100' : 
            nextPaymentDue.status === 'paid' ? 'bg-green-100' : 
            'bg-yellow-100'
          }`}>
            <Calendar className={`w-5 h-5 ${
              nextPaymentDue.status === 'overdue' ? 'text-red-600' : 
              nextPaymentDue.status === 'paid' ? 'text-green-600' : 
              'text-yellow-600'
            }`} />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Next Payment Due</h3>
          <p className={`text-2xl font-bold mb-1 ${(() => {
            if (nextPaymentDue.status === 'overdue') return 'text-red-600';
            if (nextPaymentDue.status === 'paid') return 'text-green-600';
            return 'text-yellow-600';
          })()}`}>
            {formatPaymentDueDate()}
          </p>
          <p className="text-sm text-gray-600">
            {nextPaymentDue.status === 'overdue' 
              ? 'Payment is overdue' 
              : `${nextPaymentDue.daysRemaining} Days Remaining`
            }
          </p>
        </div>
      </div>

      {/* Account Status Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-lg ${
            tenant.tenantStatus === 'active' ? 'bg-green-100' :
            tenant.tenantStatus === 'inactive' ? 'bg-red-100' :
            'bg-yellow-100'
          }`}>
            <CheckCircle className={`w-5 h-5 ${
              tenant.tenantStatus === 'active' ? 'text-green-600' :
              tenant.tenantStatus === 'inactive' ? 'text-red-600' :
              'text-yellow-600'
            }`} />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Account Status</h3>
          <p className={`text-2xl font-bold mb-1 ${
            tenant.tenantStatus === 'active' ? 'text-green-600' :
            tenant.tenantStatus === 'inactive' ? 'text-red-600' :
            'text-yellow-600'
          }`}>
            {getAccountStatusDisplay()}
          </p>
          <p className="text-sm text-gray-600">
            {tenant.tenantStatus === 'active' ? 'Active Tenant' : 
             tenant.tenantStatus === 'inactive' ? 'Inactive Tenant' :
             'Pending Activation'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TenantInfoCards;
