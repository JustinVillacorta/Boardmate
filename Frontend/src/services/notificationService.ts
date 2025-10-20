import api from '../config/api';

export interface NotificationItem {
  _id?: string;
  id?: string;
  title: string;
  message?: string;
  tag?: string;
  excerpt?: string;
  createdAt?: string;
  expiresAt?: string | null;
  meta?: Record<string, any>;
  read?: boolean;
  user?: any;
}

export const notificationService = {
  async getNotifications(params: { page?: number; limit?: number; status?: string; type?: string; includeRead?: boolean } = {}) {
    const qs = new URLSearchParams();
    if (params.page) qs.append('page', String(params.page));
    if (params.limit) qs.append('limit', String(params.limit));
    if (params.status) qs.append('status', params.status);
    if (params.type) qs.append('type', params.type);
    if (params.includeRead !== undefined) qs.append('includeRead', String(params.includeRead));
    qs.append('_t', String(Date.now()));

    const res = await api.get(`/notifications?${qs.toString()}`);
    return res.data;
  },

  async getUnreadCount() {
    const res = await api.get('/notifications/unread-count');
    return res.data;
  },

  async markAsRead(id: string) {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllAsRead() {
    const res = await api.put('/notifications/mark-all-read');
    return res.data;
  },

  async deleteNotification(id: string) {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },

  async createAnnouncement(payload: { title: string; message?: string; userIds?: string[]; expiresAt?: string | null }) {
    const res = await api.post('/notifications/announcement', payload);
    return res.data;
  }
};
