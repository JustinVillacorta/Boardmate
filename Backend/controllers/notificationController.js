import { validationResult } from 'express-validator';
import Notification from '../models/Notification.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import NotificationService from '../utils/notificationService.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = catchAsync(async (req, res, next) => {
  const {
    status,
    type,
    page = 1,
    limit = 20,
    includeRead = true
  } = req.query;

  const options = {
    status: status || null,
    type: type || null,
    page: parseInt(page),
    limit: parseInt(limit),
    includeRead: includeRead === 'true'
  };

  const notifications = await Notification.getUserNotifications(req.user.id, options);
  const totalNotifications = await Notification.countDocuments({ 
    user: req.user.id,
    ...(status && { status }),
    ...(type && { type }),
    ...(!options.includeRead && { status: 'unread' })
  });

  const unreadCount = await Notification.getUnreadCount(req.user.id);

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

// @desc    Get single notification
// @route   GET /api/notifications/:id
// @access  Private
export const getNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id)
    .populate('createdBy', 'name email role');

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  // Check if notification belongs to the user
  if (notification.user.toString() !== req.user.id) {
    return next(new AppError('Access denied', 403));
  }

  res.status(200).json({
    success: true,
    data: {
      notification
    }
  });
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  // Check if notification belongs to the user
  if (notification.user.toString() !== req.user.id) {
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

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/mark-all-read
// @access  Private
export const markAllAsRead = catchAsync(async (req, res, next) => {
  const result = await Notification.markAllAsRead(req.user.id);

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} notifications marked as read`,
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  // Check if notification belongs to the user
  if (notification.user.toString() !== req.user.id) {
    return next(new AppError('Access denied', 403));
  }

  await Notification.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = catchAsync(async (req, res, next) => {
  const unreadCount = await Notification.getUnreadCount(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      unreadCount
    }
  });
});

// @desc    Create system announcement (Admin only)
// @route   POST /api/notifications/announcement
// @access  Private (Admin only)
export const createAnnouncement = catchAsync(async (req, res, next) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { title, message, userIds, expiresAt } = req.body;

  await NotificationService.createSystemAnnouncement(
    title,
    message,
    userIds,
    expiresAt ? new Date(expiresAt) : null
  );

  res.status(201).json({
    success: true,
    message: 'Announcement created successfully'
  });
});