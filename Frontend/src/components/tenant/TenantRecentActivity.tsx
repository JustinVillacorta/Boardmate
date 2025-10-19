import React from 'react';
import { DollarSign, Wrench, Calendar } from 'lucide-react';

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'Paid' | 'In Progress' | 'Completed';
  icon: React.ComponentType<{ className?: string }>;
}

interface TenantRecentActivityProps {
  activities?: ActivityItem[];
}

const TenantRecentActivity: React.FC<TenantRecentActivityProps> = ({ 
  activities = [
    {
      id: '1',
      title: 'Payment Received',
      description: '$750 rent payment for March',
      timestamp: '2 hours ago',
      status: 'Paid',
      icon: DollarSign
    },
    {
      id: '2',
      title: 'AC Repair Update',
      description: 'Technician assigned, scheduled for tomorrow',
      timestamp: '1 day ago',
      status: 'In Progress',
      icon: Wrench
    },
    {
      id: '3',
      title: 'Payment Due Soon',
      description: 'April rent due in 3 days',
      timestamp: '2 days ago',
      status: 'Completed',
      icon: Calendar
    }
  ]
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getIconColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'text-blue-600';
      case 'In Progress':
        return 'text-yellow-600';
      case 'Completed':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <p className="text-sm text-gray-500 mt-1">Your latest payments and requests</p>
      </div>

      {/* Activity List */}
      <div className="p-4 lg:p-6">
        <div className="space-y-4">
          {activities.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-lg ${getIconColor(activity.status)}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TenantRecentActivity;
