import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 10,
  },
  roomType: {
    type: String,
    enum: ['single', 'double', 'triple', 'quad'],
    required: true,
    lowercase: true,
  },
  capacity: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 4 
  },
  monthlyRent: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  securityDeposit: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  description: { 
    type: String, 
    trim: true, 
    maxlength: 500 
  },
  amenities: [{ 
    type: String, 
    trim: true 
  }],
  floor: { 
    type: Number, 
    min: 0 
  },
  area: { 
    type: Number, 
    min: 1 
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'unavailable'],
    default: 'available',
    lowercase: true,
  },
  tenants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tenant' 
  }],
  occupancy: {
    current: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    max: { 
      type: Number, 
      min: 1 
    },
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  images: [{ 
    type: String, 
    trim: true 
  }],
  notes: { 
    type: String, 
    trim: true, 
    maxlength: 1000 
  },
  lastMaintenanceDate: Date,
  nextMaintenanceDate: Date,
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

roomSchema.index({ roomNumber: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ roomType: 1 });
roomSchema.index({ floor: 1 });
roomSchema.index({ isActive: 1 });
roomSchema.index({ 'occupancy.current': 1 });

roomSchema.virtual('isAvailable').get(function() {
  return this.status === 'available' && 
         this.isActive && 
         this.occupancy.current < this.capacity;
});

roomSchema.virtual('occupancyRate').get(function() {
  return this.capacity > 0 ? (this.occupancy.current / this.capacity) * 100 : 0;
});

roomSchema.virtual('remainingCapacity').get(function() {
  return Math.max(0, this.capacity - this.occupancy.current);
});

roomSchema.pre('save', async function(next) {
  if (this.isModified('tenants')) {
    this.occupancy.current = this.tenants.length;
    if (this.occupancy.current === 0) {
      this.status = 'available';
    } else if (this.occupancy.current >= this.capacity) {
      this.status = 'occupied';
    } else if (this.occupancy.current > 0 && this.status === 'available') {
      this.status = 'occupied';
    }
  }

  if (!this.occupancy.max) {
    this.occupancy.max = this.capacity;
  }

  next();
});

roomSchema.methods.addTenant = async function(tenantId) {
  if (this.occupancy.current >= this.capacity) {
    throw new Error('Room is at full capacity');
  }
  if (this.tenants.includes(tenantId)) {
    throw new Error('Tenant is already assigned to this room');
  }
  this.tenants.push(tenantId);
  await this.save();
  const Tenant = mongoose.model('Tenant');
  await Tenant.findByIdAndUpdate(tenantId, { room: this._id });

  return this;
};

roomSchema.methods.removeTenant = async function(tenantId) {
  const tenantIndex = this.tenants.indexOf(tenantId);
  if (tenantIndex === -1) {
    throw new Error('Tenant is not assigned to this room');
  }
  this.tenants.splice(tenantIndex, 1);
  await this.save();
  const Tenant = mongoose.model('Tenant');
  await Tenant.findByIdAndUpdate(tenantId, { 
    room: null,
    tenantStatus: 'inactive'
  });

  return this;
};

roomSchema.methods.getFullDetails = function() {
  return this.populate('tenants', 'firstName lastName email phoneNumber tenantStatus');
};

roomSchema.statics.findAvailable = function(options = {}) {
  const query = {
    isActive: true,
    status: 'available',
    $expr: { $lt: ['$occupancy.current', '$capacity'] }
  };

  // Add optional filters
  if (options.roomType) {
    query.roomType = options.roomType;
  }
  if (options.floor !== undefined) {
    query.floor = options.floor;
  }
  if (options.minArea) {
    query.area = { $gte: options.minArea };
  }
  if (options.maxRent) {
    query.monthlyRent = { $lte: options.maxRent };
  }

  return this.find(query).populate('tenants', 'firstName lastName tenantStatus');
};

roomSchema.statics.findByStatus = function(status) {
  return this.find({ status, isActive: true }).populate('tenants');
};

roomSchema.statics.findNeedingMaintenance = function() {
  const today = new Date();
  return this.find({
    isActive: true,
    $or: [
      { status: 'maintenance' },
      { nextMaintenanceDate: { $lte: today } }
    ]
  });
};

roomSchema.statics.getOccupancyStats = async function() {
  const stats = await this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalRooms: { $sum: 1 },
        totalCapacity: { $sum: '$capacity' },
        totalOccupied: { $sum: '$occupancy.current' },
        availableRooms: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'available'] },
              1,
              0
            ]
          }
        },
        occupiedRooms: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'occupied'] },
              1,
              0
            ]
          }
        },
        maintenanceRooms: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'maintenance'] },
              1,
              0
            ]
          }
        },
        unavailableRooms: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'unavailable'] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  const result = stats[0] || {
    totalRooms: 0,
    totalCapacity: 0,
    totalOccupied: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    maintenanceRooms: 0,
    unavailableRooms: 0
  };

  result.occupancyRate = result.totalCapacity > 0 
    ? (result.totalOccupied / result.totalCapacity) * 100 
    : 0;
  
  result.availabilityRate = result.totalRooms > 0 
    ? (result.availableRooms / result.totalRooms) * 100 
    : 0;

  return result;
};

roomSchema.statics.removeArchivedTenants = async function() {
  const Tenant = mongoose.model('Tenant');
  const archivedTenants = await Tenant.find({ isArchived: true }).select('_id');
  const archivedTenantIds = archivedTenants.map(t => t._id);
  
  if (archivedTenantIds.length === 0) {
    return { removedCount: 0, roomsUpdated: 0 };
  }
  const result = await this.updateMany(
    { tenants: { $in: archivedTenantIds } },
    { $pull: { tenants: { $in: archivedTenantIds } } }
  );
  const affectedRooms = await this.find({ 
    _id: { $in: await this.distinct('_id', { tenants: { $in: archivedTenantIds } }) }
  });
  
  for (const room of affectedRooms) {
    room.occupancy.current = room.tenants.length;
    if (room.occupancy.current === 0) {
      room.status = 'available';
    }
    
    await room.save();
  }
  
  console.log(`Removed ${archivedTenantIds.length} archived tenants from ${result.modifiedCount} rooms`);
  
  return {
    removedCount: archivedTenantIds.length,
    roomsUpdated: result.modifiedCount
  };
};

export default mongoose.model('Room', roomSchema);