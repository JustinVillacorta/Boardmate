import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { notificationService } from '../../services/notificationService';
import { normalizeUserFromLocalStorage } from '../../utils/userUtils';
import RoleBadge from '../ui/RoleBadge';

interface TopNavbarProps {
  title?: string;
  subtitle?: string;
  currentPage?: string;
  // Called when the notifications panel is opened
  // When the notifications panel opens or a notification is clicked,
  // we call this with an optional notification payload.
  onNotificationOpen?: (notification?: any) => void;
  // Allow pages to hide notifications when needed
  showNotifications?: boolean;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ 
  title, 
  subtitle,
  currentPage,
  onNotificationOpen,
  showNotifications,
}) => {
  // Get page-specific title and subtitle based on currentPage
  const getPageInfo = (page?: string) => {
    switch (page) {
      case 'dashboard':
        return {
          title: 'Dashboard',
          subtitle: 'Your room info, payments, and account status'
        };
      case 'payments':
        return {
          title: 'Payments',
          subtitle: 'Your payment history and upcoming dues'
        };
      case 'reports':
        return {
          title: 'Reports',
          subtitle: 'Submit and track your complaints and maintenance requests'
        };
      case 'notifications':
        return {
          title: 'Notifications',
          subtitle: 'View and manage notifications'
        };
      case 'profile':
        return {
          title: 'Profile',
          subtitle: 'Manage your account and preferences'
        };
      default:
        return {
          // If explicit props are provided, prefer them; otherwise fall back to defaults
          title: title || 'Dashboard',
          subtitle: subtitle || 'Your room info, payments, and account status'
        };
    }
  };

  // If caller passed an explicit title/subtitle, use them; otherwise derive from page
  const derived = getPageInfo(currentPage);
  const pageInfo = {
    title: title || derived.title,
    subtitle: subtitle || derived.subtitle,
  };
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  // ...existing code...
  const [notifications, setNotifications] = useState<Array<any>>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Load notifications when component mounts (optional) and when dropdown opened
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingNotifications(true);
      try {
        const res = await notificationService.getNotifications({ page: 1, limit: 20, includeRead: true });
        if (!mounted) return;
        // Normalize response: try common shapes
        const raw = res?.data?.notifications || res?.notifications || res?.data || [];
        const arr = Array.isArray(raw) ? raw : [];
        const normalized = arr.map((n: any) => ({
          // canonical id for UI
          id: n._id || n.id || String(n.id || n._id || Math.random()),
          originalId: n._id || n.id,
          title: n.title || n.excerpt || n.message || '',
          message: n.message || n.excerpt || '',
          createdAt: n.createdAt,
          read: (n.read === true) || (n.status === 'read') || (n.isUnread === false) ? true : false,
          raw: n,
        }));
        setNotifications(normalized);
      } catch (e) {
        // ignore for now
        setNotifications([]);
      } finally {
        setLoadingNotifications(false);
      }
    };

    // initial load
    load();

    return () => { mounted = false; };
  }, []);

  // ...existing code...

  return (
    <header className="bg-blue-50 shadow-sm border-b border-gray-200 px-4 lg:px-6 py-4 lg:py-9 relative">
      <div className="flex items-center justify-between h-auto lg:h-10">
        {/* Left: Logo/Title - Responsive */}
        <div className="cursor-pointer flex flex-col items-start">
          <h1 className="text-xl lg:text-3xl font-semibold text-gray-800">
            {pageInfo.title}
          </h1>
          <p className="text-xs lg:text-sm text-gray-400 hidden sm:block">
            {pageInfo.subtitle}
          </p>
        </div>

        {/* Right - Responsive */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Search removed as requested */}

          {/* Notifications */}
          {showNotifications !== false && (
            <div className="relative">
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-gray-700 relative rounded-lg"
                onClick={async () => {
                  const next = !notificationsOpen;
                  setNotificationsOpen(next);
                  if (next) {
                    // refresh unread/notifications
                    try {
                      setLoadingNotifications(true);
                      const res = await notificationService.getNotifications({ page: 1, limit: 20, includeRead: true });
                      const raw = res?.data?.notifications || res?.notifications || res?.data || [];
                      const arr = Array.isArray(raw) ? raw : [];
                      const normalized = arr.map((n: any) => ({
                        id: n._id || n.id || String(n.id || n._id || Math.random()),
                        originalId: n._id || n.id,
                        title: n.title || n.excerpt || n.message || '',
                        message: n.message || n.excerpt || '',
                        createdAt: n.createdAt,
                        read: (n.read === true) || (n.status === 'read') || (n.isUnread === false) ? true : false,
                        raw: n,
                      }));
                      setNotifications(normalized);
                    } catch (e) {
                      setNotifications([]);
                    } finally {
                      setLoadingNotifications(false);
                    }
                  }
                }}
                aria-haspopup="true"
                aria-expanded={notificationsOpen}
              >
                <Bell className="w-5 h-5 lg:w-6 lg:h-6" />
                {/* show red dot only if there are unread notifications */}
                {notifications.some(n => !n.read) && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-72 lg:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Notifications
                    </h3>
                  </div>
                  <ul className="max-h-80 overflow-y-auto">
                    {loadingNotifications && (
                      <li className="px-4 py-4 text-sm text-gray-500">Loading...</li>
                    )}
                    {!loadingNotifications && notifications.length === 0 && (
                      <li className="px-4 py-4 text-sm text-gray-500">No notifications</li>
                    )}
                    {!loadingNotifications && notifications.slice(0, 3).map((note: any, idx: number) => (
                      <li
                        key={note.id || idx}
                        className={`px-4 py-3 text-sm text-gray-700 cursor-pointer ${!note.read ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50 ${idx < Math.min(notifications.length, 3) - 1 ? 'border-b border-gray-200' : ''}`}
                        onClick={async () => {
                          try {
                            // Mark as read using the original id
                            if (!note.read && note.originalId) await notificationService.markAsRead(note.originalId);
                            // optimistic update
                            setNotifications((prev) => prev.map(n => (n.id === note.id) ? { ...n, read: true } : n));
                            // call callback with the clicked notification
                            onNotificationOpen && onNotificationOpen(note);
                          } catch (e) {
                            console.error('Failed to mark notification read', e);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 pr-3 min-w-0">
                            <div className="text-sm font-medium text-gray-800 truncate">{note.title || 'Notification'}</div>
                            {note.message && (
                              <div className="text-xs text-gray-500 mt-1 truncate">{note.message}</div>
                            )}
                          </div>
                          <div className="flex-shrink-0 ml-2 text-xs text-gray-400 whitespace-nowrap">{note.createdAt ? new Date(note.createdAt).toLocaleString() : ''}</div>
                        </div>
                        
                      </li>
                    ))}
                  </ul>
                  <div className="p-3 border-t border-gray-200 text-center">
                    <button
                      type="button"
                      className="text-blue-600 text-sm font-medium hover:underline"
                      onClick={() => {
                        // Ask parent pages to navigate to the notifications page
                        onNotificationOpen && onNotificationOpen();
                      }}
                    >
                      View All
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* User profile (moved from sidebar) */}
          <div className="flex items-center gap-3 ml-2">
            {(() => {
              const user = normalizeUserFromLocalStorage();
              return (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate max-w-[12rem]">{user.displayName}</div>
                    <div className="mt-1">
                      <RoleBadge role={user.roleLabel} />
                    </div>
                  </div>
                  <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                    {user.initials}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;