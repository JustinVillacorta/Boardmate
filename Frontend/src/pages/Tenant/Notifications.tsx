import React, { useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import TopNavbar from "../../components/layout/TopNavbar";
import TenantNotificationCard from "../../components/tenant/TenantNotificationCard";

interface NotificationsProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ currentPage, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Hardcoded notifications
  const notifications = [
    {
      id: '1',
      title: 'Payment Due Soon',
      description: 'Your rent payment is due in 3 days.',
      timestamp: '2 hours ago',
      type: 'payment' as const,
      isUnread: true
    },
    {
      id: '2',
      title: 'Maintenance Complete',
      description: 'Your faucet repair has been completed.',
      timestamp: '14 hours ago',
      type: 'maintenance' as const,
      isUnread: true
    },
    {
      id: '3',
      title: 'Building Notice',
      description: 'Scheduled maintenance in common areas this weekend.',
      timestamp: '1 day ago',
      type: 'building' as const,
      isUnread: false
    }
  ];

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      
      {/* Main Content - Responsive */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navigation */}
        <TopNavbar currentPage={currentPage} />

        {/* Notifications Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">View and manage notifications.</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <TenantNotificationCard
                  key={notification.id}
                  notification={notification}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'No notifications found' : 'No notifications yet'}
                </h3>
                <p className="text-gray-500">
                  {searchQuery 
                    ? `No notifications match "${searchQuery}"`
                    : 'You\'ll see notifications about payments, maintenance, and building updates here.'
                  }
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Notifications;
