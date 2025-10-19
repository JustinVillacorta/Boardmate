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

const NotificationCard: React.FC<{ n: NotificationItem; onMarkRead?: (id: string) => void }> = ({ n, onMarkRead }) => {
  return (
    <div className={`relative bg-white rounded-lg overflow-hidden border ${n.read ? '' : 'shadow-sm'}`}>
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
          {!n.read && (
            <div className="mt-3 md:mt-0 md:ml-4 flex md:hidden items-center justify-center">
              <button onClick={() => onMarkRead && onMarkRead(n.id)} className="px-4 py-2 bg-blue-600 text-white rounded">Mark as Read</button>
            </div>
          )}
        </div>
      </div>

      {/* absolute right action for md+ screens */}
      {!n.read && (
        <div className="hidden md:block absolute right-4 top-1/2 transform -translate-y-1/2">
          <button onClick={() => onMarkRead && onMarkRead(n.id)} className="px-4 py-2 bg-blue-600 text-white rounded">Mark as Read</button>
        </div>
      )}
    </div>
  );
};

export default NotificationCard;
