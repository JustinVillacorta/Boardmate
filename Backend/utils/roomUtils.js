// Utility functions for room operations

/**
 * Calculate occupancy rate for a room
 * @param {Object} room - Room object
 * @returns {number} Occupancy rate as percentage
 */
export const calculateOccupancyRate = (room) => {
  if (!room.capacity || room.capacity === 0) return 0;
  return (room.occupancy.current / room.capacity) * 100;
};

/**
 * Check if room is available for new tenant
 * @param {Object} room - Room object
 * @returns {boolean} True if room is available
 */
export const isRoomAvailable = (room) => {
  return (
    room.isActive &&
    room.status === 'available' &&
    room.occupancy.current < room.capacity
  );
};

/**
 * Get room capacity status
 * @param {Object} room - Room object
 * @returns {Object} Capacity status information
 */
export const getRoomCapacityStatus = (room) => {
  const remainingCapacity = Math.max(0, room.capacity - room.occupancy.current);
  const occupancyRate = calculateOccupancyRate(room);
  
  return {
    current: room.occupancy.current,
    capacity: room.capacity,
    remaining: remainingCapacity,
    occupancyRate: Math.round(occupancyRate * 100) / 100,
    isFull: remainingCapacity === 0,
    isEmpty: room.occupancy.current === 0,
    isPartiallyOccupied: room.occupancy.current > 0 && remainingCapacity > 0
  };
};

/**
 * Validate room assignment constraints
 * @param {Object} room - Room object
 * @param {Object} tenant - Tenant object
 * @returns {Object} Validation result
 */
export const validateRoomAssignment = (room, tenant) => {
  const errors = [];

  // Check if room exists and is active
  if (!room || !room.isActive) {
    errors.push('Room not found or inactive');
  }

  // Check if tenant exists and is not archived
  if (!tenant || tenant.isArchived) {
    errors.push('Tenant not found or archived');
  }

  // Check if tenant is already assigned to a room
  if (tenant.room) {
    errors.push('Tenant is already assigned to another room');
  }

  // Check room availability
  if (room && !isRoomAvailable(room)) {
    if (room.occupancy.current >= room.capacity) {
      errors.push('Room is at full capacity');
    } else if (room.status !== 'available') {
      errors.push(`Room is currently ${room.status}`);
    }
  }

  // Check if tenant is already in the room's tenant list
  if (room && room.tenants.includes(tenant._id)) {
    errors.push('Tenant is already assigned to this room');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generate room summary for reporting
 * @param {Object} room - Room object with populated tenants
 * @returns {Object} Room summary
 */
export const generateRoomSummary = (room) => {
  const capacityStatus = getRoomCapacityStatus(room);
  
  return {
    id: room._id,
    roomNumber: room.roomNumber,
    roomType: room.roomType,
    floor: room.floor,
    status: room.status,
    capacity: capacityStatus,
    monthlyRent: room.monthlyRent,
    securityDeposit: room.securityDeposit,
    amenities: room.amenities,
    tenantCount: room.tenants.length,
    tenants: room.tenants.map(tenant => ({
      id: tenant._id,
      name: `${tenant.firstName} ${tenant.lastName}`,
      email: tenant.email,
      status: tenant.tenantStatus,
      leaseStart: tenant.leaseStartDate,
      leaseEnd: tenant.leaseEndDate
    })),
    lastUpdated: room.updatedAt
  };
};

/**
 * Calculate total revenue for a room
 * @param {Object} room - Room object with tenants
 * @returns {number} Total monthly revenue
 */
export const calculateRoomRevenue = (room) => {
  if (!room.tenants || room.tenants.length === 0) {
    return 0;
  }

  return room.tenants.reduce((total, tenant) => {
    // Use tenant's individual rent if set, otherwise use room's base rent
    const rent = tenant.monthlyRent || room.monthlyRent;
    return total + (rent || 0);
  }, 0);
};

/**
 * Get room maintenance status
 * @param {Object} room - Room object
 * @returns {Object} Maintenance status
 */
export const getRoomMaintenanceStatus = (room) => {
  const today = new Date();
  const nextMaintenance = room.nextMaintenanceDate ? new Date(room.nextMaintenanceDate) : null;
  const lastMaintenance = room.lastMaintenanceDate ? new Date(room.lastMaintenanceDate) : null;

  return {
    needsMaintenance: room.status === 'maintenance' || (nextMaintenance && nextMaintenance <= today),
    isOverdue: nextMaintenance && nextMaintenance < today,
    daysUntilMaintenance: nextMaintenance ? Math.ceil((nextMaintenance - today) / (1000 * 60 * 60 * 24)) : null,
    daysSinceLastMaintenance: lastMaintenance ? Math.floor((today - lastMaintenance) / (1000 * 60 * 60 * 24)) : null,
    status: room.status === 'maintenance' ? 'under_maintenance' : 
            (nextMaintenance && nextMaintenance <= today) ? 'due_for_maintenance' : 'up_to_date'
  };
};