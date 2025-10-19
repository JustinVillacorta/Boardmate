import React, { useState } from 'react';
import Sidebar from '../layout/Sidebar';
import TopNavbar from '../layout/TopNavbar';
import UserCard from '../users/UserCard';
import CreateUserModal from '../users/CreateUserModal';
import EditUserModal from '../users/EditUserModal';
import ConfirmDialog from '../ui/ConfirmDialog';
import { User, UserPlus } from 'lucide-react';

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

interface UsersPageProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
  userRole?: 'admin' | 'staff';
}

const UsersPage: React.FC<UsersPageProps> = ({ currentPage, onNavigate, userRole = 'admin' }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock users data - replace with actual API call
  const [users, setUsers] = useState<UserData[]>([
    {
      id: '1',
      name: '222',
      email: 'staff@boardinghouse.com',
      role: 'Staff',
      status: 'Inactive',
      startDate: 'Sep 24, 2025',
      avatar: '2'
    },
    {
      id: '2',
      name: 'tenant1',
      email: 'tenant1@boardinghouse.com',
      role: 'Tenant',
      status: 'Inactive',
      startDate: 'Sep 24, 2025',
      roomNumber: '111'
    },
    {
      id: '3',
      name: 'Ampogiko',
      email: 'cuagdannitsuj@gmail.com',
      role: 'Staff',
      status: 'Active',
      startDate: 'Oct 11, 2025'
    }
  ]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateUser = (userData: any) => {
    // Handle user creation - replace with actual API call
    const newUser: UserData = {
      id: Date.now().toString(),
      name: `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
      role: userData.role,
      status: userData.isActive ? 'Active' : 'Inactive',
      startDate: new Date().toLocaleDateString(),
      roomNumber: userData.roomNumber,
    };
    
    setUsers(prev => [...prev, newUser]);
    setIsCreateModalOpen(false);
  };

  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setEditingUser(user);
    }
  };

  const handleUpdateUser = (userId: string, userData: any) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? {
            ...user,
            name: `${userData.firstName} ${userData.lastName}`,
            email: userData.email,
            role: userData.role,
            status: userData.isActive ? 'Active' : 'Inactive'
          }
        : user
    ));
    setEditingUser(null);
  };

  const handleArchiveUser = (userId: string) => {
    // Handle user archiving (immediate) - replaced by confirm flow below
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  // Confirm dialog state for archive
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedToArchive, setSelectedToArchive] = useState<string | null>(null);

  const requestArchive = (userId: string) => {
    setSelectedToArchive(userId);
    setIsConfirmOpen(true);
  };

  const confirmArchive = () => {
    if (selectedToArchive) {
      setUsers(prev => prev.filter(user => user.id !== selectedToArchive));
    }
    setSelectedToArchive(null);
    setIsConfirmOpen(false);
  };

  const cancelArchive = () => {
    setSelectedToArchive(null);
    setIsConfirmOpen(false);
  };

  // Role-based functionality
  const canCreateUsers = true; // Both admin and staff can create users
  const canEditUsers = userRole === 'admin'; // Only admin can edit users
  const canArchiveUsers = userRole === 'admin'; // Only admin can archive users
  const isStaffUser = userRole === 'staff'; // Staff can only create tenants

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} userRole={userRole} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navigation */}
        <TopNavbar 
          currentPage={currentPage}
          title="Users" 
          subtitle={userRole === 'staff' ? "Manage tenant accounts" : "Manage system users and permissions"}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          

          {/* User Management Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Section Header */}
            <div className="p-4 lg:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                    {userRole === 'staff' ? 'Tenant Management' : 'User Management'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {filteredUsers.length} {userRole === 'staff' ? 'tenants' : 'users'} found
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search Bar */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search for anything..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  
                  {/* Create User Button */}
                  {canCreateUsers && (
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                    >
                      <UserPlus className="w-4 h-4" />
                      {userRole === 'staff' ? 'Add Tenant' : 'Create User'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Users Grid */}
            <div className="p-4 lg:p-6">
              {filteredUsers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
                  {filteredUsers.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onEdit={canEditUsers ? handleEditUser : undefined}
                      onArchive={canArchiveUsers ? requestArchive : undefined}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No {userRole === 'staff' ? 'tenants' : 'users'} found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchQuery 
                      ? `No ${userRole === 'staff' ? 'tenants' : 'users'} match "${searchQuery}"`
                      : `Get started by creating your first ${userRole === 'staff' ? 'tenant' : 'user'}`
                    }
                  </p>
                  {!searchQuery && canCreateUsers && (
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <UserPlus className="w-4 h-4" />
                      {userRole === 'staff' ? 'Add Tenant' : 'Create User'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <CreateUserModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateUser}
          isStaffUser={isStaffUser}
        />
      )}

      {/* Edit User Modal */}
      {editingUser && canEditUsers && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdate={handleUpdateUser}
        />
      )}

      {/* Archive Confirm Dialog */}
      {canArchiveUsers && (
        <ConfirmDialog
          isOpen={isConfirmOpen}
          title="Archive Account"
          message={
            <>
              <p>Archiving this account will deactivate it and remove access.</p>
              <p className="mt-2">Are you sure you want to archive <strong>{selectedToArchive ? (users.find(u => u.id === selectedToArchive)?.name) : 'this user'}</strong>?</p>
            </>
          }
          confirmLabel="Archive"
          cancelLabel="Cancel"
          onConfirm={confirmArchive}
          onCancel={cancelArchive}
        />
      )}
    </div>
  );
};

export default UsersPage;
