import React from 'react';

interface PaymentRow {
  id: string;
  room: string;
  tenant: string;
  pending: string;
  overdue: string;
  lastPayment: string;
}

interface Props {
  payment: PaymentRow;
  onView: (id: string) => void;
}

const PaymentCard: React.FC<Props> = ({ payment, onView }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow min-h-[170px] flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-sm text-gray-500">Room</div>
            <div className="text-lg font-semibold text-gray-800">{payment.room}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Tenant</div>
            <div className="text-lg font-medium text-gray-700">{payment.tenant}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
          <div>
            <div className="text-xs text-gray-500">Pending</div>
            <div className="font-medium text-gray-700">{payment.pending}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Overdue</div>
            <div className="font-medium text-gray-700">{payment.overdue}</div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div>
          <div className="text-sm text-gray-500">Last Payment</div>
          <div className="text-sm text-gray-700">{payment.lastPayment}</div>
        </div>

        <div className="mt-4">
          <button onClick={() => onView(payment.id)} className="w-full px-4 py-2 rounded-md bg-blue-600 text-white text-sm shadow-sm">View Payments</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCard;
