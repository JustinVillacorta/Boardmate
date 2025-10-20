// Room types
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

export interface CreateRoomData {
  roomNumber: string;
  capacity: number;
  monthlyRate: number;
  description?: string;
  amenities: string[];
}

export interface UpdateRoomData {
  roomNumber?: string;
  capacity?: number;
  monthlyRate?: number;
  description?: string;
  amenities?: string[];
}