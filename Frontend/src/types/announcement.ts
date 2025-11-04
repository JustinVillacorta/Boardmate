export interface Announcement {
  _id: string;
  id: string;
  title: string;
  content: string;
  author?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  } | null;
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

export interface AnnouncementFilters {
  audience?: 'all' | 'tenants' | 'staff' | 'admins' | 'custom';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  includeExpired?: boolean;
  includeArchived?: boolean;
  search?: string;
}

export interface AnnouncementFormData {
  title: string;
  content: string;
  audience: 'all' | 'tenants' | 'staff' | 'admins' | 'custom';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  publishDate?: string;
  attachments: Array<{
    name: string;
    url: string;
    size?: number;
    type?: string;
  }>;
}