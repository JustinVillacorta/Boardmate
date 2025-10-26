import api from '../config/api';

export interface AnnouncementItem {
  _id: string;
  id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  audience: 'all' | 'tenants' | 'staff' | 'admins' | 'custom';
  targetUsers?: Array<{
    user: string;
    userModel: 'User' | 'Tenant';
  }>;
  targetRooms?: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  publishDate: string;
  isArchived: boolean;
  isRead?: boolean;
  attachments?: Array<{
    name: string;
    url: string;
    size?: number;
    type?: string;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetAnnouncementsParams {
  audience?: string;
  status?: string;
  priority?: string;
  includeExpired?: boolean;
  includeArchived?: boolean;
  page?: number;
  limit?: number;
}

export interface GetAnnouncementsResponse {
  success: boolean;
  count: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalAnnouncements: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: {
    announcements: AnnouncementItem[];
  };
}

export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  audience?: 'all' | 'tenants' | 'staff' | 'admins' | 'custom';
  targetUsers?: Array<{
    user: string;
    userModel: 'User' | 'Tenant';
  }>;
  targetRooms?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  publishDate?: string;
  attachments?: Array<{
    name: string;
    url: string;
    size?: number;
    type?: string;
  }>;
}

export const announcementService = {
  async getAnnouncements(params: GetAnnouncementsParams = {}): Promise<GetAnnouncementsResponse> {
    const query = new URLSearchParams();

    // Set default values to exclude archived announcements unless explicitly requested
    const defaultParams = {
      includeArchived: false,
      ...params
    };

    Object.entries(defaultParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });

    // Cache bust
    query.append('_t', Date.now().toString());

    const res = await api.get<GetAnnouncementsResponse>(`/announcements?${query.toString()}`);
    return res.data;
  },

  async getAnnouncement(id: string): Promise<{ success: boolean; data: { announcement: AnnouncementItem } }> {
    // Mark as read when viewing details
    try {
      await this.markAsRead(id);
    } catch (error) {
      // Continue even if marking as read fails
      console.warn('Failed to mark announcement as read:', error);
    }
    
    const res = await api.get(`/announcements/${id}`);
    return res.data;
  },

  async createAnnouncement(payload: CreateAnnouncementPayload): Promise<{ success: boolean; message: string; data: { announcement: AnnouncementItem } }> {
    const res = await api.post('/announcements', payload);
    return res.data;
  },

  async updateAnnouncement(id: string, payload: Partial<CreateAnnouncementPayload>): Promise<{ success: boolean; message: string; data: { announcement: AnnouncementItem } }> {
    const res = await api.put(`/announcements/${id}`, payload);
    return res.data;
  },

  async deleteAnnouncement(id: string): Promise<{ success: boolean; message: string }> {
    const res = await api.delete(`/announcements/${id}`);
    return res.data;
  },

  async markAsRead(id: string): Promise<{ success: boolean; message: string }> {
    const res = await api.put(`/announcements/${id}/read`);
    return res.data;
  },

  async getStats(): Promise<{ success: boolean; data: any }> {
    const res = await api.get('/announcements/stats');
    return res.data;
  }
};