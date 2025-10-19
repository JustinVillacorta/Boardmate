import React from 'react';
import Sidebar from '../layout/Sidebar';
import TopNavbar from '../layout/TopNavbar';
import { Bell, X } from 'lucide-react';
import NotificationCard from '../notifications/NotificationCard';
import NotificationsSummaryCard from '../notifications/NotificationsSummaryCard';
import CreateAnnouncementForm from '../notifications/CreateAnnouncementForm';

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

const MOCK: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Utility Bill Due',
    tag: 'payment due',
    excerpt: 'Payment due: ₱3500 by 11/30/2024',
    createdAt: 'Oct 15, 2025, 12:15 AM',
    expiresAt: 'Nov 15, 2025, 09:18 PM',
    meta: { amount: 3500, dueDate: '2024-11-30', utilities: ['electricity', 'water'] },
    read: false,
  },
  {
    id: 'n2',
    title: 'Monthly Rent Due',
    tag: 'payment due',
    excerpt: 'Payment due: ₱15000 by 12/1/2024',
    createdAt: 'Oct 14, 2025, 07:22 AM',
    expiresAt: 'Dec 01, 2025, 00:00 PM',
    meta: { amount: 15000, dueDate: '2024-12-01' },
    read: false,
  },
  {
    id: 'n3',
    title: 'Reminder: Lease Signing',
    tag: 'reminder',
    excerpt: 'Lease signing scheduled on 12/05/2024',
    createdAt: 'Oct 01, 2025, 09:00 AM',
    read: true,
  },
];

interface NotificationsPageProps {
  currentPage?: string;
  onNavigate?: (p: string) => void;
  userRole?: 'admin' | 'staff';
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ currentPage, onNavigate, userRole = 'admin' }) => {
  const [list, setList] = React.useState<NotificationItem[]>(MOCK);
  const [query, setQuery] = React.useState('');

  const unreadCount = list.filter(l => !l.read).length;
  const readCount = list.filter(l => l.read).length;

  const [filterType, setFilterType] = React.useState<'all' | 'read' | 'unread'>('all');
  const [creating, setCreating] = React.useState(false);

  const markRead = (id: string) => setList(prev => prev.map(p => p.id === id ? { ...p, read: true } : p));

  const markAllRead = () => setList(prev => prev.map(p => ({ ...p, read: true })));

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} userRole={userRole} />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <TopNavbar currentPage={currentPage} title="Notifications" subtitle="View and manage notifications" />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-full">
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold">Notifications</h1>
                  <p className="text-sm text-gray-500">
                    {userRole === 'staff' ? 'View notifications and announcements' : 'View and manage notifications'}
                  </p>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <NotificationsSummaryCard title="Total Notifications" value={list.length} />
              <NotificationsSummaryCard title="Unread" value={<span className="text-red-600">{unreadCount}</span>} />
              <NotificationsSummaryCard title="Read" value={<span className="text-green-600">{list.length - unreadCount}</span>} />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-500">Showing {displayed.length} notifications</div>
              <div className="flex items-center gap-3">
                {/* segmented control */}
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
              {displayed.map(n => (
                <NotificationCard key={n.id} n={n} onMarkRead={markRead} />
              ))}
            </div>
            {canCreateAnnouncements && (
              <CreateAnnouncementForm
                open={creating}
                onCancel={() => setCreating(false)}
                onCreate={({ title, message }) => {
                    const id = 'n' + Date.now();
                    const createdAt = new Date().toLocaleString();
                    setList(prev => [{ id, title, tag: 'announcement', excerpt: message, createdAt, read: false }, ...prev]);
                    setCreating(false);
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
