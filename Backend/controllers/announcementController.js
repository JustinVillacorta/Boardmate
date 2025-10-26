import { validationResult } from 'express-validator';
import Announcement from '../models/Announcement.js';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

// @desc    Get announcements
// @route   GET /api/announcements
// @access  Private
export const getAnnouncements = catchAsync(async (req, res, next) => {
  const {
    audience,
    priority,
    includeExpired = false,
    includeArchived = false,
    page = 1,
    limit = 20
  } = req.query;

  // Determine audience type based on user role
  let audienceType = 'all';
  if (req.userType === 'tenant') {
    audienceType = 'tenants';
  } else if (req.user.role === 'staff') {
    audienceType = 'staff';
  } else if (req.user.role === 'admin') {
    audienceType = 'admins';
  }

  // Admin/Staff can override audience filter
  if ((req.user.role === 'admin' || req.user.role === 'staff') && audience) {
    audienceType = audience;
  }

  const options = {
    includeExpired: includeExpired === 'true',
    includeArchived: includeArchived === 'true',
    limit: parseInt(limit),
    page: parseInt(page)
  };

  const userId = req.user._id || req.user.id;
  const userModel = req.userType === 'tenant' ? 'Tenant' : 'User';

  let query = {};
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

  // Base query for active announcements
  query.publishDate = { $lte: now };
  
  // Only show announcements from the last 30 days unless includeExpired is true
  if (!options.includeExpired) {
    query.publishDate = { $gte: thirtyDaysAgo, $lte: now };
  }

  // Audience filtering
  if (audienceType !== 'all') {
    query.$and = [
      {
        $or: [
          { audience: 'all' },
          { audience: audienceType },
          {
            audience: 'custom',
            'targetUsers.user': userId,
            'targetUsers.userModel': userModel
          }
        ]
      }
    ];
  }

  // Additional filters
  if (priority) query.priority = priority;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const announcements = await Announcement.find(query)
    .populate('author', 'name email role')
    .populate('targetRooms', 'roomNumber roomType')
    .sort({ publishDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalAnnouncements = await Announcement.countDocuments(query);

  // Add isRead property for each announcement based on current user
  const announcementsWithReadStatus = announcements.map(announcement => {
    const announcementObj = announcement.toObject();
    announcementObj.isRead = announcement.isReadBy(userId, userModel);
    return announcementObj;
  });

  res.status(200).json({
    success: true,
    count: announcements.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalAnnouncements / parseInt(limit)),
      totalAnnouncements,
      hasNext: parseInt(page) < Math.ceil(totalAnnouncements / parseInt(limit)),
      hasPrev: parseInt(page) > 1
    },
    data: {
      announcements: announcementsWithReadStatus
    }
  });
});

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Private
export const getAnnouncement = catchAsync(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id)
    .populate('author', 'name email role')
    .populate('targetRooms', 'roomNumber roomType')
    .populate('targetUsers.user', 'name email firstName lastName');

  if (!announcement) {
    return next(new AppError('Announcement not found', 404));
  }

  // Check access permissions
  const userId = req.user._id || req.user.id;
  const userModel = req.userType === 'tenant' ? 'Tenant' : 'User';
  
  // Admins can see all announcements
  if (req.user.role !== 'admin') {
    const canAccess = announcement.audience === 'all' ||
                     (announcement.audience === 'tenants' && req.userType === 'tenant') ||
                     (announcement.audience === 'staff' && req.user.role === 'staff') ||
                     (announcement.audience === 'admins' && req.user.role === 'admin') ||
                     (announcement.audience === 'custom' && 
                      announcement.targetUsers.some(tu => 
                        tu.user._id.toString() === userId.toString() && tu.userModel === userModel
                      ));

    if (!canAccess) {
      return next(new AppError('Access denied', 403));
    }
  }

  // Mark as read by the current user
  await announcement.markAsRead(userId, userModel);

  // Add isRead property for response
  const announcementObj = announcement.toObject();
  announcementObj.isRead = true; // Since we just marked it as read

  res.status(200).json({
    success: true,
    data: {
      announcement: announcementObj
    }
  });
});

// @desc    Mark announcement as read
// @route   PUT /api/announcements/:id/read
// @access  Private
export const markAnnouncementAsRead = catchAsync(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return next(new AppError('Announcement not found', 404));
  }

  const userId = req.user._id || req.user.id;
  const userModel = req.userType === 'tenant' ? 'Tenant' : 'User';

  // Check access permissions (same logic as getAnnouncement)
  if (req.user.role !== 'admin') {
    const canAccess = announcement.audience === 'all' ||
                     (announcement.audience === 'tenants' && req.userType === 'tenant') ||
                     (announcement.audience === 'staff' && req.user.role === 'staff') ||
                     (announcement.audience === 'admins' && req.user.role === 'admin') ||
                     (announcement.audience === 'custom' && 
                      announcement.targetUsers.some(tu => 
                        tu.user.toString() === userId.toString() && tu.userModel === userModel
                      ));

    if (!canAccess) {
      return next(new AppError('Access denied', 403));
    }
  }

  // Mark as read
  await announcement.markAsRead(userId, userModel);

  res.status(200).json({
    success: true,
    message: 'Announcement marked as read'
  });
});

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (Admin/Staff)
export const createAnnouncement = catchAsync(async (req, res, next) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const {
    title,
    content,
    audience,
    targetUsers,
    targetRooms,
    priority,
    publishDate,
    attachments
  } = req.body;

  // Validate target users if custom audience
  if (audience === 'custom' && (!targetUsers || targetUsers.length === 0)) {
    return next(new AppError('Target users are required for custom audience', 400));
  }

  const announcement = await Announcement.create({
    title,
    content,
    author: req.user.id,
    audience: audience || 'all',
    targetUsers: targetUsers || [],
    targetRooms: targetRooms || [],
    priority: priority || 'medium',
    publishDate: publishDate ? new Date(publishDate) : new Date(),
    attachments: attachments || []
  });

  await announcement.populate('author', 'name email role');

  res.status(201).json({
    success: true,
    message: 'Announcement created successfully',
    data: {
      announcement
    }
  });
});

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Admin/Staff)
export const updateAnnouncement = catchAsync(async (req, res, next) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  let announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return next(new AppError('Announcement not found', 404));
  }

  // Only author or admin can update
  if (announcement.author.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403));
  }

  const {
    title,
    content,
    audience,
    targetUsers,
    targetRooms,
    priority,
    publishDate,
    attachments
  } = req.body;

  // Update fields
  if (title !== undefined) announcement.title = title;
  if (content !== undefined) announcement.content = content;
  if (audience !== undefined) announcement.audience = audience;
  if (targetUsers !== undefined) announcement.targetUsers = targetUsers;
  if (targetRooms !== undefined) announcement.targetRooms = targetRooms;
  if (priority !== undefined) announcement.priority = priority;
  if (publishDate !== undefined) announcement.publishDate = new Date(publishDate);
  if (attachments !== undefined) announcement.attachments = attachments;

  await announcement.save();
  await announcement.populate('author', 'name email role');

  res.status(200).json({
    success: true,
    message: 'Announcement updated successfully',
    data: {
      announcement
    }
  });
});

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin only)
export const deleteAnnouncement = catchAsync(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return next(new AppError('Announcement not found', 404));
  }

  // Only author or admin can delete
  if (announcement.author.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403));
  }

  await Announcement.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Announcement deleted successfully'
  });
});

// @desc    Get announcement statistics (Admin/Staff only)
// @route   GET /api/announcements/stats
// @access  Private (Admin/Staff)
export const getAnnouncementStats = catchAsync(async (req, res, next) => {
  const priorityStats = await Announcement.aggregate([
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);

  const audienceStats = await Announcement.aggregate([
    {
      $group: {
        _id: '$audience',
        count: { $sum: 1 }
      }
    }
  ]);

  const totalAnnouncements = await Announcement.aggregate([
    {
      $group: {
        _id: null,
        totalAnnouncements: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      priorityStats,
      audienceStats,
      totalAnnouncements: totalAnnouncements[0] || { totalAnnouncements: 0 }
    }
  });
});