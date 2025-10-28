import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import UserCard from '../../components/users/UserCard';
import CreateUserModal from '../../components/users/CreateUserModal';
import EditUserModal from '../../components/users/EditUserModal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ExportButton from '../../components/ui/ExportButton';
import { userManagementService, StaffAndTenantData } from '../../services/userManagementService';
import { User, UserPlus, SortAsc } from 'lucide-react';
import LoadingState from '../../components/ui/LoadingState';
import ListPageSkeleton from '../../components/skeletons/ListPageSkeleton';
import { exportToExcel, formatDate } from '../../utils/excelExport';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'Staff' | 'Tenant' | 'Admin';
  rawRole?: string | null; // original backend role string (e.g. 'manager')
  status: 'Active' | 'Inactive' | 'Invited' | 'Suspended' | 'Archived';
  startDate: string;
  roomNumber?: string;
  roomType?: string;
  monthlyRent?: number;
  avatar?: string;
  createdAt?: string | null;
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
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortOption, setSortOption] = useState<'nameAsc' | 'nameDesc' | 'createdNewOld' | 'createdOldNew'>('createdNewOld');
  const [users, setUsers] = useState<UserData[]>([]);
  const isStaffUser = String(userRole).toLowerCase() === 'staff'; // Staff can only create tenants
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Fetch users data on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await userManagementService.getStaffAndTenants({
        limit: 50, // Get more users
        // If this page is used by a staff user, only request tenants
        userType: isStaffUser ? 'tenant' : 'all'
      });
      
      // Transform backend data to frontend format
      const transformedUsers: UserData[] = response.data.records.map((record: StaffAndTenantData) => ({
        id: record._id,
        name: record.type === 'staff' 
          ? record.name || 'Unknown Staff'
          : record.fullName || `${record.firstName || ''} ${record.lastName || ''}`.trim() || 'Unknown Tenant',
        email: record.email,
        // preserve backend role in rawRole; map role for UI components
        rawRole: (record as any).role || null,
        role: record.type === 'staff' ? (record.role === 'admin' ? 'Admin' : 'Staff') : 'Tenant',
        status: record.isArchived ? 'Archived' : 'Active',
        startDate: new Date(record.createdAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        roomNumber: record.room?.roomNumber,
        roomType: record.room?.roomType,
        monthlyRent: record.room?.monthlyRent,
        avatar: record.type === 'staff' 
          ? record.name?.charAt(0) || 'S'
          : record.firstName?.charAt(0) || record.lastName?.charAt(0) || 'T'
        ,
        createdAt: record.createdAt || null
      }));
      
      setUsers(transformedUsers);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // filter by search and then apply selected sort option
  const filteredUsers = users
    .filter(user => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q) || user.role.toLowerCase().includes(q);
      const matchesRole = selectedRoles.length === 0 || selectedRoles.includes(user.role);
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(user.status);
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      // Name A→Z
      if (sortOption === 'nameAsc') {
        return a.name.localeCompare(b.name);
      }
      // Name Z→A
      if (sortOption === 'nameDesc') {
        return b.name.localeCompare(a.name);
      }
      // Created new→old
      if (sortOption === 'createdNewOld') {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      }
      // Created old→new
      if (sortOption === 'createdOldNew') {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return da - db;
      }

      return 0;
    });

  const handleCreateUser = async (userData: any) => {
    // User creation is handled by the CreateUserModal via registerService
    // Just refresh the users list after successful creation
    await fetchUsers();
    setIsCreateModalOpen(false);
  };

  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setEditingUser(user);
    }
  };

  const handleUpdateUser = async () => {
    // Refresh the users list after successful update
    await fetchUsers();
    setEditingUser(null);
  };


  const handleArchiveUser = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      if (user.role === 'Staff' || user.role === 'Admin') {
        await userManagementService.archiveStaff(userId);
      } else {
        await userManagementService.archiveTenant(userId);
      }
      
      // Refresh the users list after successful archive
      await fetchUsers();
    } catch (error: any) {
      console.error('Error archiving user:', error);
      // You could add a toast notification here
    }
  };

  const handleUnarchiveUser = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      if (user.role === 'Staff' || user.role === 'Admin') {
        await userManagementService.unarchiveStaff(userId);
      } else {
        await userManagementService.unarchiveTenant(userId);
      }
      
      // Refresh the users list after successful unarchive
      await fetchUsers();
    } catch (error: any) {
      console.error('Error unarchiving user:', error);
      setError(error.message || 'Failed to unarchive user');
    }
  };

  // Confirm dialog state for archive
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedToArchive, setSelectedToArchive] = useState<string | null>(null);

  const requestArchive = (userId: string) => {
    setSelectedToArchive(userId);
    setIsConfirmOpen(true);
  };

  const confirmArchive = async () => {
    if (selectedToArchive) {
      await handleArchiveUser(selectedToArchive);
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
  const canEditUsers = userRole === 'admin' || userRole === 'staff'; // Admin can edit all, staff can edit tenants
  const canArchiveUsers = userRole === 'admin' || userRole === 'staff'; // Admin can archive all, staff can archive tenants
  
  // Helper function to check if current user can edit a specific user
  const canEditUser = (user: UserData) => {
    if (userRole === 'admin') return true; // Admin can edit all
    if (userRole === 'staff' && user.role === 'Tenant') return true; // Staff can edit tenants
    return false; // Staff cannot edit other staff
  };
  
  // Helper function to check if current user can archive a specific user
  const canArchiveUser = (user: UserData) => {
    if (userRole === 'admin') return true; // Admin can archive all
    if (userRole === 'staff' && user.role === 'Tenant') return true; // Staff can archive tenants
    return false; // Staff cannot archive other staff
  };

  // Export functionality
  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Fetch all users without filters
      const response = await userManagementService.getStaffAndTenants({
        limit: 1000,
        userType: isStaffUser ? 'tenant' : 'all'
      });
      
      // Transform backend data to export format
      const exportData = response.data.records.map((record: StaffAndTenantData) => ({
        'Name': record.type === 'staff' 
          ? record.name || 'Unknown Staff'
          : record.fullName || `${record.firstName || ''} ${record.lastName || ''}`.trim() || 'Unknown Tenant',
        'Email': record.email,
        'Role': record.type === 'staff' ? (record.role === 'admin' ? 'Admin' : 'Staff') : 'Tenant',
        'Status': record.isArchived ? 'Archived' : 'Active',
        'Start Date': new Date(record.createdAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        'Room Number': record.room?.roomNumber || '-',
        'Room Type': record.room?.roomType || '-',
        'Monthly Rent': record.room?.monthlyRent ? `₱${record.room.monthlyRent.toLocaleString()}` : '-',
        'Created Date': formatDate(record.createdAt)
      }));
      
      await exportToExcel(exportData, 'users_export', { 
        sheetNames: ['Users'],
        columnWidths: [25, 30, 12, 12, 15, 12, 15, 15, 15, 15]
      });
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export users. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

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
          // onSearch removed
          onNotificationOpen={() => onNavigate && onNavigate('notifications')}
          onAnnouncementOpen={() => onNavigate && onNavigate('announcements')}
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
                      onChange={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
                      className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>

                  {/* Sort Button */}
                  <button
                    onClick={() => setIsSortOpen(true)}
                    className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm hover:bg-gray-50"
                  >
                    <SortAsc className="w-4 h-4" />
                    Sort
                  </button>
                  
                  <ExportButton onClick={handleExport} loading={isExporting} />
                  
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
              {isLoading ? (
                <LoadingState message="Loading users">
                  <ListPageSkeleton cardsPerRow={3} rows={2} />
                </LoadingState>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-500 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Users</h3>
                  <p className="text-gray-500 mb-6">{error}</p>
                  <button
                    onClick={fetchUsers}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
                  {filteredUsers.map((user) => {
                    // map user to the shape expected by UserCard (narrow status type)
                    const cardUser = {
                      id: user.id,
                      name: user.name,
                      email: user.email,
                      role: user.role as 'Staff' | 'Tenant' | 'Admin',
                      status: (user.status === 'Active' ? 'Active' : 'Inactive') as 'Active' | 'Inactive',
                      startDate: user.startDate,
                      roomNumber: user.roomNumber,
                      roomType: user.roomType,
                      monthlyRent: user.monthlyRent,
                      avatar: user.avatar
                    };

                    return (
                      <UserCard
                        key={user.id}
                        user={cardUser}
                        onEdit={canEditUser(user) ? handleEditUser : undefined}
                        onArchive={canArchiveUser(user) ? requestArchive : undefined}
                        onUnarchive={canArchiveUser(user) ? handleUnarchiveUser : undefined}
                      />
                    );
                  })}
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
      {editingUser && canEditUser(editingUser) && (
        <EditUserModal
          user={{
            id: editingUser.id,
            name: editingUser.name,
            email: editingUser.email,
            role: editingUser.role as 'Staff' | 'Tenant' | 'Admin',
            status: editingUser.status === 'Active' ? 'Active' : 'Inactive',
            startDate: editingUser.startDate,
            roomNumber: editingUser.roomNumber,
            roomType: editingUser.roomType,
            monthlyRent: editingUser.monthlyRent,
            avatar: editingUser.avatar
          }}
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
              {selectedToArchive && users.find(u => u.id === selectedToArchive)?.roomNumber && (
                <p className="mt-2 text-amber-600 font-medium">
                  ⚠️ This user will also be removed from their current room ({users.find(u => u.id === selectedToArchive)?.roomNumber}).
                </p>
              )}
              <p className="mt-2">Are you sure you want to archive <strong>{selectedToArchive ? (users.find(u => u.id === selectedToArchive)?.name) : 'this user'}</strong>?</p>
            </>
          }
          confirmLabel="Archive"
          cancelLabel="Cancel"
          onConfirm={confirmArchive}
          onCancel={cancelArchive}
        />
      )}

      {/* Sort Floating Panel */}
      {isSortOpen && (
        <div className="fixed inset-0 z-50">
          {/* click outside to close */}
          <div className="absolute inset-0" onClick={() => setIsSortOpen(false)} />
          <div className="absolute right-6 top-20 w-80 bg-white border border-gray-200 p-4 rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Sort Users</h3>
              <button onClick={() => setIsSortOpen(false)} className="text-gray-500 text-xl leading-none">×</button>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="radio" name="sort" value="nameAsc" checked={sortOption === 'nameAsc'} onChange={() => setSortOption('nameAsc')} />
                <span className="text-sm">Name (A → Z)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="sort" value="nameDesc" checked={sortOption === 'nameDesc'} onChange={() => setSortOption('nameDesc')} />
                <span className="text-sm">Name (Z → A)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="sort" value="createdNewOld" checked={sortOption === 'createdNewOld'} onChange={() => setSortOption('createdNewOld')} />
                <span className="text-sm">Created (new → old)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="sort" value="createdOldNew" checked={sortOption === 'createdOldNew'} onChange={() => setSortOption('createdOldNew')} />
                <span className="text-sm">Created (old → new)</span>
              </label>
            
            {/* Role filters (only for admin view) - only show Staff and Tenant */}
            {!isStaffUser && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Roles</h4>
                <div className="flex flex-wrap gap-2">
                  {['Staff','Tenant'].map(r => (
                    <button
                      key={r}
                      onClick={() => setSelectedRoles(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])}
                      className={`text-sm px-3 py-1 rounded-full border ${selectedRoles.includes(r) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'}`}
                    >{r}</button>
                  ))}
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
