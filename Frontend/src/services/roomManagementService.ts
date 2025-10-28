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
  RoomDisplayData,
  ContractResponse
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
    rentNumber: Number(room.monthlyRent || 0),
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
    })),
    updatedAt: room.updatedAt
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
 * Get room statistics
 */
export const getRoomStats = async (): Promise<RoomStatsResponse> => {
  const response = await api.get<RoomStatsResponse>('/rooms/stats');
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
 * Get contract file for a tenant
 */
export const getContract = async (tenantId: string): Promise<ContractResponse> => {
  const response = await api.get<ContractResponse>(`/rooms/contracts/${tenantId}`);
  return response.data;
};

/**
 * Generate contract PDF
 */
export interface ContractGenerationParams {
  tenantId: string;
  roomId: string;
  leaseDurationMonths: number;
  leaseStartDate: string;
  monthlyRent: number;
  securityDeposit: number;
  landlordName: string;
  landlordAddress: string;
  specialTerms?: string;
}

export interface ContractGenerationResponse {
  success: boolean;
  data: {
    contractFile: string;
    contractFileName: string;
    contractDetails: {
      tenantName: string;
      roomNumber: string;
      leaseStartDate: string;
      leaseEndDate: string;
      monthlyRent: number;
      securityDeposit: number;
      durationMonths: number;
    };
  };
}

export const generateContract = async (params: ContractGenerationParams): Promise<ContractGenerationResponse> => {
  const response = await api.post<ContractGenerationResponse>('/rooms/generate-contract', params);
  return response.data;
};

/**
 * Convert File to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Convert base64 to Blob for download
 */
export const base64ToBlob = (base64String: string, mimeType: string = 'application/pdf'): Blob => {
  const base64Data = base64String.split(',')[1];
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

/**
 * Download contract file
 */
export const downloadContract = (contractFile: string, fileName: string): void => {
  const blob = base64ToBlob(contractFile, 'application/pdf');
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

/**
 * Transform room data for display
 */
export const transformRoom = transformRoomToDisplay;

/**
 * Transform form data for backend
 */
export const transformRoomForm = transformFormToBackend;
