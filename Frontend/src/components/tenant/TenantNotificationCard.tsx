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
  onOpen?: (id: string) => void;
}

const TenantNotificationCard: React.FC<TenantNotificationCardProps> = ({ notification, onOpen }) => {
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

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'payment':
        return 'border-l-4 border-blue-500';
      case 'maintenance':
        return 'border-l-4 border-orange-400';
      case 'building':
        return 'border-l-4 border-green-400';
      default:
        return 'border-l-4 border-gray-200';
    }
  };

  const getTag = (type: string) => {
    switch (type) {
      case 'payment':
        return { label: 'payment due', className: 'bg-pink-50 text-pink-600' };
      case 'maintenance':
        return { label: 'maintenance', className: 'bg-orange-50 text-orange-600' };
      case 'building':
        return { label: 'building', className: 'bg-green-50 text-green-600' };
      default:
        return { label: type, className: 'bg-gray-50 text-gray-600' };
    }
  };

  const IconComponent = getIcon(notification.type);

  const tag = getTag(notification.type);

  return (
    <div
      onClick={() => onOpen && onOpen(notification.id)}
      className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${getBorderColor(notification.type)} cursor-pointer`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onOpen && onOpen(notification.id); } }}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={`p-2 rounded-lg ${getIconColor(notification.type)} bg-white`}> 
          <IconComponent className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{notification.title}</h3>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tag.className}`}>{tag.label}</span>
                {notification.isUnread && <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2" />}
              </div>

              {/* Primary line (use description as main content) */}
              <p className="text-sm text-gray-800 mt-3 font-medium">{notification.description}</p>

              {/* Meta row */}
              <div className="text-xs text-gray-500 mt-2">
                <span>{notification.timestamp}</span>
                {/* Placeholder for additional meta if present */}
              </div>
            </div>

            {/* Right action column removed; entire card is clickable to open/mark-read */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantNotificationCard;
