import React, { useState, useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import TopNavbar from "../../components/layout/TopNavbar";
import TenantNotificationCard from "../../components/tenant/TenantNotificationCard";
import { notificationService } from '../../services/notificationService';

interface NotificationsProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ currentPage, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const [notifications, setNotifications] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tabs: All, Read, Unread
  const [activeTab, setActiveTab] = React.useState<'All' | 'Read' | 'Unread'>('All');

  const filteredNotifications = notifications.filter(notification => {
    const matchesQuery = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesQuery) return false;
    if (activeTab === 'All') return true;
    if (activeTab === 'Read') return !notification.isUnread;
    return notification.isUnread; // Unread
  });

  const totalCount = notifications.length;
  const readCount = notifications.filter(n => !n.isUnread).length;
  const unreadCount = notifications.filter(n => n.isUnread).length;

  const markAllRead = () => {
    // optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
    notificationService.markAllAsRead().catch(() => {
      // on error, refetch
      fetchNotifications();
    });
  };

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationService.getNotifications({ page: 1, limit: 50, includeRead: true });
      // backend payload may be nested under data.notifications
      const raw = Array.isArray(res?.data?.notifications) ? res.data.notifications : (Array.isArray(res.notifications) ? res.notifications : (Array.isArray(res.data) ? res.data : []));
      const mapped = (raw || []).map((n: any) => ({
        id: n._id || n.id,
        title: n.title,
        description: n.message || n.excerpt || '',
        timestamp: n.createdAt ? new Date(n.createdAt).toLocaleString() : '',
        type: (n.type === 'payment_due' ? 'payment' : (n.type === 'maintenance' ? 'maintenance' : (n.type === 'announcement' ? 'building' : 'building'))),
        isUnread: n.status !== 'read',
        meta: n.metadata || n.meta || {}
      }));
      setNotifications(mapped);
    } catch (err: any) {
      setError(err?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markRead = async (id: string) => {
    // optimistic
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isUnread: false } : n));
    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      // revert
      fetchNotifications();
    }
  };

  const handleOpenNotification = async (id: string) => {
    const n = notifications.find(x => x.id === id);
    if (!n) return;

    // Mark read if unread
    if (n.isUnread) {
      await markRead(id);
    }

    // Navigate based on metadata
    try {
      const meta = n.meta || {};
      if (meta.reportId || meta.report) {
        const reportId = meta.reportId || meta.report;
        localStorage.setItem('selectedReportId', String(reportId));
        onNavigate && onNavigate('reports');
        return;
      }

      if (meta.roomId || meta.room) {
        const roomId = meta.roomId || meta.room;
        localStorage.setItem('selectedRoomId', String(roomId));
        onNavigate && onNavigate('rooms');
        return;
      }

      if (n.type === 'payment' || n.type === 'payment_due' || meta.type === 'payment_due') {
        onNavigate && onNavigate('payment');
        return;
      }

      // default
      onNavigate && onNavigate('notifications');
    } catch (err) {
      console.error('Failed to navigate from notification', err);
    }
  };

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

          {/* Header with title on the left, search on the right; tabs + counts + mark all read stacked on left */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 pr-6">
                <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
                <div className="text-sm text-gray-500">Showing {filteredNotifications.length} notifications</div>

                {/* Tabs and Mark All Read aligned horizontally */}
                <div className="mt-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setActiveTab('All')} className={`px-3 py-2 rounded-md ${activeTab === 'All' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>All ({totalCount})</button>
                    <button onClick={() => setActiveTab('Read')} className={`px-3 py-2 rounded-md ${activeTab === 'Read' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>Read ({readCount})</button>
                    <button onClick={() => setActiveTab('Unread')} className={`px-3 py-2 rounded-md ${activeTab === 'Unread' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>Unread ({unreadCount})</button>
                  </div>
                </div>
              </div>

              {/* Search on the right */}
              <div className="flex-1 flex items-center justify-end space-x-4 min-w-0">
                <div className="relative w-full min-w-0">
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full min-w-0 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <button onClick={markAllRead} className="px-4 py-2 bg-green-600 text-white rounded-md whitespace-nowrap">Mark All Read</button>
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
                  onOpen={handleOpenNotification}
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
