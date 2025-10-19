import React from 'react';
import { Edit, Users, Trash } from 'lucide-react';

interface RoomProps {
  room: {
    id: string;
    name: string;
    type: string;
    rent: string;
    capacity: number;
    occupancy: string;
    status: 'available' | 'occupied' | 'maintenance';
    description?: string;
  };
  onDelete?: () => void;
  onEdit?: (id: string) => void;
  onManageTenants?: (id: string) => void;
}

const statusColor = (status: RoomProps['room']['status']) => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-700';
    case 'occupied':
      return 'bg-blue-100 text-blue-700';
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const RoomCard: React.FC<RoomProps> = ({ room, onDelete, onEdit, onManageTenants }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
          <p className="text-sm text-gray-500">{room.type}</p>
        </div>
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusColor(room.status)}`}>
          {room.status}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600 grid grid-cols-2 gap-2">
        <div>
          <div className="text-xs text-gray-500">Monthly Rent:</div>
          <div className="font-medium">{room.rent}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Capacity:</div>
          <div className="font-medium">{room.capacity} person(s)</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Occupancy:</div>
          <div className="font-medium">{room.occupancy}</div>
        </div>
        <div />
      </div>

      {room.description && <p className="mt-3 text-sm text-gray-500">{room.description}</p>}

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex gap-2">
          <button onClick={() => onEdit && onEdit(room.id)} className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors text-sm flex items-center justify-center gap-2">
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button onClick={() => onManageTenants && onManageTenants(room.id)} className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg border border-green-100 hover:bg-green-100 transition-colors text-sm flex items-center justify-center gap-2">
            <Users className="w-4 h-4" />
            Tenants
          </button>
        </div>

        <button onClick={onDelete} className="w-full px-3 py-2 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 transition-colors text-sm flex items-center justify-center gap-2">
          <Trash className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
