import Room from '../models/Room.js';
import Tenant from '../models/Tenant.js';

export const cleanupArchivedTenants = async () => {
  try {
    console.log('Starting archived tenant cleanup...');
    const archivedTenantsWithRooms = await Tenant.find({ 
      isArchived: true, 
      room: { $ne: null } 
    }).populate('room', 'roomNumber');
    console.log(`Found ${archivedTenantsWithRooms.length} archived tenants still assigned to rooms`);
    let cleanedCount = 0;
    for (const tenant of archivedTenantsWithRooms) {
      if (tenant.room) {
        try {
          const room = await Room.findById(tenant.room._id);
          if (room) {
            await room.removeTenant(tenant._id);
            console.log(`Removed archived tenant ${tenant.fullName} from room ${room.roomNumber}`);
            cleanedCount++;
          }
        } catch (error) {
          console.error(`Error removing tenant ${tenant._id} from room: ${error.message}`);
        }
      }
    }
    const roomCleanupResult = await Room.removeArchivedTenants();
    console.log(`Cleanup completed. Manually cleaned: ${cleanedCount}, Room cleanup result:`, roomCleanupResult);
    return {
      manuallyRemoved: cleanedCount,
      roomCleanupResult
    };
  } catch (error) {
    console.error('Error during archived tenant cleanup:', error);
    throw error;
  }
};
export const verifyRoomTenantIntegrity = async () => {
  try {
    console.log('Verifying room-tenant data integrity...');
    const issues = [];
    const rooms = await Room.find({ isActive: true }).populate('tenants');
    for (const room of rooms) {
      const archivedTenants = room.tenants.filter(tenant => tenant.isArchived);
      if (archivedTenants.length > 0) {
        issues.push({
          type: 'archived_tenants_in_room',
          roomId: room._id,
          roomNumber: room.roomNumber,
          archivedTenants: archivedTenants.map(t => ({ id: t._id, name: t.fullName }))
        });
      }
    }
    const tenants = await Tenant.find({ 
      isArchived: false, 
      room: { $ne: null } 
    }).populate('room');
    for (const tenant of tenants) {
      if (tenant.room && !tenant.room.tenants.includes(tenant._id)) {
        issues.push({
          type: 'tenant_not_in_room_array',
          tenantId: tenant._id,
          tenantName: tenant.fullName,
          roomId: tenant.room._id,
          roomNumber: tenant.room.roomNumber
        });
      }
    }
    console.log(`Found ${issues.length} integrity issues`);
    return issues;
  } catch (error) {
    console.error('Error during integrity verification:', error);
    throw error;
  }
};

export default {
  cleanupArchivedTenants,
  verifyRoomTenantIntegrity
};