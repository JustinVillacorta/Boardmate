import { validationResult } from 'express-validator';
import Room from '../models/Room.js';
import Tenant from '../models/Tenant.js';
import Payment from '../models/Payment.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

// @desc    Get all rooms with filtering and pagination
// @route   GET /api/rooms
// @access  Private (Admin/Staff)
export const getRooms = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    status,
    roomType,
    floor,
    minArea,
    maxRent,
    available,
    search
  } = req.query;

  // Build query
  const query = { isActive: true };

  if (status) query.status = status;
  if (roomType) query.roomType = roomType;
  if (floor !== undefined) query.floor = parseInt(floor);
  if (minArea) query.area = { ...query.area, $gte: parseInt(minArea) };
  if (maxRent) query.monthlyRent = { ...query.monthlyRent, $lte: parseInt(maxRent) };
  
  // Filter for available rooms only
  if (available === 'true') {
    query.$expr = { $lt: ['$occupancy.current', '$capacity'] };
    query.status = { $in: ['available'] };
  }

  // Search functionality
  if (search) {
    query.$or = [
      { roomNumber: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { amenities: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query
  const rooms = await Room.find(query)
    .populate('tenants', 'firstName lastName email phoneNumber tenantStatus')
    .populate('createdBy updatedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count for pagination
  const total = await Room.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      rooms,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRooms: total,
        hasNextPage: skip + rooms.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    }
  });
});

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Private (Admin/Staff/Tenant)
export const getRoom = catchAsync(async (req, res, next) => {
  const room = await Room.findById(req.params.id)
    .populate('tenants', 'firstName lastName email phoneNumber tenantStatus leaseStartDate leaseEndDate')
    .populate('createdBy updatedBy', 'name email');

  if (!room || !room.isActive) {
    return next(new AppError('Room not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { room }
  });
});

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private (Admin/Staff)
export const createRoom = catchAsync(async (req, res, next) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const roomData = {
    ...req.body,
    createdBy: req.user.id,
    updatedBy: req.user.id
  };

  const room = await Room.create(roomData);

  res.status(201).json({
    success: true,
    message: 'Room created successfully',
    data: { room }
  });
});

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private (Admin/Staff)
export const updateRoom = catchAsync(async (req, res, next) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const room = await Room.findById(req.params.id);

  if (!room || !room.isActive) {
    return next(new AppError('Room not found', 404));
  }

  // Update room data
  const updateData = {
    ...req.body,
    updatedBy: req.user.id
  };

  // Remove fields that shouldn't be updated directly
  delete updateData.tenants;
  delete updateData.occupancy;

  const updatedRoom = await Room.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  ).populate('tenants', 'firstName lastName email phoneNumber tenantStatus');

  res.status(200).json({
    success: true,
    message: 'Room updated successfully',
    data: { room: updatedRoom }
  });
});

// @desc    Delete room (soft delete)
// @route   DELETE /api/rooms/:id
// @access  Private (Admin only)
export const deleteRoom = catchAsync(async (req, res, next) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    return next(new AppError('Room not found', 404));
  }

  // Check if room has tenants
  if (room.tenants.length > 0) {
    return next(new AppError('Cannot delete room with assigned tenants', 400));
  }

  // Soft delete
  room.isActive = false;
  room.updatedBy = req.user.id;
  await room.save();

  res.status(200).json({
    success: true,
    message: 'Room deleted successfully'
  });
});

// @desc    Assign tenant to room
// @route   POST /api/rooms/:id/assign-tenant
// @access  Private (Admin/Staff)
export const assignTenant = catchAsync(async (req, res, next) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { tenantId, leaseStartDate, leaseEndDate, monthlyRent, securityDeposit } = req.body;

  const room = await Room.findById(req.params.id);
  if (!room || !room.isActive) {
    return next(new AppError('Room not found', 404));
  }

  const tenant = await Tenant.findById(tenantId);
  if (!tenant || tenant.isArchived) {
    return next(new AppError('Tenant not found', 404));
  }

  // Check if tenant is already assigned to a room
  if (tenant.room) {
    return next(new AppError('Tenant is already assigned to a room', 400));
  }

  // Check room capacity
  if (room.occupancy.current >= room.capacity) {
    return next(new AppError('Room is at full capacity', 400));
  }

  try {
    // Add tenant to room using the room method
    await room.addTenant(tenantId);

    // Update tenant lease information
    const tenantUpdateData = {
      leaseStartDate,
      leaseEndDate,
      tenantStatus: 'active'
    };

    // Use room's rent if not provided
    if (monthlyRent !== undefined) {
      tenantUpdateData.monthlyRent = monthlyRent;
    } else {
      tenantUpdateData.monthlyRent = room.monthlyRent;
    }

    if (securityDeposit !== undefined) {
      tenantUpdateData.securityDeposit = securityDeposit;
    } else {
      tenantUpdateData.securityDeposit = room.securityDeposit;
    }

    await Tenant.findByIdAndUpdate(tenantId, tenantUpdateData);

    // Create deposit payment record (only if none exists)
    const existingDeposit = await Payment.findOne({ tenant: tenantId, paymentType: 'deposit' });
    const depositAmount = tenantUpdateData.securityDeposit || 0;
    
    console.log('Deposit check:', { tenantId, existingDeposit: !!existingDeposit, depositAmount });
    
    if (!existingDeposit && depositAmount > 0) {
      const depositPayment = await Payment.create({
        tenant: tenantId,
        room: req.params.id,
        amount: depositAmount,
        paymentType: 'deposit',
        paymentMethod: 'cash',
        dueDate: leaseStartDate || new Date(),
        status: 'pending',
        description: 'Security deposit',
        lateFee: { amount: 0, isLatePayment: false },
      });
      console.log('Deposit payment created:', depositPayment._id);
    } else if (existingDeposit) {
      console.log('Deposit already exists:', existingDeposit._id);
    }

    // Get updated room with tenant details
    const updatedRoom = await Room.findById(req.params.id)
      .populate('tenants', 'firstName lastName email phoneNumber tenantStatus leaseStartDate leaseEndDate');

    res.status(200).json({
      success: true,
      message: 'Tenant assigned to room successfully. Security deposit payment created.',
      data: { room: updatedRoom }
    });

  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

// @desc    Remove tenant from room
// @route   DELETE /api/rooms/:id/remove-tenant/:tenantId
// @access  Private (Admin/Staff)
export const removeTenant = catchAsync(async (req, res, next) => {
  const { id: roomId, tenantId } = req.params;

  const room = await Room.findById(roomId);
  if (!room || !room.isActive) {
    return next(new AppError('Room not found', 404));
  }

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    return next(new AppError('Tenant not found', 404));
  }

  try {
    // Remove tenant from room using the room method
    await room.removeTenant(tenantId);

    // Clear tenant lease information
    await Tenant.findByIdAndUpdate(tenantId, {
      leaseStartDate: null,
      leaseEndDate: null,
      monthlyRent: null,
      securityDeposit: null
    });

    // Get updated room with tenant details
    const updatedRoom = await Room.findById(roomId)
      .populate('tenants', 'firstName lastName email phoneNumber tenantStatus');

    res.status(200).json({
      success: true,
      message: 'Tenant removed from room successfully',
      data: { room: updatedRoom }
    });

  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

// @desc    Get available rooms
// @route   GET /api/rooms/available
// @access  Private (Admin/Staff/Tenant)
export const getAvailableRooms = catchAsync(async (req, res, next) => {
  const { roomType, floor, minArea, maxRent } = req.query;

  const rooms = await Room.findAvailable({
    roomType,
    floor: floor ? parseInt(floor) : undefined,
    minArea: minArea ? parseInt(minArea) : undefined,
    maxRent: maxRent ? parseInt(maxRent) : undefined
  });

  res.status(200).json({
    success: true,
    data: { 
      rooms,
      count: rooms.length
    }
  });
});

// @desc    Get room occupancy statistics
// @route   GET /api/rooms/stats
// @access  Private (Admin/Staff)
export const getRoomStats = catchAsync(async (req, res, next) => {
  const stats = await Room.getOccupancyStats();

  // Get additional statistics
  const roomsByType = await Room.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$roomType',
        count: { $sum: 1 },
        totalCapacity: { $sum: '$capacity' },
        currentOccupancy: { $sum: '$occupancy.current' }
      }
    }
  ]);

  const roomsByFloor = await Room.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$floor',
        count: { $sum: 1 },
        available: {
          $sum: {
            $cond: [{ $eq: ['$status', 'available'] }, 1, 0]
          }
        },
        occupied: {
          $sum: {
            $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0]
          }
        }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: stats,
      byType: roomsByType,
      byFloor: roomsByFloor
    }
  });
});

// @desc    Update room status
// @route   PATCH /api/rooms/:id/status
// @access  Private (Admin/Staff)
export const updateRoomStatus = catchAsync(async (req, res, next) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { status, notes } = req.body;

  const room = await Room.findById(req.params.id);
  if (!room || !room.isActive) {
    return next(new AppError('Room not found', 404));
  }

  // Validate status change
  if (status === 'available' && room.tenants.length > 0) {
    return next(new AppError('Cannot set room as available when tenants are assigned', 400));
  }

  room.status = status;
  if (notes) room.notes = notes;
  room.updatedBy = req.user.id;

  await room.save();

  res.status(200).json({
    success: true,
    message: 'Room status updated successfully',
    data: { room }
  });
});

// @desc    Get tenant's room (for tenant access)
// @route   GET /api/rooms/my-room
// @access  Private (Tenant only)
export const getMyRoom = catchAsync(async (req, res, next) => {
  // This should only be accessible by tenants
  if (req.userType !== 'tenant') {
    return next(new AppError('This endpoint is for tenants only', 403));
  }

  const tenant = await Tenant.findById(req.user.id).populate('room');
  
  if (!tenant.room) {
    return next(new AppError('You are not assigned to any room', 404));
  }

  const room = await Room.findById(tenant.room._id)
    .populate('tenants', 'firstName lastName phoneNumber tenantStatus');

  res.status(200).json({
    success: true,
    data: { room }
  });
});