// Re-export all domain types for centralized access
export * from './notification';
export * from './payment';
export * from './report';
export * from './room';

// Authentication types based on your backend models
export type UserRole = 'admin' | 'staff' | 'tenant';
export type UserType = 'user' | 'tenant';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  occupation?: string;
  address?: {
    street?: string;
    city?: string;
    province?: string;
    zipCode?: string;
  };
  idType: 'passport' | 'drivers_license' | 'national_id' | 'other';
  idNumber: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  room?: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
  monthlyRent?: number;
  securityDeposit?: number;
  tenantStatus: 'active' | 'inactive' | 'pending';
  isArchived: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: 'admin' | 'staff' | 'tenant';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user?: User;
    tenant?: Tenant;
    token: string;
    userType: UserType;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Dashboard types
export interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  totalTenants: number;
  monthlyRevenue: number;
  pendingPayments: number;
  overduePayments: number;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }>;
}