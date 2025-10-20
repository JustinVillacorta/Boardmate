import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

// Protect routes - require authentication
export const protect = catchAsync(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies && req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new AppError('Not authorized, no token provided', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    // Get user from token based on userType
    if (decoded.userType === 'tenant') {
      user = await Tenant.findById(decoded.userId);
    } else {
      user = await User.findById(decoded.userId);
    }

    if (!user) {
      return next(new AppError('Not authorized, user not found', 401));
    }

    // Check if user is archived
    if (user.isArchived) {
      return next(new AppError('Account has been archived', 401));
    }

    // Add user info to request
    req.user = user;
    req.userType = decoded.userType || 'user';
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Not authorized, invalid token', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Not authorized, token expired', 401));
    }
    return next(new AppError('Not authorized, token verification failed', 401));
  }
});

// Authorize specific roles (for users) or user types
export const authorize = (...rolesOrTypes) => {
  return (req, res, next) => {
    // Check if it's a tenant and tenant is allowed
    if (req.userType === 'tenant' && rolesOrTypes.includes('tenant')) {
      return next();
    }

    // Check user roles (admin/staff)
    if (req.userType === 'user' && req.user.role && rolesOrTypes.includes(req.user.role)) {
      return next();
    }

    return next(
      new AppError(
        `Access denied. Required roles/types: ${rolesOrTypes.join(', ')}`,
        403
      )
    );
  };
};

// Check if user is admin
export const adminOnly = authorize('admin');

// Check if user is tenant
export const tenantOnly = authorize('tenant');

// Check if user is admin or staff
export const staffOrAdmin = authorize('admin', 'staff');

// Optional authentication - doesn't fail if no token
export const optionalAuth = catchAsync(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies && req.cookies.token;
  }

  // If no token, continue without user
  if (!token) {
    return next();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token based on userType
    let user;
    if (decoded.userType === 'tenant') {
      user = await Tenant.findById(decoded.userId);
    } else {
      user = await User.findById(decoded.userId);
    }

    if (user && !user.isArchived) {
      req.user = user;
      req.userType = decoded.userType || 'user';
    }
  } catch (error) {
    // Continue without user if token is invalid
    console.log('Optional auth failed:', error.message);
  }

  next();
});