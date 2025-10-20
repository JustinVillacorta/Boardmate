// Notification types
export interface NotificationItem {
  id: string;
  title: string;
  tag?: string;
  excerpt?: string;
  createdAt?: string;
  expiresAt?: string;
  meta?: Record<string, any>;
  read?: boolean;
}

export interface Notification {
  _id: string;
  recipient: string;
  title: string;
  message: string;
  type: 'payment_reminder' | 'payment_received' | 'system' | 'maintenance';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenantNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'payment' | 'maintenance' | 'building';
  isUnread: boolean;
}