// Room Management Types

export interface Room {
  _id: string;
  roomNumber: string;
  roomType: 'single' | 'double' | 'triple' | 'quad';
  capacity: number;
  monthlyRent: number;
  securityDeposit: number;
  description?: string;
  amenities: string[];
  floor?: number;
  area?: number;
  status: 'available' | 'occupied' | 'maintenance' | 'unavailable';
  tenants: Tenant[];
  occupancy: {
    current: number;
    max: number;
  };
  isActive: boolean;
  images?: string[];
  notes?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  tenantStatus: 'active' | 'inactive';
  leaseStartDate?: string;
  leaseEndDate?: string;
}

export interface RoomFormData {
  roomNumber: string;
  roomType: 'single' | 'double' | 'triple' | 'quad';
  capacity: number;
  monthlyRent: number;
  securityDeposit?: number;
  description?: string;
  amenities: string[];
  floor?: number;
  area?: number;
  status: 'available' | 'occupied' | 'maintenance' | 'unavailable';
  notes?: string;
}

export interface TenantAssignment {
  tenantId: string;
  leaseStartDate: string;
  leaseEndDate: string;
  monthlyRent?: number;
  securityDeposit?: number;
}

export interface RoomFilters {
  page?: number;
  limit?: number;
  status?: string;
  roomType?: string;
  floor?: number;
  minArea?: number;
  maxRent?: number;
  available?: boolean;
  search?: string;
}

export interface RoomStats {
  overview: {
    totalRooms: number;
    totalCapacity: number;
    totalOccupied: number;
    availableRooms: number;
    occupiedRooms: number;
    maintenanceRooms: number;
    unavailableRooms: number;
    occupancyRate: number;
    availabilityRate: number;
  };
  byType: Array<{
    _id: string;
    count: number;
    totalCapacity: number;
    currentOccupancy: number;
  }>;
  byFloor: Array<{
    _id: number;
    count: number;
    available: number;
    occupied: number;
  }>;
}

// API Response Types
export interface RoomsResponse {
  success: boolean;
  data: {
    rooms: Room[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalRooms: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface RoomResponse {
  success: boolean;
  data: {
    room: Room;
  };
}

export interface RoomStatsResponse {
  success: boolean;
  data: RoomStats;
}

export interface AvailableTenantsResponse {
  success: boolean;
  data: {
    tenants: Array<{
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber?: string;
      tenantStatus: string;
    }>;
  };
}

// Frontend Display Types (for UI components)
export interface RoomDisplayData {
  id: string;
  name: string;
  type: string;
  rent: string;
  rentNumber?: number;
  capacity: number;
  occupancy: string;
  status: 'available' | 'occupied' | 'maintenance' | 'unavailable';
  description?: string;
  floor?: string;
  area?: string;
  amenities?: string[];
  securityDeposit?: string;
  tenants?: Array<{
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    status: string;
  }>;
  updatedAt?: string;
}