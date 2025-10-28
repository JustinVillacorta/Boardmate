import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies && req.cookies.token;
  }

  if (!token) {
    return next(new AppError('Not authorized, no token provided', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    if (decoded.userType === 'tenant') {
      user = await Tenant.findById(decoded.userId);
    } else {
      user = await User.findById(decoded.userId);
    }

    if (!user) {
      return next(new AppError('Not authorized, user not found', 401));
    }

    if (user.isArchived) {
      return next(new AppError('Account has been archived', 401));
    }

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

export const authorize = (...rolesOrTypes) => {
  return (req, res, next) => {
    if (req.userType === 'tenant' && rolesOrTypes.includes('tenant')) {
      return next();
    }

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

export const adminOnly = authorize('admin');

export const tenantOnly = authorize('tenant');

export const staffOrAdmin = authorize('admin', 'staff');

export const canManageTenants = (req, res, next) => {
  if (req.userType !== 'user') {
    return next(new AppError('Access denied. User role required', 403));
  }

  if (req.user.role === 'admin') {
    return next();
  }

  if (req.user.role === 'staff') {
    return next();
  }

  return next(new AppError('Access denied. Admin or staff role required', 403));
};

export const canManageStaff = (req, res, next) => {
  if (req.userType !== 'user' || req.user.role !== 'admin') {
    return next(new AppError('Access denied. Admin role required', 403));
  }
  next();
};

export const optionalAuth = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies && req.cookies.token;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

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
    console.log('Optional auth failed:', error.message);
  }

  next();
});