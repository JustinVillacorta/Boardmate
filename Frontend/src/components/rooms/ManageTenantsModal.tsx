import React, { useMemo, useState, useEffect } from 'react';
import { X, UserPlus, Check, UserMinus } from 'lucide-react';
import * as roomManagementService from '../../services/roomManagementService';
import ConfirmDialog from '../ui/ConfirmDialog';

interface RoomData {
  id: string;
  name: string;
  type: string;
  rent: string;
  capacity: number;
  occupancy: string;
  status: 'available' | 'occupied' | 'maintenance';
  description?: string;
  tenants?: Array<{
    id: string;
    name: string;
    email?: string;
    phoneNumber?: string;
  }>;
}

interface Props {
  room: RoomData;
  onClose: () => void;
  onAddTenant?: (roomId: string) => void;
}

const ManageTenantsModal: React.FC<Props> = ({ room, onClose, onAddTenant }) => {
  // parse occupancy like "0/1"
  const [current, total] = room.occupancy.split('/').map(s => Number(s));
  const available = Math.max(0, total - current);

  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [availableTenants, setAvailableTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [tenantToRemove, setTenantToRemove] = useState<string | null>(null);

  // Fetch available tenants
  const fetchAvailableTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await roomManagementService.getAvailableTenants();
      console.log('Available tenants response:', response);
  const dataAny: any = response.data;
  const allTenants: any[] = dataAny.records || dataAny.tenants || [];
      console.log('All tenants from API:', allTenants.length);
      const filtered = allTenants.filter((tenant: any) => !tenant.room && !tenant.isArchived);
      console.log('Filtered available tenants:', filtered.length, filtered);
      setAvailableTenants(filtered);
    } catch (err: any) {
      console.error('Error fetching tenants:', err);
      setError(err.message || 'Failed to fetch available tenants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableTenants();
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      // prevent selecting more than available
      if (prev.length >= available) return prev;
      return [...prev, id];
    });
  };

  const confirmSelection = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      setLoading(true);
      // For now, assign the first selected tenant with default lease dates
      const tenantId = selectedIds[0];
      const today = new Date();
      const oneYearLater = new Date();
      oneYearLater.setFullYear(today.getFullYear() + 1);
      
      await roomManagementService.assignTenant(room.id, {
        tenantId,
        leaseStartDate: today.toISOString().split('T')[0],
        leaseEndDate: oneYearLater.toISOString().split('T')[0]
      });
      
      // Call the callback to refresh the room list
      onAddTenant && onAddTenant(room.id);
      
      setIsSelectOpen(false);
      setSelectedIds([]);
    } catch (err: any) {
      console.error('Error assigning tenant:', err);
      setError(err.message || 'Failed to assign tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTenant = (tenantId: string) => {
    setTenantToRemove(tenantId);
    setIsRemoveOpen(true);
  };

  const confirmRemoveTenant = async () => {
    if (!tenantToRemove) return;
    
    try {
      setLoading(true);
      await roomManagementService.removeTenant(room.id, tenantToRemove);
      
      // Call the callback to refresh the room list
      onAddTenant && onAddTenant(room.id);
      
      setIsRemoveOpen(false);
      setTenantToRemove(null);
    } catch (err: any) {
      console.error('Error removing tenant:', err);
      setError(err.message || 'Failed to remove tenant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black opacity-40" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-start justify-between p-6 border-b flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold">Manage Room Tenants</h3>
            <p className="text-sm text-gray-500">{room.name} - {room.occupancy} occupied</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600">Capacity</div>
              <div className="text-2xl font-semibold text-blue-800">{room.capacity}</div>
              <div className="text-xs text-blue-500">Total spots</div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-green-600">Occupied</div>
              <div className="text-2xl font-semibold text-green-800">{current}</div>
              <div className="text-xs text-green-500">Current tenants</div>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-sm text-red-600">Available</div>
              <div className="text-2xl font-semibold text-red-800">{Math.max(0, total - current)}</div>
              <div className="text-xs text-red-500">Room is {Math.max(0, total - current) === 0 ? 'full' : 'available'}</div>
            </div>
          </div>

          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <div>
              <div className="text-sm text-gray-500">Max Capacity</div>
              <div className="text-lg font-semibold">{room.capacity}</div>
              <div className="text-xs text-gray-400">{room.type} room</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-700">{room.rent}</div>
              <div className="text-xs text-gray-400">Monthly Rent</div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm">{room.status.charAt(0).toUpperCase() + room.status.slice(1)}</div>
              <div className="text-xs text-gray-400 mt-1">Floor 1</div>
            </div>
          </div>

          <h4 className="text-sm font-semibold text-green-700 mb-3">Current Tenants ({current})</h4>
          {current === 0 ? (
            <div className="p-6 border rounded-lg text-center text-gray-500">
              <div className="mb-2">
                <svg className="w-8 h-8 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-4.418 0-8 1.79-8 4v1h16v-1c0-2.21-3.582-4-8-4z" /></svg>
              </div>
              <div>No current tenants in this room</div>
              <div className="text-xs text-gray-400">Room is available for new tenants</div>
            </div>
          ) : (
            <div className="space-y-3">
              {room.tenants?.map((tenant: any) => (
                <div key={tenant.id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{tenant.name}</div>
                      <div className="text-sm text-gray-500">{tenant.email}</div>
                      {tenant.phoneNumber && (
                        <div className="text-xs text-gray-400">{tenant.phoneNumber}</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveTenant(tenant.id)}
                      className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm flex items-center gap-1"
                    >
                      <UserMinus className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

          <div className="p-4 border-t bg-white flex-shrink-0 flex items-center justify-end gap-3">
            <button
              onClick={() => available > 0 && setIsSelectOpen(true)}
              disabled={available === 0}
              title={available === 0 ? 'Room is full' : 'Add tenant'}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${available === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-50 text-blue-700'}`}
            >
              <UserPlus className="w-4 h-4" />Add Tenant
            </button>
          </div>

          {/* Select Tenants floating screen (overlay fixed to viewport so it isn't clipped) */}
          {isSelectOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/40" onClick={() => setIsSelectOpen(false)} />

              <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-lg flex flex-col max-h-[95vh] z-[10000] overflow-hidden">
                <div className="flex items-start justify-between p-4 border-b">
                  <div>
                    <h3 className="text-lg font-semibold">Select Tenants</h3>
                    <p className="text-sm text-gray-500">Choose up to {available} tenant{available !== 1 ? 's' : ''}</p>
                  </div>
                  <button onClick={() => setIsSelectOpen(false)} className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-gray-500">Loading available tenants...</div>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <div className="text-red-600 mb-2">{error}</div>
                      <button 
                        onClick={fetchAvailableTenants}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-sm text-gray-600">Selected: {selectedIds.length} / {available}</div>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); fetchAvailableTenants(); }}
                                    disabled={loading}
                                    className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 disabled:opacity-50"
                                  >
                                    {loading ? 'Refreshing...' : 'Refresh'}
                                  </button>
                                </div>
                      <div className="space-y-2 overflow-y-auto scroll-smooth h-96 border border-gray-200 rounded-lg p-2" style={{ scrollbarWidth: 'thin' }}>
                        {availableTenants && availableTenants.length > 0 ? availableTenants.map(tenant => {
                          const isSelected = selectedIds.includes(tenant._id);
                          const disabled = !isSelected && selectedIds.length >= available;
                          return (
                            <button
                              key={tenant._id}
                              type="button"
                              onClick={() => !disabled && toggleSelect(tenant._id)}
                              className={`w-full text-left p-3 rounded-lg border flex items-center justify-between ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div>
                                <div className="font-medium">{tenant.firstName} {tenant.lastName}</div>
                                <div className="text-xs text-gray-500">{tenant.email}</div>
                                {tenant.phoneNumber && (
                                  <div className="text-xs text-gray-400">{tenant.phoneNumber}</div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                                {disabled && <div className="text-xs text-gray-400">limit</div>}
                              </div>
                            </button>
                          );
                        }) : (
                          <div className="text-center py-8 text-gray-500">
                            No available tenants found
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                      <div className="p-3 border-t flex items-center justify-end gap-3">
                        <button type="button" onClick={() => { setIsSelectOpen(false); setSelectedIds([]); }} className="px-3 py-2 bg-white border rounded-md">Cancel</button>
                        <button type="button" disabled={selectedIds.length === 0} onClick={confirmSelection} className={`px-4 py-2 rounded-md text-white ${selectedIds.length === 0 ? 'bg-gray-300' : 'bg-blue-600'}`}>
                          Add {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
                        </button>
                      </div>
              </div>
            </div>
          )}
      </div>

      {/* Confirmation Dialog for Tenant Removal */}
      <ConfirmDialog
        isOpen={isRemoveOpen}
        title="Remove Tenant"
        message={
          <>
            <p>Are you sure you want to remove this tenant from the room?</p>
            <p className="mt-2 text-sm text-gray-600">This action will end their lease and make the room available for new tenants.</p>
          </>
        }
        confirmLabel="Remove Tenant"
        cancelLabel="Cancel"
        onConfirm={confirmRemoveTenant}
        onCancel={() => {
          setIsRemoveOpen(false);
          setTenantToRemove(null);
        }}
      />
    </div>
  );
};

export default ManageTenantsModal;
