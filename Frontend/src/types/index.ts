// Authentication types based on your backend models
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
  role?: 'admin' | 'staff';
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

// Room management types
export interface Room {
  _id: string;
  roomNumber: string;
  capacity: number;
  monthlyRate: number;
  description?: string;
  amenities: string[];
  isOccupied: boolean;
  currentTenants: string[];
  createdAt: string;
  updatedAt: string;
}

// Payment types
export interface Payment {
  _id: string;
  tenant: string;
  room: string;
  amount: number;
  paymentDate: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paymentMethod?: 'cash' | 'bank_transfer' | 'gcash' | 'card';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Notification types
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

// Report types
export interface Report {
  _id: string;
  title: string;
  type: 'financial' | 'occupancy' | 'maintenance' | 'custom';
  dateRange: {
    start: string;
    end: string;
  };
  data: any;
  generatedBy: string;
  createdAt: string;
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