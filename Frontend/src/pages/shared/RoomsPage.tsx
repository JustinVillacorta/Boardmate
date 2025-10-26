import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import RoomCard from '../../components/rooms/RoomCard';
import CreateRoomModal from '../../components/rooms/CreateRoomModal';
import ManageTenantsModal from '../../components/rooms/ManageTenantsModal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EditRoomModal from '../../components/rooms/EditRoomModal';
import { RefreshCw, Plus, SortAsc } from 'lucide-react';
import * as roomManagementService from '../../services/roomManagementService';
import { RoomDisplayData, RoomFilters } from '../../types/room';

interface RoomData {
  id: string;
  name: string;
  type: string;
  rent: string;
  capacity: number;
  occupancy: string;
  status: 'available' | 'occupied' | 'maintenance';
  description?: string;
  floor?: string;
  area?: string;
  amenities?: string[];
  securityDeposit?: string;
}

interface RoomsPageProps {
  currentPage?: string;
  onNavigate?: (p: string) => void;
  userRole?: 'admin' | 'staff';
}

const RoomsPage: React.FC<RoomsPageProps> = ({ currentPage, onNavigate, userRole = 'admin' }) => {
  const [search, setSearch] = useState('');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortOption, setSortOption] = useState<'roomNumberAZ' | 'roomNumberZA' | 'rentLowHigh' | 'rentHighLow' | 'capacityHighLow' | 'capacityLowHigh' | 'updatedNewOld' | 'updatedOldNew'>('roomNumberAZ');
  const [rooms, setRooms] = useState<RoomDisplayData[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RoomFilters>({
    page: 1,
    limit: 20
  });

  // Fetch rooms from API
  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const searchFilters: RoomFilters = {
        ...filters,
        search: search || undefined
      };
      
  const response = await roomManagementService.getRooms(searchFilters);
  // RoomsResponse shape: { success, data: { rooms, pagination } }
  const transformedRooms = response.data.rooms.map(roomManagementService.transformRoom);
      setRooms(transformedRooms);
    } catch (err: any) {
      console.error('Error fetching rooms:', err);
      setError(err.message || 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  // Fetch rooms on component mount and when filters change
  useEffect(() => {
    fetchRooms();
  }, [filters, search]);

  const filtered = rooms.filter(r =>
    (r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(search.toLowerCase())) &&
    (selectedAvailability.length === 0 || (selectedAvailability.includes('Vacant') && r.status === 'available') || (selectedAvailability.includes('Occupied') && r.status === 'occupied'))
  );

  // Apply sorting based on selected option
  const sorted = [...filtered].sort((a, b) => {
    // Helper: normalize room number for ties
    const roomNumberCompare = (x: RoomDisplayData, y: RoomDisplayData) => x.name.localeCompare(y.name, undefined, { numeric: true, sensitivity: 'base' });

    // availability is now a filter via chips (selectedAvailability)

    if (sortOption === 'roomNumberZA') {
      // Z → A
      return roomNumberCompare(b, a);
    }

    if (sortOption === 'roomNumberAZ') {
      // A → Z
      return roomNumberCompare(a, b);
    }

    if (sortOption === 'rentHighLow') {
      const ra = (a.rentNumber ?? 0);
      const rb = (b.rentNumber ?? 0);
      if (ra !== rb) return rb - ra;
      return roomNumberCompare(a, b);
    }

    if (sortOption === 'rentLowHigh') {
      const ra = (a.rentNumber ?? 0);
      const rb = (b.rentNumber ?? 0);
      if (ra !== rb) return ra - rb;
      return roomNumberCompare(a, b);
    }

    if (sortOption === 'capacityLowHigh') {
      if (a.capacity !== b.capacity) return a.capacity - b.capacity;
      return roomNumberCompare(a, b);
    }

    if (sortOption === 'capacityHighLow') {
      if (a.capacity !== b.capacity) return b.capacity - a.capacity;
      return roomNumberCompare(a, b);
    }

    if (sortOption === 'updatedOldNew') {
      const da = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const db = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      if (da !== db) return da - db;
      return roomNumberCompare(a, b);
    }

    if (sortOption === 'updatedNewOld') {
      const da = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const db = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      if (da !== db) return db - da;
      return roomNumberCompare(a, b);
    }

    return 0;
  });

  const handleDelete = async (id: string) => {
    try {
      await roomManagementService.deleteRoom(id);
      await fetchRooms(); // Refresh the list
    } catch (err: any) {
      console.error('Error deleting room:', err);
      setError(err.message || 'Failed to delete room');
    }
  };

  // Delete confirm flow
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<string | null>(null);

  const requestDelete = (id: string) => {
    setSelectedToDelete(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedToDelete) {
      await handleDelete(selectedToDelete);
    }
    setSelectedToDelete(null);
    setIsDeleteOpen(false);
  };

  const cancelDelete = () => {
    setSelectedToDelete(null);
    setIsDeleteOpen(false);
  };

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreate = async (data: any) => {
    try {
      await roomManagementService.createRoom(data);
      await fetchRooms(); // Refresh the list
    } catch (err: any) {
      console.error('Error creating room:', err);
      setError(err.message || 'Failed to create room');
    }
  };

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const selectedRoom = selectedRoomId ? rooms.find(r => r.id === selectedRoomId) || null : null;
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const editingRoom = editingRoomId ? rooms.find(r => r.id === editingRoomId) || null : null;

  const handleUpdateRoom = async (id: string, data: any) => {
    try {
      await roomManagementService.updateRoom(id, data);
      await fetchRooms(); // Refresh the list
    } catch (err: any) {
      console.error('Error updating room:', err);
      setError(err.message || 'Failed to update room');
    }
  };

  const handleAddTenant = async (roomId: string) => {
    // Refresh rooms after tenant assignment
    await fetchRooms();
  };

  // Role-based functionality
  const canCreateRooms = userRole === 'admin'; // Only admin can create rooms
  const canDeleteRooms = userRole === 'admin'; // Only admin can delete rooms

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} userRole={userRole} />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
  <TopNavbar currentPage={currentPage} title="Rooms" subtitle="Manage room inventory and occupancy" onNotificationOpen={() => onNavigate && onNavigate('notifications')} />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 lg:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Room Management</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {userRole === 'staff' ? 'View room inventory and occupancy' : 'Manage room inventory and occupancy'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                  <div className="relative w-full sm:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search rooms..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>

                  <button
                    onClick={() => setIsSortOpen(true)}
                    className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm hover:bg-gray-50"
                  >
                    <SortAsc className="w-4 h-4" />
                    Sort
                  </button>
                  {canCreateRooms && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => setIsCreateOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create Room
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 lg:p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-2 text-gray-600">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Loading rooms...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-600 mb-4">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Rooms</h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button 
                      onClick={fetchRooms}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </button>
                  </div>
                </div>
              ) : sorted.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 lg:gap-6">
                  {sorted.map(room => (
                    <RoomCard 
                      key={room.id} 
                      room={room} 
                      onDelete={canDeleteRooms ? () => requestDelete(room.id) : undefined} 
                      onManageTenants={(id) => setSelectedRoomId(id)} 
                      onEdit={(id) => setEditingRoomId(id)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your search or create a new room.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      {isCreateOpen && (
        <CreateRoomModal onClose={() => setIsCreateOpen(false)} onCreate={handleCreate} />
      )}

      {selectedRoom && (
        <ManageTenantsModal room={selectedRoom} onClose={() => setSelectedRoomId(null)} onAddTenant={() => handleAddTenant(selectedRoom.id)} />
      )}

      {editingRoom && (
        <EditRoomModal room={editingRoom} onClose={() => setEditingRoomId(null)} onUpdate={handleUpdateRoom} />
      )}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete Room"
        message={
          <>
            <p>Deleting this room will remove it from the system.</p>
            <p className="mt-2">Are you sure you want to delete <strong>{selectedToDelete ? (rooms.find(r => r.id === selectedToDelete)?.name) : 'this room'}</strong>?</p>
          </>
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
      {/* Sort Floating Panel */}
      {isSortOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0" onClick={() => setIsSortOpen(false)} />
          <div className="absolute right-6 top-20 w-80 bg-white border border-gray-200 p-4 rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Sort Rooms</h3>
              <button onClick={() => setIsSortOpen(false)} className="text-gray-500 text-xl leading-none">×</button>
            </div>

            <div className="space-y-3">
              {/* Room number directions */}
              <label className="flex items-center gap-2">
                <input type="radio" name="roomSort" value="roomNumberAZ" checked={sortOption === 'roomNumberAZ'} onChange={() => setSortOption('roomNumberAZ')} />
                <span className="text-sm">Room number (A → Z)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="roomSort" value="roomNumberZA" checked={sortOption === 'roomNumberZA'} onChange={() => setSortOption('roomNumberZA')} />
                <span className="text-sm">Room number (Z → A)</span>
              </label>

              {/* Monthly rent directions */}
              <label className="flex items-center gap-2">
                <input type="radio" name="roomSort" value="rentLowHigh" checked={sortOption === 'rentLowHigh'} onChange={() => setSortOption('rentLowHigh')} />
                <span className="text-sm">Monthly rent (Low → High)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="roomSort" value="rentHighLow" checked={sortOption === 'rentHighLow'} onChange={() => setSortOption('rentHighLow')} />
                <span className="text-sm">Monthly rent (High → Low)</span>
              </label>

              {/* Capacity directions */}
              <label className="flex items-center gap-2">
                <input type="radio" name="roomSort" value="capacityLowHigh" checked={sortOption === 'capacityLowHigh'} onChange={() => setSortOption('capacityLowHigh')} />
                <span className="text-sm">Capacity (Low → High)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="roomSort" value="capacityHighLow" checked={sortOption === 'capacityHighLow'} onChange={() => setSortOption('capacityHighLow')} />
                <span className="text-sm">Capacity (High → Low)</span>
              </label>

              {/* Updated directions */}
              <label className="flex items-center gap-2">
                <input type="radio" name="roomSort" value="updatedNewOld" checked={sortOption === 'updatedNewOld'} onChange={() => setSortOption('updatedNewOld')} />
                <span className="text-sm">Last updated (New → Old)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="roomSort" value="updatedOldNew" checked={sortOption === 'updatedOldNew'} onChange={() => setSortOption('updatedOldNew')} />
                <span className="text-sm">Last updated (Old → New)</span>
              </label>
            </div>

            {/* Availability chips like Roles (moved below radios) */}
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Availability</h4>
              <div className="flex flex-wrap gap-2">
                {['Vacant','Occupied'].map(av => (
                  <button
                    key={av}
                    onClick={() => setSelectedAvailability(prev => prev.includes(av) ? prev.filter(x => x !== av) : [...prev, av])}
                    className={`text-sm px-3 py-1 rounded-full border ${selectedAvailability.includes(av) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'}`}
                  >{av}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsPage;
