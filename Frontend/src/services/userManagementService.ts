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
  }
};
