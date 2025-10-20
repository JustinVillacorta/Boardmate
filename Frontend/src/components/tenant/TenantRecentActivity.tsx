import React, { useMemo } from 'react';
import { DollarSign, Wrench, Calendar } from 'lucide-react';

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  status: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface TenantRecentActivityProps {
  payments?: any[];
  reports?: any[];
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 7) {
    return date.toLocaleDateString();
  } else if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMins > 0) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

const TenantRecentActivity: React.FC<TenantRecentActivityProps> = ({ 
  payments = [],
  reports = []
}) => {
  const activities = useMemo(() => {
    // Map payments to activity items
    const paymentActivities: ActivityItem[] = payments.slice(0, 5).map(p => {
      let title = 'Payment Due';
      let status = 'Pending';
      
      if (p.status === 'paid') {
        title = 'Payment Received';
        status = 'Paid';
      } else if (p.status === 'overdue') {
        title = 'Payment Overdue';
        status = 'Overdue';
      }

      return {
        id: p._id,
        title,
        description: `₱${p.amount?.toLocaleString()} ${p.description || 'payment'}`,
        timestamp: p.paidDate || p.dueDate || p.createdAt,
        status,
        icon: DollarSign
      };
    });

    // Map reports to activity items
    const reportActivities: ActivityItem[] = reports.slice(0, 5).map(r => {
      const statusMap: Record<string, string> = {
        'pending': 'Pending',
        'in_progress': 'In Progress',
        'resolved': 'Completed',
        'closed': 'Completed'
      };

      return {
        id: r._id,
        title: `${r.type || 'Maintenance'} Report`,
        description: r.description || 'No description provided',
        timestamp: r.updatedAt || r.createdAt,
        status: statusMap[r.status] || 'Pending',
        icon: Wrench
      };
    });

    // Combine and sort by timestamp
    const allActivities = [...paymentActivities, ...reportActivities]
      .sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return dateB - dateA;
      })
      .slice(0, 10);

    return allActivities;
  }, [payments, reports]);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getIconBgColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-blue-100';
      case 'Pending':
        return 'bg-yellow-100';
      case 'Overdue':
        return 'bg-red-100';
      case 'In Progress':
        return 'bg-yellow-100';
      case 'Completed':
        return 'bg-green-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getIconColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'text-blue-600';
      case 'Pending':
        return 'text-yellow-600';
      case 'Overdue':
        return 'text-red-600';
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
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-lg ${getIconBgColor(activity.status)}`}>
                    <IconComponent className={`w-4 h-4 ${getIconColor(activity.status)}`} />
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
                    <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(activity.timestamp)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantRecentActivity;
