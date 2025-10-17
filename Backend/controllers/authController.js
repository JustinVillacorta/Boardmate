import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

// Generate JWT Token
const generateToken = (userId, userType = 'user') => {
  return jwt.sign({ userId, userType }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Send response with token
const sendTokenResponse = (user, statusCode, res, userType = 'user') => {
  const token = generateToken(user._id, userType);
  
  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
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

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = catchAsync(async (req, res, next) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { email, password } = req.body;

  // Find user by email (including password)
  const user = await User.findByEmail(email);

  // Check if user exists and is not archived
  if (!user || user.isArchived) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return next(new AppError('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res, 'user');
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
    user = await Tenant.findById(req.user.id).populate('room', 'roomNumber roomType monthlyRent');
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

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private (Admin/Staff only)
export const updateDetails = catchAsync(async (req, res, next) => {
  // This function is only for User model (admin/staff), not tenants
  if (req.userType !== 'user') {
    return next(new AppError('This endpoint is for admin/staff users only', 403));
  }

  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { name, email } = req.body;
  
  // Check if new name or email already exists (exclude current user)
  if (name || email) {
    const query = { _id: { $ne: req.user.id } };
    if (name && email) {
      query.$or = [{ name }, { email }];
    } else if (name) {
      query.name = name;
    } else if (email) {
      query.email = email;
    }

    const existingUser = await User.findOne(query);
    if (existingUser) {
      const field = existingUser.name === name ? 'name' : 'email';
      return next(new AppError(`User with this ${field} already exists`, 409));
    }
  }

  const fieldsToUpdate = {};
  if (name) fieldsToUpdate.name = name;
  if (email) fieldsToUpdate.email = email;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    message: 'User details updated successfully',
    data: {
      user: user.toAuthJSON(),
    },
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private (Admin/Staff only)
export const updatePassword = catchAsync(async (req, res, next) => {
  // This function is only for User model (admin/staff), not tenants
  if (req.userType !== 'user') {
    return next(new AppError('This endpoint is for admin/staff users only', 403));
  }

  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return next(new AppError('Current password is incorrect', 401));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, 'user');
});

// @desc    Archive user account
// @route   DELETE /api/auth/archive
// @access  Private (Admin/Staff only)
export const archiveAccount = catchAsync(async (req, res, next) => {
  // This function is only for User model (admin/staff), not tenants
  if (req.userType !== 'user') {
    return next(new AppError('This endpoint is for admin/staff users only', 403));
  }

  await User.findByIdAndUpdate(
    req.user.id,
    { isArchived: true },
    { new: true }
  );

  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Account archived successfully',
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

// @desc    Login tenant
// @route   POST /api/auth/tenant/login
// @access  Public
export const loginTenant = catchAsync(async (req, res, next) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { email, password } = req.body;

  // Find tenant by email (including password)
  const tenant = await Tenant.findByEmail(email);

  // Check if tenant exists and is not archived
  if (!tenant || tenant.isArchived) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Check password
  const isPasswordValid = await tenant.comparePassword(password);
  if (!isPasswordValid) {
    return next(new AppError('Invalid credentials', 401));
  }

  sendTokenResponse(tenant, 200, res, 'tenant');
});

// @desc    Get current logged in tenant
// @route   GET /api/auth/tenant/me
// @access  Private (Tenant)
export const getTenantProfile = catchAsync(async (req, res, next) => {
  const tenant = await Tenant.findById(req.user.id).populate('room', 'roomNumber roomType monthlyRent');

  if (!tenant || tenant.isArchived) {
    return next(new AppError('Tenant not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      tenant: tenant.toAuthJSON(),
    },
  });
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

  // Build update object with only provided fields
  const fieldsToUpdate = {};
  if (firstName) fieldsToUpdate.firstName = firstName;
  if (lastName) fieldsToUpdate.lastName = lastName;
  if (phoneNumber) fieldsToUpdate.phoneNumber = phoneNumber;
  if (occupation) fieldsToUpdate.occupation = occupation;
  if (address) fieldsToUpdate.address = address;
  if (emergencyContact) fieldsToUpdate.emergencyContact = emergencyContact;

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

// @desc    Archive tenant account
// @route   DELETE /api/auth/tenant/archive
// @access  Private (Tenant)
export const archiveTenantAccount = catchAsync(async (req, res, next) => {
  await Tenant.findByIdAndUpdate(
    req.user.id,
    { isArchived: true, tenantStatus: 'inactive' },
    { new: true }
  );

  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Tenant account archived successfully',
  });
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
    user = await Tenant.findByEmail(email);
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

// @desc    Get all staff users (Staff only, no admin) with filtering and pagination
// @route   GET /api/auth/users
// @access  Private (Admin/Staff)
export const getUsers = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    isArchived,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query - only get staff users, exclude admin
  const query = { role: 'staff' };

  if (isArchived !== undefined) query.isArchived = isArchived === 'true';

  // Search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Sort options
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query
  const users = await User.find(query)
    .select('-__v')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count for pagination
  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      staff: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalStaff: total,
        hasNextPage: skip + users.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    }
  });
});

// @desc    Get all tenants with filtering and pagination
// @route   GET /api/auth/tenants
// @access  Private (Admin/Staff)
export const getTenants = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    tenantStatus,
    isArchived,
    isVerified,
    hasRoom,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
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

  // Search functionality
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phoneNumber: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Sort options
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query
  const tenants = await Tenant.find(query)
    .select('-__v')
    .populate('room', 'roomNumber roomType monthlyRent status')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count for pagination
  const total = await Tenant.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      tenants,
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

// @desc    Get authentication statistics
// @route   GET /api/auth/stats
// @access  Private (Admin/Staff)
export const getAuthStats = catchAsync(async (req, res, next) => {
  // Get user statistics
  const userStats = await User.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: [{ $eq: ['$isArchived', false] }, 1, 0] }
        },
        archivedUsers: {
          $sum: { $cond: [{ $eq: ['$isArchived', true] }, 1, 0] }
        },
        adminUsers: {
          $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
        },
        staffUsers: {
          $sum: { $cond: [{ $eq: ['$role', 'staff'] }, 1, 0] }
        }
      }
    }
  ]);

  // Get tenant statistics
  const tenantStats = await Tenant.aggregate([
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
        unverifiedTenants: {
          $sum: { $cond: [{ $eq: ['$isVerified', false] }, 1, 0] }
        },
        tenantsWithRooms: {
          $sum: { $cond: [{ $ne: ['$room', null] }, 1, 0] }
        },
        tenantsWithoutRooms: {
          $sum: { $cond: [{ $eq: ['$room', null] }, 1, 0] }
        },
        archivedTenants: {
          $sum: { $cond: [{ $eq: ['$isArchived', true] }, 1, 0] }
        }
      }
    }
  ]);

  // Get recent registrations (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentUserRegistrations = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });

  const recentTenantRegistrations = await Tenant.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });

  // Compile statistics
  const userStatsData = userStats[0] || {
    totalUsers: 0,
    activeUsers: 0,
    archivedUsers: 0,
    adminUsers: 0,
    staffUsers: 0
  };

  const tenantStatsData = tenantStats[0] || {
    totalTenants: 0,
    activeTenants: 0,
    inactiveTenants: 0,
    pendingTenants: 0,
    verifiedTenants: 0,
    unverifiedTenants: 0,
    tenantsWithRooms: 0,
    tenantsWithoutRooms: 0,
    archivedTenants: 0
  };

  res.status(200).json({
    success: true,
    data: {
      users: userStatsData,
      tenants: tenantStatsData,
      recent: {
        userRegistrations: recentUserRegistrations,
        tenantRegistrations: recentTenantRegistrations,
        totalRecentRegistrations: recentUserRegistrations + recentTenantRegistrations
      },
      totals: {
        totalAccounts: userStatsData.totalUsers + tenantStatsData.totalTenants,
        activeAccounts: userStatsData.activeUsers + tenantStatsData.activeTenants,
        archivedAccounts: userStatsData.archivedUsers + tenantStatsData.archivedTenants
      }
    }
  });
});