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
  leaseStartDate?: string;
  leaseEndDate?: string;
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

export const userManagementService = {
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
      
      const defaultParams = {
        isArchived: false,
        ...params
      };
      
      if (defaultParams?.page) queryParams.append('page', defaultParams.page.toString());
      if (defaultParams?.limit) queryParams.append('limit', defaultParams.limit.toString());
      if (defaultParams?.userType) queryParams.append('userType', defaultParams.userType);
      if (defaultParams?.isArchived !== undefined) queryParams.append('isArchived', defaultParams.isArchived.toString());
      if (defaultParams?.tenantStatus) queryParams.append('tenantStatus', defaultParams.tenantStatus);
      if (defaultParams?.isVerified !== undefined) queryParams.append('isVerified', defaultParams.isVerified.toString());
      if (defaultParams?.hasRoom !== undefined) queryParams.append('hasRoom', defaultParams.hasRoom.toString());
      if (defaultParams?.search) queryParams.append('search', defaultParams.search);
      if (defaultParams?.sortBy) queryParams.append('sortBy', defaultParams.sortBy);
      if (defaultParams?.sortOrder) queryParams.append('sortOrder', defaultParams.sortOrder);
      
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
  },

  async cleanupArchivedTenants(): Promise<{ success: boolean; message: string; data: any }> {
    const response = await api.post('/auth/admin/cleanup-archived-tenants');
    return response.data;
  },

  async verifyRoomTenantIntegrity(): Promise<{ success: boolean; message: string; data: any }> {
    const response = await api.get('/auth/admin/verify-room-tenant-integrity');
    return response.data;
  }
};