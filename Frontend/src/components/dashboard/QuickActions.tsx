import React from 'react';
import { UserPlus, DollarSign, Wrench, Calendar } from 'lucide-react';

interface QuickActionsProps {
  onAddTenant?: () => void;
  onRecordPayment?: () => void;
  onMaintenanceRequest?: () => void;
  onCheckAvailability?: () => void;
  className?: string;
  userRole?: 'admin' | 'staff';
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onAddTenant,
  onRecordPayment,
  onMaintenanceRequest,
  onCheckAvailability,
  className = '',
  userRole = 'admin'
}) => {
  const actions = [
    {
      id: 'add-tenant',
      label: 'Add New Tenant',
      icon: UserPlus,
      onClick: onAddTenant,
      variant: 'primary' as const,
      description: 'Register a new tenant'
    },
    {
      id: 'record-payment',
      label: 'Record Payment',
      icon: DollarSign,
      onClick: onRecordPayment,
      variant: 'secondary' as const,
      description: 'Log tenant payment'
    },
    {
      id: 'maintenance',
      label: 'Update Maintenance Request',
      icon: Wrench,
      onClick: onMaintenanceRequest,
      variant: 'secondary' as const,
      description: 'Manage maintenance issues'
    },
    {
      id: 'availability',
      label: 'Check Room Availability',
      icon: Calendar,
      onClick: onCheckAvailability,
      variant: 'secondary' as const,
      description: 'View room status'
    }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <p className="text-sm text-gray-500 mt-1">Common tasks and shortcuts</p>
      </div>

      {/* Action Buttons */}
      <div className="p-4 lg:p-6">
        <div className={`grid gap-3 ${
          userRole === 'staff' 
            ? 'grid-cols-1'  // Vertical column for staff
            : 'grid-cols-1 sm:grid-cols-2'  // 2x2 grid for admin
        }`}>
          {actions.map((action) => {
            const IconComponent = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  action.variant === 'primary'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium truncate">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
