import React from 'react';
import { ShieldCheck, User, Users } from 'lucide-react';

interface RoleBadgeProps {
  role: string;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const key = (role || '').toLowerCase();
  if (key === 'admin') {
    return (
      <div className="inline-flex items-center gap-2 text-xs text-white bg-red-600 px-2 py-0.5 rounded-full">
        <ShieldCheck className="w-3 h-3" />
        <span className="font-semibold">Admin</span>
      </div>
    );
  }

  if (key === 'staff') {
    return (
      <div className="inline-flex items-center gap-2 text-xs text-white bg-blue-600 px-2 py-0.5 rounded-full">
        <User className="w-3 h-3" />
        <span className="font-semibold">Staff</span>
      </div>
    );
  }

  // tenant or default
  return (
    <div className="inline-flex items-center gap-2 text-xs text-gray-700 bg-gray-200 px-2 py-0.5 rounded-full">
      <Users className="w-3 h-3" />
      <span className="font-semibold">Tenant</span>
    </div>
  );
};

export default RoleBadge;
