import React from 'react';
import { Home, DollarSign, Calendar, CheckCircle } from 'lucide-react';

interface TenantInfoCardsProps {
  tenantData: {
    room: string;
    roomType: string;
    monthlyRent: number;
    nextPaymentDue: string;
    accountStatus: string;
  };
}

const TenantInfoCards: React.FC<TenantInfoCardsProps> = ({ tenantData }) => {
  const calculateDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = calculateDaysRemaining(tenantData.nextPaymentDue);

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
          <p className="text-2xl font-bold text-gray-900 mb-1">{tenantData.room}</p>
          <p className="text-sm text-gray-600">{tenantData.roomType}</p>
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
          <p className="text-2xl font-bold text-green-600 mb-1">₱{tenantData.monthlyRent.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Per Month</p>
        </div>
      </div>

      {/* Next Payment Due Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Calendar className="w-5 h-5 text-yellow-600" />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Next Payment Due</h3>
          <p className="text-2xl font-bold text-yellow-600 mb-1">{tenantData.nextPaymentDue}</p>
          <p className="text-sm text-gray-600">{daysRemaining} Days Remaining</p>
        </div>
      </div>

      {/* Account Status Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Account Status</h3>
          <p className="text-2xl font-bold text-green-600 mb-1">{tenantData.accountStatus}</p>
          <p className="text-sm text-gray-600">Active Tenant</p>
        </div>
      </div>
    </div>
  );
};

export default TenantInfoCards;
