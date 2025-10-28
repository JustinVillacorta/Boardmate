import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { cleanupArchivedTenants, verifyRoomTenantIntegrity } from '../utils/tenantCleanup.js';

const generateToken = (userId, userType = 'user') => {
  return jwt.sign({ userId, userType }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

const sendTokenResponse = (user, statusCode, res, userType = 'user') => {
  const token = generateToken(user._id, userType);
  
  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  const messageMap = {
    201: userType === 'tenant' ? 'Tenant registered successfully' : 'User registered successfully',
    200: 'Login successful'
  };

  res.status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message: messageMap[statusCode],
      data: {
        [userType]: user.toAuthJSON(),
        token,
        userType,
      },
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = catchAsync(async (req, res, next) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { name, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { name }]
  });

  if (existingUser) {
    const field = existingUser.email === email ? 'email' : 'name';
    return next(new AppError(`User with this ${field} already exists`, 409));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'admin',
  });

  sendTokenResponse(user, 201, res, 'user');
});

// @desc    Logout user/tenant
// @route   POST /api/auth/logout
// @access  Private
export const logout = catchAsync(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true,
  });

  const userTypeText = req.userType === 'tenant' ? 'Tenant' : 'User';
  const userEmail = req.user?.email || req.user?.email || 'Unknown user';
  
  console.log(`✅ Logout successful for ${userTypeText}: ${userEmail}`);

  res.status(200).json({
    success: true,
    message: `${userTypeText} logged out successfully`,
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = catchAsync(async (req, res, next) => {
  let user;
  
  if (req.userType === 'tenant') {
    user = await Tenant.findById(req.user.id).populate({
      path: 'room',
      select: 'roomNumber roomType monthlyRent tenants',
      populate: { path: 'tenants', select: 'tenantStatus' }
    });
  } else {
    user = await User.findById(req.user.id);
  }

  if (!user || user.isArchived) {
    return next(new AppError('User not found', 404));
  }

  const responseKey = req.userType === 'tenant' ? 'tenant' : 'user';

  res.status(200).json({
    success: true,
    data: {
      [responseKey]: user.toAuthJSON(),
      userType: req.userType,
    },
  });
});

// @desc    Update tenant details (Staff/Admin only)
// @route   PUT /api/auth/staff/update-tenant/:tenantId
// @access  Private (Staff/Admin - Staff can only update tenants)
export const updateTenantByStaff = catchAsync(async (req, res, next) => {
  const { tenantId } = req.params;
  const { firstName, lastName, phoneNumber, occupation, address, emergencyContact } = req.body;

  const tenant = await Tenant.findById(tenantId);
  
  if (!tenant) {
    return next(new AppError('Tenant not found', 404));
  }

  // Update only provided fields
  const updateData = {};
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
  if (occupation !== undefined) updateData.occupation = occupation;
  if (address !== undefined) updateData.address = address;
  if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact;

  const updatedTenant = await Tenant.findByIdAndUpdate(
    tenantId,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Tenant details updated successfully',
    data: { tenant: updatedTenant }
  });
});

// @desc    Update another user's details (Admin only)
// @route   PUT /api/auth/admin/update-user/:userId
// @access  Private (Admin only)
export const updateUserByAdmin = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { name, email } = req.body;

  // Prevent updating yourself
  if (userId === req.user.id) {
    return next(new AppError('Cannot update your own account through this endpoint.', 400));
  }

  const user = await User.findById(userId);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check if name already exists (if provided)
  if (name && name !== user.name) {
    const existingUser = await User.findOne({ name, _id: { $ne: userId } });
    if (existingUser) {
      return next(new AppError('User with this name already exists', 409));
    }
  }

  // Check if email already exists (if provided)
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return next(new AppError('User with this email already exists', 409));
    }
  }

  // Update only provided fields
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'User details updated successfully',
    data: { user: updatedUser }
  });
});

// @desc    Archive another user's account (Admin only)
// @route   DELETE /api/auth/admin/archive-user/:userId
// @access  Private (Admin only)
export const archiveUserByAdmin = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  
  // Prevent archiving yourself
  if (userId === req.user.id) {
    return next(new AppError('Cannot archive your own account through this endpoint. Use /api/auth/archive instead', 400));
  }
  
  const user = await User.findById(userId);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  if (user.isArchived) {
    return next(new AppError('User is already archived', 400));
  }

  // Check if this user is also a tenant and handle room removal
  const Tenant = (await import('../models/Tenant.js')).default;
  const tenant = await Tenant.findOne({ user: userId });
  
  if (tenant && tenant.room) {
    const Room = (await import('../models/Room.js')).default;
    const room = await Room.findById(tenant.room);
    
    if (room) {
      try {
        await room.removeTenant(tenant._id);
        console.log(`User ${userId} (tenant ${tenant._id}) removed from room ${room.roomNumber} due to user archiving`);
      } catch (error) {
        console.error(`Error removing user's tenant record from room during archiving: ${error.message}`);
      }
    }
    
    // Archive the associated tenant record as well
    await Tenant.findByIdAndUpdate(
      tenant._id,
      { 
        isArchived: true, 
        tenantStatus: 'inactive',
        room: null
      },
      { new: true }
    );
  }
  
  await User.findByIdAndUpdate(userId, { isArchived: true }, { new: true });
  
  res.status(200).json({
    success: true,
    message: 'User account archived successfully and removed from room if applicable',
  });
});

// @desc    Unarchive a user's account (Admin only)
// @route   PATCH /api/auth/admin/unarchive-user/:userId
// @access  Private (Admin only)
export const unarchiveUserByAdmin = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  
  const user = await User.findById(userId);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  if (!user.isArchived) {
    return next(new AppError('User is not archived', 400));
  }
  
  await User.findByIdAndUpdate(userId, { isArchived: false }, { new: true });
  
  res.status(200).json({
    success: true,
    message: 'User account unarchived successfully',
  });
});

// @desc    Archive tenant account (Admin only)
// @route   DELETE /api/auth/admin/archive-tenant/:tenantId
// @access  Private (Admin only)
export const archiveTenantByAdmin = catchAsync(async (req, res, next) => {
  const { tenantId } = req.params;
  
  const tenant = await Tenant.findById(tenantId);
  
  if (!tenant) {
    return next(new AppError('Tenant not found', 404));
  }
  
  if (tenant.isArchived) {
    return next(new AppError('Tenant is already archived', 400));
  }

  // If tenant is assigned to a room, remove them from the room
  if (tenant.room) {
    const Room = (await import('../models/Room.js')).default;
    const room = await Room.findById(tenant.room);
    
    if (room) {
      // Use the room's removeTenant method to properly handle the removal
      try {
        await room.removeTenant(tenantId);
        console.log(`Tenant ${tenantId} removed from room ${room.roomNumber} due to archiving`);
      } catch (error) {
        console.error(`Error removing tenant from room during archiving: ${error.message}`);
        // Continue with archiving even if room removal fails
      }
    }
  }
  
  await Tenant.findByIdAndUpdate(
    tenantId, 
    { 
      isArchived: true, 
      tenantStatus: 'inactive',
      room: null // Ensure room reference is cleared
    }, 
    { new: true }
  );
  
  res.status(200).json({
    success: true,
    message: 'Tenant account archived successfully and removed from room',
  });
});

// @desc    Unarchive tenant account (Admin only)
// @route   PATCH /api/auth/admin/unarchive-tenant/:tenantId
// @access  Private (Admin only)
export const unarchiveTenantByAdmin = catchAsync(async (req, res, next) => {
  const { tenantId } = req.params;
  
  const tenant = await Tenant.findById(tenantId);
  
  if (!tenant) {
    return next(new AppError('Tenant not found', 404));
  }
  
  if (!tenant.isArchived) {
    return next(new AppError('Tenant is not archived', 400));
  }
  
  await Tenant.findByIdAndUpdate(
    tenantId, 
    { isArchived: false, tenantStatus: 'active' }, 
    { new: true }
  );
  
  res.status(200).json({
    success: true,
    message: 'Tenant account unarchived successfully',
  });
});

// ==================== TENANT AUTHENTICATION ====================

// @desc    Register tenant
// @route   POST /api/auth/tenant/register
// @access  Public
export const registerTenant = catchAsync(async (req, res, next) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const {
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    dateOfBirth,
    occupation,
    address,
    idType,
    idNumber,
    emergencyContact,
  } = req.body;

  // Check if tenant already exists
  const existingTenant = await Tenant.findOne({ email });

  if (existingTenant) {
    return next(new AppError('Tenant with this email already exists', 409));
  }

  // Create tenant
  const tenant = await Tenant.create({
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    dateOfBirth,
    occupation,
    address,
    idType,
    idNumber,
    emergencyContact,
  });

  sendTokenResponse(tenant, 201, res, 'tenant');
});

// @desc    Update tenant details
// @route   PUT /api/auth/tenant/updatedetails
// @access  Private (Tenant)
export const updateTenantDetails = catchAsync(async (req, res, next) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const {
    firstName,
    lastName,
    phoneNumber,
    occupation,
    address,
    emergencyContact,
  } = req.body;

  // Fetch current tenant so we can safely merge partial nested updates
  const currentTenant = await Tenant.findById(req.user.id);
  if (!currentTenant) {
    return next(new AppError('Tenant not found', 404));
  }

  // Build update object with only provided fields (use !== undefined so empty strings can be sent intentionally)
  const fieldsToUpdate = {};
  if (firstName !== undefined) fieldsToUpdate.firstName = firstName;
  if (lastName !== undefined) fieldsToUpdate.lastName = lastName;
  if (phoneNumber !== undefined) fieldsToUpdate.phoneNumber = phoneNumber;
  if (occupation !== undefined) fieldsToUpdate.occupation = occupation;

  // Address: support partial updates (merge) and explicit null to clear
  if (address !== undefined) {
    if (address === null) {
      fieldsToUpdate.address = null;
    } else if (typeof address === 'object') {
      const existingAddress = currentTenant.address || {};
      fieldsToUpdate.address = { ...existingAddress, ...address };
    }
  }

  // Emergency contact: merge partial updates, or allow explicit null to clear
  if (emergencyContact !== undefined) {
    if (emergencyContact === null) {
      fieldsToUpdate.emergencyContact = null;
    } else if (typeof emergencyContact === 'object') {
      const existingEmergency = currentTenant.emergencyContact || {};
      fieldsToUpdate.emergencyContact = { ...existingEmergency, ...emergencyContact };
    }
  }

  const tenant = await Tenant.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true,
    }
  ).populate('room', 'roomNumber roomType monthlyRent');

  res.status(200).json({
    success: true,
    message: 'Tenant details updated successfully',
    data: {
      tenant: tenant.toAuthJSON(),
    },
  });
});

// @desc    Update tenant password
// @route   PUT /api/auth/tenant/updatepassword
// @access  Private (Tenant)
export const updateTenantPassword = catchAsync(async (req, res, next) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { currentPassword, newPassword } = req.body;

  // Get tenant with password
  const tenant = await Tenant.findById(req.user.id).select('+password');

  // Check current password
  const isCurrentPasswordValid = await tenant.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return next(new AppError('Current password is incorrect', 401));
  }

  // Update password
  tenant.password = newPassword;
  await tenant.save();

  sendTokenResponse(tenant, 200, res, 'tenant');
});

// @desc    Universal login (both users and tenants)
// @route   POST /api/auth/universal-login
// @access  Public
export const universalLogin = catchAsync(async (req, res, next) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { email, password } = req.body;

  // First, try to find user
  let user = await User.findByEmail(email);
  let userType = 'user';

  // If not found as user, try tenant
  if (!user) {
    user = await Tenant.findByEmail(email).populate('room', 'roomNumber roomType monthlyRent');
    userType = 'tenant';
  }

  // Check if user/tenant exists and is not archived
  if (!user || user.isArchived) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return next(new AppError('Invalid credentials', 401));
  }

  console.log(`✅ Universal login successful for ${userType}: ${user.email}${userType === 'user' ? ` (${user.role})` : ''}`);
  sendTokenResponse(user, 200, res, userType);
});

// ==================== USER & TENANT MANAGEMENT ====================

// @desc    Get all staff and tenants in one response with filtering and pagination
// @route   GET /api/auth/staff-and-tenants
// @access  Private (Admin/Staff)
export const getStaffAndTenants = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    userType, // 'staff', 'tenant', or 'all'
    isArchived,
    tenantStatus,
    isVerified,
    hasRoom,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const results = {
    staff: [],
    tenants: [],
    pagination: {
      currentPage: parseInt(page),
      totalPages: 0,
      totalRecords: 0,
      hasNextPage: false,
      hasPrevPage: parseInt(page) > 1
    }
  };

  // If requesting staff or all
  if (!userType || userType === 'all' || userType === 'staff') {
    const staffQuery = { role: 'staff' };
    
    if (isArchived !== undefined) staffQuery.isArchived = isArchived === 'true';
    
    if (search) {
      staffQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    results.staff = await User.find(staffQuery)
      .select('-__v')
      .sort(sort);
  }

  // If requesting tenants or all
  if (!userType || userType === 'all' || userType === 'tenant') {
    const tenantQuery = {};
    
    if (tenantStatus) tenantQuery.tenantStatus = tenantStatus;
    if (isArchived !== undefined) tenantQuery.isArchived = isArchived === 'true';
    if (isVerified !== undefined) tenantQuery.isVerified = isVerified === 'true';
    
    if (hasRoom === 'true') {
      tenantQuery.room = { $ne: null };
    } else if (hasRoom === 'false') {
      tenantQuery.room = null;
    }

    if (search) {
      tenantQuery.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    results.tenants = await Tenant.find(tenantQuery)
      .select('-__v')
      .populate('room', 'roomNumber roomType monthlyRent status')
      .sort(sort);
  }

  // Combine and paginate results
  const allRecords = [
    ...results.staff.map(staff => ({ ...staff.toObject(), type: 'staff' })),
    ...results.tenants.map(tenant => ({ ...tenant.toObject(), type: 'tenant' }))
  ];

  // Apply pagination to combined results
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const paginatedRecords = allRecords.slice(skip, skip + parseInt(limit));

  // Update pagination info
  results.pagination.totalRecords = allRecords.length;
  results.pagination.totalPages = Math.ceil(allRecords.length / parseInt(limit));
  results.pagination.hasNextPage = skip + paginatedRecords.length < allRecords.length;

  res.status(200).json({
    success: true,
    data: {
      records: paginatedRecords,
      summary: {
        totalStaff: results.staff.length,
        totalTenants: results.tenants.length,
        totalRecords: allRecords.length
      },
      pagination: results.pagination
    }
  });
});

// @desc    Get only tenants (more detailed view for tenant management)
// @route   GET /api/auth/tenants-only
// @access  Private (Admin/Staff)
export const getTenantsOnly = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    tenantStatus,
    isArchived,
    isVerified,
    hasRoom,
    hasActiveLease,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    includeRoom = 'true',
    includePayments = 'false'
  } = req.query;

  // Build query
  const query = {};

  if (tenantStatus) query.tenantStatus = tenantStatus;
  if (isArchived !== undefined) query.isArchived = isArchived === 'true';
  if (isVerified !== undefined) query.isVerified = isVerified === 'true';
  
  // Filter by room assignment
  if (hasRoom === 'true') {
    query.room = { $ne: null };
  } else if (hasRoom === 'false') {
    query.room = null;
  }

  // Filter by active lease
  if (hasActiveLease === 'true') {
    const today = new Date();
    query.leaseStartDate = { $lte: today };
    query.$or = [
      { leaseEndDate: { $exists: false } },
      { leaseEndDate: null },
      { leaseEndDate: { $gte: today } }
    ];
  }

  // Search functionality
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phoneNumber: { $regex: search, $options: 'i' } },
      { occupation: { $regex: search, $options: 'i' } },
      { idNumber: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Sort options
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Build population options
  let populateOptions = [];
  if (includeRoom === 'true') {
    populateOptions.push({
      path: 'room',
      select: 'roomNumber roomType monthlyRent securityDeposit status floor amenities'
    });
  }

  // Execute query
  let query_builder = Tenant.find(query)
    .select('-__v -password')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  // Add population if requested
  if (populateOptions.length > 0) {
    populateOptions.forEach(pop => {
      query_builder = query_builder.populate(pop);
    });
  }

  const tenants = await query_builder.exec();

  // Get additional data if payments are requested
  if (includePayments === 'true') {
    // This would require the Payment model - for now we'll skip this
    // In a full implementation, you'd populate payment data here
  }

  // Get total count for pagination
  const total = await Tenant.countDocuments(query);

  // Get summary statistics
  const stats = await Tenant.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalTenants: { $sum: 1 },
        activeTenants: {
          $sum: { $cond: [{ $eq: ['$tenantStatus', 'active'] }, 1, 0] }
        },
        inactiveTenants: {
          $sum: { $cond: [{ $eq: ['$tenantStatus', 'inactive'] }, 1, 0] }
        },
        pendingTenants: {
          $sum: { $cond: [{ $eq: ['$tenantStatus', 'pending'] }, 1, 0] }
        },
        verifiedTenants: {
          $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] }
        },
        tenantsWithRooms: {
          $sum: { $cond: [{ $ne: ['$room', null] }, 1, 0] }
        }
      }
    }
  ]);

  const summary = stats[0] || {
    totalTenants: 0,
    activeTenants: 0,
    inactiveTenants: 0,
    pendingTenants: 0,
    verifiedTenants: 0,
    tenantsWithRooms: 0
  };

  res.status(200).json({
    success: true,
    data: {
      tenants,
      summary,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalTenants: total,
        hasNextPage: skip + tenants.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    }
  });
});


// @desc    Clean up archived tenants from rooms
// @route   POST /api/auth/admin/cleanup-archived-tenants
// @access  Private (Admin only)
export const cleanupArchivedTenantsFromRooms = catchAsync(async (req, res, next) => {
  try {
    const result = await cleanupArchivedTenants();
    
    res.status(200).json({
      success: true,
      message: 'Archived tenant cleanup completed successfully',
      data: result
    });
  } catch (error) {
    return next(new AppError('Failed to cleanup archived tenants', 500));
  }
});

// @desc    Verify room-tenant data integrity
// @route   GET /api/auth/admin/verify-room-tenant-integrity
// @access  Private (Admin only)
export const verifyRoomTenantDataIntegrity = catchAsync(async (req, res, next) => {
  try {
    const issues = await verifyRoomTenantIntegrity();
    
    res.status(200).json({
      success: true,
      message: `Integrity check completed. Found ${issues.length} issues.`,
      data: {
        issuesFound: issues.length,
        issues
      }
    });
  } catch (error) {
    return next(new AppError('Failed to verify data integrity', 500));
  }
});