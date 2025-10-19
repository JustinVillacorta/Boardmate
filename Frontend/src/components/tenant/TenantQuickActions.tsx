import React from 'react';
import { DollarSign, Wrench, User } from 'lucide-react';

interface TenantQuickActionsProps {
  onViewPaymentHistory: () => void;
  onSubmitMaintenanceRequest: () => void;
  onUpdateProfile: () => void;
}

const TenantQuickActions: React.FC<TenantQuickActionsProps> = ({
  onViewPaymentHistory,
  onSubmitMaintenanceRequest,
  onUpdateProfile
}) => {
  const actions = [
    {
      id: 'view-payment-history',
      label: 'View Payment History',
      icon: DollarSign,
      onClick: onViewPaymentHistory,
      variant: 'primary' as const,
      description: 'Check your payment records'
    },
    {
      id: 'submit-maintenance',
      label: 'Submit Maintenance Request',
      icon: Wrench,
      onClick: onSubmitMaintenanceRequest,
      variant: 'secondary' as const,
      description: 'Report maintenance issues'
    },
    {
      id: 'update-profile',
      label: 'Update Profile',
      icon: User,
      onClick: onUpdateProfile,
      variant: 'secondary' as const,
      description: 'Manage your account'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <p className="text-sm text-gray-500 mt-1">Common tasks and shortcuts</p>
      </div>

      {/* Action Buttons - Vertical Layout */}
      <div className="p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-3">
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
                <IconComponent className="w-5 h-5 flex-shrink-0" />
                <div className="text-left">
                  <span className="text-sm font-medium block">{action.label}</span>
                  <span className="text-xs opacity-75">{action.description}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TenantQuickActions;
