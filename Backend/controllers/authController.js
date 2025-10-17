import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Send response with token
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  
  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message: statusCode === 201 ? 'User registered successfully' : 'Login successful',
      data: {
        user: user.toAuthJSON(),
        token,
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

  sendTokenResponse(user, 201, res);
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

  sendTokenResponse(user, 200, res);
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = catchAsync(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user || user.isArchived) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      user: user.toAuthJSON(),
    },
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = catchAsync(async (req, res, next) => {
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
// @access  Private
export const updatePassword = catchAsync(async (req, res, next) => {
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

  sendTokenResponse(user, 200, res);
});

// @desc    Archive user account
// @route   DELETE /api/auth/archive
// @access  Private
export const archiveAccount = catchAsync(async (req, res, next) => {
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