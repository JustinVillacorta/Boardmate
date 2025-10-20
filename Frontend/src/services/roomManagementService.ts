import api from '../config/api';
import {
  Room,
  RoomFormData,
  TenantAssignment,
  RoomFilters,
  RoomsResponse,
  RoomResponse,
  RoomStatsResponse,
  AvailableTenantsResponse,
  RoomDisplayData
} from '../types/room';

/**
 * Room Management Service
 * Handles all room-related API calls
 */

// Transform backend room data to frontend display format
const transformRoomToDisplay = (room: Room): RoomDisplayData => {
  return {
    id: room._id,
    name: room.roomNumber,
    type: room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1),
    rent: `₱${room.monthlyRent.toLocaleString()}`,
    capacity: room.capacity,
    occupancy: `${room.occupancy.current}/${room.capacity}`,
    status: room.status,
    description: room.description,
    floor: room.floor?.toString(),
    area: room.area?.toString(),
    amenities: room.amenities,
    securityDeposit: room.securityDeposit ? `₱${room.securityDeposit.toLocaleString()}` : undefined,
    tenants: room.tenants.map(tenant => ({
      id: tenant._id,
      name: `${tenant.firstName} ${tenant.lastName}`,
      email: tenant.email,
      phoneNumber: tenant.phoneNumber,
      status: tenant.tenantStatus
    }))
  };
};

// Transform frontend form data to backend format
const transformFormToBackend = (formData: any): RoomFormData => {
  return {
    roomNumber: formData.roomNumber,
    roomType: formData.roomType.toLowerCase(),
    capacity: formData.capacity,
    monthlyRent: typeof formData.monthlyRent === 'string' 
      ? parseFloat(formData.monthlyRent.replace(/[^\d.]/g, '')) 
      : formData.monthlyRent,
    securityDeposit: formData.securityDeposit 
      ? (typeof formData.securityDeposit === 'string' 
          ? parseFloat(formData.securityDeposit.replace(/[^\d.]/g, '')) 
          : formData.securityDeposit)
      : 0,
    description: formData.description,
    amenities: formData.amenities || [],
    floor: formData.floor ? parseInt(formData.floor) : undefined,
    area: formData.area ? parseFloat(formData.area) : undefined,
    status: formData.status.toLowerCase(),
    notes: formData.notes
  };
};

/**
 * Get all rooms with filtering and pagination
 */
export const getRooms = async (filters: RoomFilters = {}): Promise<RoomsResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  const response = await api.get<RoomsResponse>(`/rooms?${queryParams.toString()}`);
  return response.data;
};

/**
 * Get single room by ID
 */
export const getRoom = async (roomId: string): Promise<RoomResponse> => {
  const response = await api.get<RoomResponse>(`/rooms/${roomId}`);
  return response.data;
};

/**
 * Create new room
 */
export const createRoom = async (formData: any): Promise<RoomResponse> => {
  const backendData = transformFormToBackend(formData);
  const response = await api.post<RoomResponse>('/rooms', backendData);
  return response.data;
};

/**
 * Update existing room
 */
export const updateRoom = async (roomId: string, formData: any): Promise<RoomResponse> => {
  const backendData = transformFormToBackend(formData);
  const response = await api.put<RoomResponse>(`/rooms/${roomId}`, backendData);
  return response.data;
};

/**
 * Delete room (soft delete)
 */
export const deleteRoom = async (roomId: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/rooms/${roomId}`);
  return response.data;
};

/**
 * Assign tenant to room
 */
export const assignTenant = async (roomId: string, assignment: TenantAssignment): Promise<RoomResponse> => {
  const response = await api.post<RoomResponse>(`/rooms/${roomId}/assign-tenant`, assignment);
  return response.data;
};

/**
 * Remove tenant from room
 */
export const removeTenant = async (roomId: string, tenantId: string): Promise<RoomResponse> => {
  const response = await api.delete<RoomResponse>(`/rooms/${roomId}/remove-tenant/${tenantId}`);
  return response.data;
};

/**
 * Get available rooms
 */
export const getAvailableRooms = async (filters: Partial<RoomFilters> = {}): Promise<RoomsResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  const response = await api.get<RoomsResponse>(`/rooms/available?${queryParams.toString()}`);
  return response.data;
};

/**
 * Get room statistics
 */
export const getRoomStats = async (): Promise<RoomStatsResponse> => {
  const response = await api.get<RoomStatsResponse>('/rooms/stats');
  return response.data;
};

/**
 * Update room status
 */
export const updateRoomStatus = async (roomId: string, status: string, notes?: string): Promise<RoomResponse> => {
  const response = await api.patch<RoomResponse>(`/rooms/${roomId}/status`, { status, notes });
  return response.data;
};

/**
 * Get available tenants for assignment
 */
export const getAvailableTenants = async (): Promise<AvailableTenantsResponse> => {
  // Add cache-busting parameter to ensure fresh data
  const response = await api.get<AvailableTenantsResponse>(`/auth/staff-and-tenants?userType=tenant&_t=${Date.now()}`);
  return response.data;
};

/**
 * Transform room data for display
 */
export const transformRoom = transformRoomToDisplay;

/**
 * Transform form data for backend
 */
export const transformRoomForm = transformFormToBackend;
