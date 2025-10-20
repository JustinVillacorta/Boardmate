import api from '../config/api';

export interface StaffAndTenantData {
  _id: string;
  type: 'staff' | 'tenant';
  name?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email: string;
  role?: 'admin' | 'staff';
  phoneNumber?: string;
  dateOfBirth?: string;
  occupation?: string;
  address?: any;
  idType?: string;
  idNumber?: string;
  emergencyContact?: any;
  room?: {
    _id: string;
    roomNumber: string;
    roomType: string;
    monthlyRent: number;
    status: string;
  };
  monthlyRent?: number;
  securityDeposit?: number;
  tenantStatus?: 'active' | 'inactive' | 'pending';
  isArchived: boolean;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffAndTenantsResponse {
  success: boolean;
  data: {
    records: StaffAndTenantData[];
    summary: {
      totalStaff: number;
      totalTenants: number;
      totalRecords: number;
    };
    pagination: {
      currentPage: number;
      totalPages: number;
      totalRecords: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface UpdateStaffData {
  name?: string;
  email?: string;
}

export interface UpdateTenantData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  occupation?: string;
  address?: {
    street?: string;
    city?: string;
    province?: string;
    zipCode?: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
}

export interface UpdateResponse {
  success: boolean;
  message: string;
  data: {
    user?: any;
    tenant?: any;
  };
}

export interface ArchiveResponse {
  success: boolean;
  message: string;
}

/**
 * Service for fetching staff and tenant data
 */
export const userManagementService = {
  /**
   * Get all staff and tenants with filtering and pagination
   */
  async getStaffAndTenants(params?: {
    page?: number;
    limit?: number;
    userType?: 'staff' | 'tenant' | 'all';
    isArchived?: boolean;
    tenantStatus?: 'active' | 'inactive' | 'pending';
    isVerified?: boolean;
    hasRoom?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<StaffAndTenantsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.userType) queryParams.append('userType', params.userType);
      if (params?.isArchived !== undefined) queryParams.append('isArchived', params.isArchived.toString());
      if (params?.tenantStatus) queryParams.append('tenantStatus', params.tenantStatus);
      if (params?.isVerified !== undefined) queryParams.append('isVerified', params.isVerified.toString());
      if (params?.hasRoom !== undefined) queryParams.append('hasRoom', params.hasRoom.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      // Add cache-busting parameter to ensure fresh data
      queryParams.append('_t', Date.now().toString());

      const response = await api.get<StaffAndTenantsResponse>(`/auth/staff-and-tenants?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to fetch users data');
      }
    }
  },

  /**
   * Update staff user details (Admin only)
   */
  async updateStaff(userId: string, data: UpdateStaffData): Promise<UpdateResponse> {
    try {
      const response = await api.put<UpdateResponse>(`/auth/admin/update-user/${userId}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to update staff user');
      }
    }
  },

  /**
   * Update tenant details (Staff/Admin)
   */
  async updateTenant(userId: string, data: UpdateTenantData): Promise<UpdateResponse> {
    try {
      const response = await api.put<UpdateResponse>(`/auth/staff/update-tenant/${userId}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to update tenant');
      }
    }
  },

  /**
   * Archive staff user account (Admin only)
   */
  async archiveStaff(userId: string): Promise<ArchiveResponse> {
    try {
      const response = await api.delete<ArchiveResponse>(`/auth/admin/archive-user/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to archive staff user');
      }
    }
  },

  /**
   * Archive tenant account (Staff/Admin)
   */
  async archiveTenant(userId: string): Promise<ArchiveResponse> {
    try {
      const response = await api.delete<ArchiveResponse>(`/auth/admin/archive-tenant/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to archive tenant');
      }
    }
  },

  /**
   * Unarchive staff user account (Admin only)
   */
  async unarchiveStaff(userId: string): Promise<ArchiveResponse> {
    try {
      const response = await api.patch<ArchiveResponse>(`/auth/admin/unarchive-user/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to unarchive staff user');
      }
    }
  },

  /**
   * Unarchive tenant account (Staff/Admin)
   */
  async unarchiveTenant(userId: string): Promise<ArchiveResponse> {
    try {
      const response = await api.patch<ArchiveResponse>(`/auth/admin/unarchive-tenant/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to unarchive tenant');
      }
    }
  }
};
