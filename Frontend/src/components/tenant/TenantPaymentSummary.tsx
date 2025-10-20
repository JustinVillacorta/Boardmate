import React from 'react';
import { DollarSign, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

interface PaymentSummaryProps {
  summary: {
    totalPayments: number;
    totalPaidAmount: number;
    totalPendingAmount: number;
    depositStatus: 'paid' | 'pending' | 'none';
    depositAmount: number;
  };
}

const TenantPaymentSummary: React.FC<PaymentSummaryProps> = ({ summary }) => {
  const getDepositStatusColor = () => {
    if (summary.depositStatus === 'paid') return 'text-green-600 bg-green-100';
    if (summary.depositStatus === 'pending') return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getDepositStatusText = () => {
    if (summary.depositStatus === 'paid') return 'Paid';
    if (summary.depositStatus === 'pending') return 'Pending';
    return 'N/A';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
      {/* Total Payments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Payments</h3>
          <p className="text-2xl font-bold text-gray-900 mb-1">{summary.totalPayments}</p>
          <p className="text-sm text-gray-600">Payment records</p>
        </div>
      </div>

      {/* Total Paid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Paid</h3>
          <p className="text-2xl font-bold text-green-600 mb-1">
            ₱{summary.totalPaidAmount.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Amount paid</p>
        </div>
      </div>

      {/* Outstanding */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Outstanding</h3>
          <p className="text-2xl font-bold text-orange-600 mb-1">
            ₱{summary.totalPendingAmount.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Amount due</p>
        </div>
      </div>

      {/* Deposit Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-lg ${
            summary.depositStatus === 'paid' ? 'bg-green-100' :
            summary.depositStatus === 'pending' ? 'bg-yellow-100' :
            'bg-gray-100'
          }`}>
            <DollarSign className={`w-5 h-5 ${
              summary.depositStatus === 'paid' ? 'text-green-600' :
              summary.depositStatus === 'pending' ? 'text-yellow-600' :
              'text-gray-600'
            }`} />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Security Deposit</h3>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            ₱{summary.depositAmount.toLocaleString()}
          </p>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDepositStatusColor()}`}>
            {getDepositStatusText()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TenantPaymentSummary;

