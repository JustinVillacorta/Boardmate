import React from 'react';
import { DollarSign, Wrench, Bell } from 'lucide-react';

interface TenantNotificationCardProps {
  notification: {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    type: 'payment' | 'maintenance' | 'building';
    isUnread: boolean;
  };
}

const TenantNotificationCard: React.FC<TenantNotificationCardProps> = ({ notification }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return DollarSign;
      case 'maintenance':
        return Wrench;
      case 'building':
        return Bell;
      default:
        return Bell;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'payment':
        return 'text-blue-600';
      case 'maintenance':
        return 'text-orange-600';
      case 'building':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const IconComponent = getIcon(notification.type);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${getIconColor(notification.type)}`}>
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {notification.title}
            </h3>
            {notification.isUnread && (
              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
          <p className="text-xs text-gray-500 mt-2">{notification.timestamp}</p>
        </div>
      </div>
    </div>
  );
};

export default TenantNotificationCard;
