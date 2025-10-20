// Re-export all domain types for centralized access
export * from './notification';
export * from './payment';
export * from './report';
export * from './room';

// Authentication types based on your backend models
export type UserRole = 'admin' | 'staff' | 'tenant';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'tenant';
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  _id: string;
  name: string;
  email: string;
  phone: string;
  room?: string;
  isActive: boolean;
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
  token: string;
  user: User | Tenant;
  message?: string;
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