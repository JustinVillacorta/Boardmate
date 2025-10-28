import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import { Bell, X } from 'lucide-react';
import NotificationCard from '../../components/notifications/NotificationCard';
import NotificationsSummaryCard from '../../components/notifications/NotificationsSummaryCard';
import CreateAnnouncementForm from '../../components/notifications/CreateAnnouncementForm';
import { notificationService } from '../../services/notificationService';

type NotificationItem = {
  id: string;
  title: string;
  tag?: string;
  excerpt?: string;
  createdAt?: string;
  expiresAt?: string;
  meta?: Record<string, any>;
  read?: boolean;
};

// initial empty list; will be loaded from backend
const MOCK: NotificationItem[] = [];

interface NotificationsPageProps {
  currentPage?: string;
  onNavigate?: (p: string) => void;
  userRole?: 'admin' | 'staff';
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ currentPage, onNavigate, userRole = 'admin' }) => {
  const [list, setList] = React.useState<NotificationItem[]>(MOCK);
  const [query, setQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const unreadCount = list.filter(l => !l.read).length;
  const readCount = list.filter(l => l.read).length;

  const [filterType, setFilterType] = React.useState<'all' | 'read' | 'unread'>('all');
  const [creating, setCreating] = React.useState(false);

  const markRead = async (id: string) => {
    // optimistic update
    setList(prev => prev.map(p => p.id === id ? { ...p, read: true } : p));
    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      // revert on error
      await fetchNotifications();
      alert('Failed to mark notification as read');
    }
  };

  const markAllRead = async () => {
    // optimistic
    setList(prev => prev.map(p => ({ ...p, read: true })));
    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      await fetchNotifications();
      alert('Failed to mark all as read');
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationService.getNotifications({ page: 1, limit: 50, includeRead: true });
      // Map backend notifications to NotificationItem used in UI
      const payload = res;
      let rawList: any[] = [];
      if (Array.isArray(payload?.data?.notifications)) rawList = payload.data.notifications;
      else if (Array.isArray(payload?.notifications)) rawList = payload.notifications;
      else if (Array.isArray(payload?.data)) rawList = payload.data;
      else rawList = [];

      const mapped = (rawList || []).map((n: any) => ({
        id: n._id || n.id,
        title: n.title,
        tag: n.type || undefined,
        excerpt: n.message || n.excerpt || undefined,
        createdAt: n.createdAt ? new Date(n.createdAt).toLocaleString() : undefined,
        expiresAt: n.expiresAt ? new Date(n.expiresAt).toLocaleString() : undefined,
        meta: n.metadata || n.meta || undefined,
        read: n.status === 'read'
      }));
      setList(mapped);
    } catch (err: any) {
      setError(err?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNotification = async (n: NotificationItem) => {
    // Mark read first
    if (!n.read && n.id) {
      await markRead(n.id);
    }
    // set selected
    setSelectedId(n.id || null);

    // Navigate based on metadata or type
    try {
      const meta = n.meta || {};
      // Reports
      if (meta.reportId || meta.report) {
        const reportId = meta.reportId || meta.report;
        // store selected report id so Reports page or detail can pick it up
        localStorage.setItem('selectedReportId', String(reportId));
        onNavigate && onNavigate('reports');
        return;
      }

      // Rooms
      if (meta.roomId || meta.room) {
        const roomId = meta.roomId || meta.room;
        localStorage.setItem('selectedRoomId', String(roomId));
        onNavigate && onNavigate('rooms');
        return;
      }

      // Payments
      if (n.tag === 'payment due' || n.tag === 'payment_due' || meta.type === 'payment_due') {
        onNavigate && onNavigate('payment');
        return;
      }

      // Default: open notifications page (no-op) or navigate to dashboard
      onNavigate && onNavigate('notifications');
    } catch (err) {
      console.error('Navigation from notification failed', err);
    }
  };

  const q = query.trim().toLowerCase();
  const filteredByQuery = q === '' ? list : list.filter(n => {
    const t = (n.title || '').toLowerCase();
    const e = (n.excerpt || '').toLowerCase();
    const tg = (n.tag || '').toLowerCase();
    return t.includes(q) || e.includes(q) || tg.includes(q);
  });

  const displayed = filterType === 'all'
    ? filteredByQuery
    : filterType === 'read'
      ? filteredByQuery.filter(l => l.read)
      : filteredByQuery.filter(l => !l.read);

  // Role-based functionality
  const canCreateAnnouncements = userRole === 'admin'; // Only admin can create announcements

  React.useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When selectedId changes, scroll the element into view and flash a ring
  React.useEffect(() => {
    if (!selectedId) return;
    const el = document.getElementById(`notification-${selectedId}`);
    if (!el) return;
    // Smooth scroll and center into view
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Add smooth flash highlight animation
    el.classList.add('flash-highlight');
    const t = setTimeout(() => {
      el.classList.remove('flash-highlight');
      // clear selected id after animation completes
      setSelectedId(null);
    }, 1200);
    return () => clearTimeout(t);
  }, [selectedId]);

  // Clear any selection when the page changes (so highlight doesn't persist across navigation)
  React.useEffect(() => {
    return () => {
      setSelectedId(null);
    };
  }, [currentPage]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} userRole={userRole} />
  <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
  <TopNavbar
    currentPage={currentPage}
    subtitle={userRole === 'admin' ? 'View notifications and announcements' : 'View and manage notifications'}
    onNotificationOpen={(n) => { if (n) { /* open specific notification */ } else onNavigate && onNavigate('notifications'); }}
    onAnnouncementOpen={() => onNavigate && onNavigate('announcements')}
  />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-full">
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold">Notifications</h1>
                  <p className="text-sm text-gray-500">Showing {displayed.length} notifications</p>
                </div>
                <div className="w-full md:w-1/2">
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search notifications..."
                    className="w-full border rounded-md px-4 py-2 shadow-sm bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {/* segmented control moved to left */}
                <div className="inline-flex rounded-lg bg-white shadow-sm p-1">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-2 rounded-md text-sm ${filterType === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    All ({list.length})
                  </button>
                  <button
                    onClick={() => setFilterType('read')}
                    className={`px-3 py-2 rounded-md text-sm ${filterType === 'read' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    Read ({readCount})
                  </button>
                  <button
                    onClick={() => setFilterType('unread')}
                    className={`px-3 py-2 rounded-md text-sm ${filterType === 'unread' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-3">
                  <button onClick={markAllRead} className="px-4 py-2 bg-green-600 text-white rounded">Mark All Read</button>
                  {canCreateAnnouncements && (
                    <button onClick={() => setCreating(true)} className="px-4 py-2 bg-blue-600 text-white rounded">+ Create Announcement</button>
                  )}
                </div>
                <div className="flex sm:hidden flex-col gap-2">
                  <button onClick={markAllRead} className="px-3 py-2 bg-green-600 text-white rounded">Mark All Read</button>
                  {canCreateAnnouncements && (
                    <button onClick={() => setCreating(true)} className="px-3 py-2 bg-blue-600 text-white rounded">+ Create</button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {loading && <div className="py-8 text-center text-gray-500">Loading notifications...</div>}
              {error && <div className="py-4 text-center text-red-500">{error}</div>}
                {!loading && !error && displayed.map(n => (
                  <NotificationCard key={n.id} n={n} onOpen={handleOpenNotification} selected={n.id === selectedId} />
                ))}
            </div>
            {canCreateAnnouncements && (
              <CreateAnnouncementForm
                open={creating}
                onCancel={() => setCreating(false)}
                onCreate={async ({ title, message }) => {
                    try {
                      await notificationService.createAnnouncement({ title, message });
                      await fetchNotifications();
                      setCreating(false);
                    } catch (err) {
                      alert('Failed to create announcement');
                    }
                  }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;
