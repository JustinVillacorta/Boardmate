import { validationResult } from 'express-validator';
import Notification from '../models/Notification.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getNotifications = catchAsync(async (req, res, next) => {
  const {
    status,
    type,
    page = 1,
    limit = 20,
    includeRead = true,
    includeArchived = false
  } = req.query;

  const options = {
    status: status || null,
    type: type || null,
    page: parseInt(page),
    limit: parseInt(limit),
    includeRead: includeRead === 'true',
    includeArchived: includeArchived === 'true'
  };

  const userId = req.user._id || req.user.id;

  const notifications = await Notification.getUserNotifications(userId, options);
  const totalNotifications = await Notification.countDocuments({ 
    user: userId,
    ...(status && { status }),
    ...(type && { type }),
    ...(!options.includeRead && { status: 'unread' }),
    ...(!options.includeArchived && { isArchived: false })
  });

  const unreadCount = await Notification.getUnreadCount(userId);

  res.status(200).json({
    success: true,
    count: notifications.length,
    unreadCount,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalNotifications / parseInt(limit)),
      totalNotifications,
      hasNext: parseInt(page) < Math.ceil(totalNotifications / parseInt(limit)),
      hasPrev: parseInt(page) > 1
    },
    data: {
      notifications
    }
  });
});

export const getNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id)
    .populate('createdBy', 'name email role');

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  const userId = req.user._id || req.user.id;
  if (notification.user.toString() !== userId.toString()) {
    return next(new AppError('Access denied', 403));
  }

  res.status(200).json({
    success: true,
    data: {
      notification
    }
  });
});

export const markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  const userId = req.user._id || req.user.id;
  if (notification.user.toString() !== userId.toString()) {
    return next(new AppError('Access denied', 403));
  }

  await notification.markAsRead();

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: {
      notification
    }
  });
});
export const markAllAsRead = catchAsync(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  const result = await Notification.markAllAsRead(userId);

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} notifications marked as read`,
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});

export const deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  const userId = req.user._id || req.user.id;
  if (notification.user.toString() !== userId.toString()) {
    return next(new AppError('Access denied', 403));
  }

  await Notification.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

export const getUnreadCount = catchAsync(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  const unreadCount = await Notification.getUnreadCount(userId);

  res.status(200).json({
    success: true,
    data: {
      unreadCount
    }
  });
});