import React from 'react';

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

const NotificationCard: React.FC<{ n: NotificationItem; onOpen?: (n: NotificationItem) => void; selected?: boolean }> = ({ n, onOpen, selected }) => {
  return (
    <div
      role="button"
      id={`notification-${n.id}`}
      tabIndex={0}
      onClick={() => onOpen && onOpen(n)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpen && onOpen(n); }}
      className={`relative overflow-hidden border rounded-lg cursor-pointer ${n.read ? '' : 'shadow-sm'} ${selected ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}
    >
      {/* left blue bar on md+, top strip on small screens */}
      <div className="hidden md:block absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
      <div className="block md:hidden h-1 w-full bg-blue-500" />

      <div className="p-4 md:pl-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
          {/* Main content */}
          <div className="flex-1 px-2">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">{n.title}</h3>
                {n.tag && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">{n.tag}</span>}
                {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
              </div>

              <div className="text-sm text-gray-600 mt-2">{n.excerpt}</div>

              <div className="mt-3 text-xs text-gray-500">{n.createdAt} {n.expiresAt && <> · Expires {n.expiresAt}</>}</div>
            </div>
          </div>

          {/* For small screens, show inline centered action under content */}
          {/* action buttons removed: clicking the card opens the notification and marks it read */}
        </div>
      </div>

      {/* absolute right action for md+ screens */}
      {/* no inline action buttons; use clickable card behavior */}
    </div>
  );
};

export default NotificationCard;
