import { validationResult } from 'express-validator';
import Room from '../models/Room.js';
import Tenant from '../models/Tenant.js';
import Payment from '../models/Payment.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { generateContractPDF } from '../utils/contractGenerator.js';

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

  const query = { isActive: true };

  if (status) query.status = status;
  if (roomType) query.roomType = roomType;
  if (floor !== undefined) query.floor = parseInt(floor);
  if (minArea) query.area = { ...query.area, $gte: parseInt(minArea) };
  if (maxRent) query.monthlyRent = { ...query.monthlyRent, $lte: parseInt(maxRent) };
  
  if (available === 'true') {
    query.$expr = { $lt: ['$occupancy.current', '$capacity'] };
    query.status = { $in: ['available'] };
  }
  if (search) {
    query.$or = [
      { roomNumber: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { amenities: { $in: [new RegExp(search, 'i')] } }
    ];
  }
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const rooms = await Room.find(query)
    .populate('tenants', 'firstName lastName email phoneNumber tenantStatus')
    .populate('createdBy updatedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
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

export const createRoom = catchAsync(async (req, res, next) => {
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

export const updateRoom = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const room = await Room.findById(req.params.id);

  if (!room || !room.isActive) {
    return next(new AppError('Room not found', 404));
  }

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

export const deleteRoom = catchAsync(async (req, res, next) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    return next(new AppError('Room not found', 404));
  }

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

export const assignTenant = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { tenantId, leaseStartDate, leaseEndDate, monthlyRent, securityDeposit, contractFile, contractFileName } = req.body;

  const room = await Room.findById(req.params.id);
  if (!room || !room.isActive) {
    return next(new AppError('Room not found', 404));
  }

  const tenant = await Tenant.findById(tenantId);
  if (!tenant || tenant.isArchived) {
    return next(new AppError('Tenant not found', 404));
  }

  if (tenant.room) {
    return next(new AppError('Tenant is already assigned to a room', 400));
  }
  if (room.occupancy.current >= room.capacity) {
    return next(new AppError('Room is at full capacity', 400));
  }

  try {
    await room.addTenant(tenantId);

    // Update tenant lease information
    const tenantUpdateData = {
      leaseStartDate,
      leaseEndDate,
      tenantStatus: 'active'
    };

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

    if (contractFile) {
      tenantUpdateData.contractFile = contractFile;
      tenantUpdateData.contractUploadDate = new Date();
      tenantUpdateData.contractMimeType = 'application/pdf';
    }

    if (contractFileName) {
      tenantUpdateData.contractFileName = contractFileName;
    }

    await Tenant.findByIdAndUpdate(tenantId, tenantUpdateData);

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
    await room.removeTenant(tenantId);

    await Tenant.findByIdAndUpdate(tenantId, {
      leaseStartDate: null,
      leaseEndDate: null,
      monthlyRent: null,
      securityDeposit: null
    });

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

export const getContract = catchAsync(async (req, res, next) => {
  const { tenantId } = req.params;

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    return next(new AppError('Tenant not found', 404));
  }

  if (req.userType === 'tenant' && req.user.id !== tenantId) {
    return next(new AppError('You are not authorized to view this contract', 403));
  }

  // Check if contract exists
  if (!tenant.contractFile) {
    return next(new AppError('Contract not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      contractFile: tenant.contractFile,
      contractFileName: tenant.contractFileName || 'contract.pdf',
      contractUploadDate: tenant.contractUploadDate,
      contractMimeType: tenant.contractMimeType
    }
  });
});

export const generateContract = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { 
    tenantId, 
    roomId, 
    leaseDurationMonths, 
    leaseStartDate, 
    monthlyRent, 
    securityDeposit, 
    landlordName, 
    landlordAddress, 
    specialTerms 
  } = req.body;

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    return next(new AppError('Tenant not found', 404));
  }

  const room = await Room.findById(roomId);
  if (!room || !room.isActive) {
    return next(new AppError('Room not found', 404));
  }

  const contractData = {
    landlordName,
    landlordAddress,
    tenantName: `${tenant.firstName} ${tenant.lastName}`,
    tenantEmail: tenant.email,
    tenantPhone: tenant.phoneNumber,
    tenantAddress: tenant.address ? `${tenant.address.street || ''}, ${tenant.address.city || ''}` : 'As provided',
    roomNumber: room.roomNumber,
    roomType: room.roomType,
    roomCapacity: room.capacity,
    leaseDurationMonths: parseInt(leaseDurationMonths),
    leaseStartDate,
    monthlyRent: monthlyRent || room.monthlyRent,
    securityDeposit: securityDeposit || room.securityDeposit,
    specialTerms,
    contractDate: new Date()
  };

  try {
    const base64PDF = await generateContractPDF(contractData);
    
    const filename = `lease-agreement-${room.roomNumber}-${tenant.firstName}-${tenant.lastName}-${Date.now()}.pdf`;

    res.status(200).json({
      success: true,
      data: {
        contractFile: base64PDF,
        contractFileName: filename,
        contractDetails: {
          tenantName: contractData.tenantName,
          roomNumber: contractData.roomNumber,
          leaseStartDate: contractData.leaseStartDate,
          leaseEndDate: new Date(new Date(contractData.leaseStartDate).setMonth(new Date(contractData.leaseStartDate).getMonth() + contractData.leaseDurationMonths)).toISOString(),
          monthlyRent: contractData.monthlyRent,
          securityDeposit: contractData.securityDeposit,
          durationMonths: contractData.leaseDurationMonths
        }
      }
    });
  } catch (error) {
    console.error('Contract generation error:', error);
    return next(new AppError('Failed to generate contract', 500));
  }
});