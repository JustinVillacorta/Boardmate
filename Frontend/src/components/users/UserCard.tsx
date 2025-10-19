import React from 'react';
import { Edit, Archive, MapPin } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'Staff' | 'Tenant' | 'Admin';
  status: 'Active' | 'Inactive';
  startDate: string;
  roomNumber?: string;
  avatar?: string;
}

interface UserCardProps {
  user: UserData;
  onEdit: (userId: string) => void;
  onArchive: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onArchive }) => {
  const getInitials = (name: string) => {
    const nameParts = name.trim().split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Staff':
        return 'bg-blue-100 text-blue-800';
      case 'Tenant':
        return 'bg-purple-100 text-purple-800';
      case 'Admin':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-gradient-to-br from-blue-400 to-blue-600',
      'bg-gradient-to-br from-purple-400 to-purple-600',
      'bg-gradient-to-br from-green-400 to-green-600',
      'bg-gradient-to-br from-red-400 to-red-600',
      'bg-gradient-to-br from-yellow-400 to-yellow-600',
      'bg-gradient-to-br from-pink-400 to-pink-600',
    ];
    
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
      {/* Avatar and Basic Info */}
      <div className="flex flex-col items-center text-center mb-4">
        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white font-semibold text-base sm:text-lg mb-3 ${getAvatarColor(user.name)}`}>
          {user.avatar || getInitials(user.name)}
        </div>
        
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate max-w-full">
          {user.name}
        </h3>
        
        <p className="text-xs sm:text-sm text-gray-500 mb-3 break-all line-clamp-2">
          {user.email}
        </p>

        {/* Role Badge */}
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
          {user.role}
        </span>
      </div>

      {/* Status and Details */}
      <div className="space-y-3 mb-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
            {user.status}
          </span>
        </div>

        {/* Room Number (for tenants) */}
        {user.roomNumber && (
          <div className="flex items-center justify-center gap-1 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">Room {user.roomNumber}</span>
          </div>
        )}

        {/* Start Date */}
        <div className="text-center">
          <span className="text-xs text-gray-500">Started: {user.startDate}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(user.id)}
          className="flex-1 flex items-center justify-center gap-1 px-2 sm:px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs sm:text-sm font-medium"
        >
          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Edit</span>
        </button>
        <button
          onClick={() => onArchive(user.id)}
          className="flex-1 flex items-center justify-center gap-1 px-2 sm:px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-xs sm:text-sm font-medium"
        >
          <Archive className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Archive</span>
        </button>
      </div>
    </div>
  );
};

export default UserCard;