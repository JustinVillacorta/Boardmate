import { validationResult } from 'express-validator';
import Announcement from '../models/Announcement.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getAnnouncements = catchAsync(async (req, res, next) => {
  const {
    audience,
    priority,
    includeExpired = false,
    includeArchived = false,
    page = 1,
    limit = 20
  } = req.query;

  let audienceType = 'all';
  if (req.userType === 'tenant') {
    audienceType = 'tenants';
  } else if (req.user.role === 'staff') {
    audienceType = 'staff';
  } else if (req.user.role === 'admin') {
    audienceType = 'admins';
  }

  
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

  const query = {};
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));


  query.publishDate = { $lte: now };
  if (!options.includeArchived) {
    query.isArchived = false;
  }
  

  if (!options.includeExpired) {
    query.publishDate = { $gte: thirtyDaysAgo, $lte: now };
  }


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


  if (priority) query.priority = priority;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const announcements = await Announcement.find(query)
    .populate('author', 'name email role')
    .populate('targetRooms', 'roomNumber roomType')
    .sort({ publishDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalAnnouncements = await Announcement.countDocuments(query);


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


export const getAnnouncement = catchAsync(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id)
    .populate('author', 'name email role')
    .populate('targetRooms', 'roomNumber roomType')
    .populate('targetUsers.user', 'name email firstName lastName');

  if (!announcement) {
    return next(new AppError('Announcement not found', 404));
  }


  const userId = req.user._id || req.user.id;
  const userModel = req.userType === 'tenant' ? 'Tenant' : 'User';
  

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


  await announcement.markAsRead(userId, userModel);


  const announcementObj = announcement.toObject();
  announcementObj.isRead = true; 

  res.status(200).json({
    success: true,
    data: {
      announcement: announcementObj
    }
  });
});


export const markAnnouncementAsRead = catchAsync(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return next(new AppError('Announcement not found', 404));
  }

  const userId = req.user._id || req.user.id;
  const userModel = req.userType === 'tenant' ? 'Tenant' : 'User';

 
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


  await announcement.markAsRead(userId, userModel);

  res.status(200).json({
    success: true,
    message: 'Announcement marked as read'
  });
});


export const createAnnouncement = catchAsync(async (req, res, next) => {
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

export const updateAnnouncement = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  let announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return next(new AppError('Announcement not found', 404));
  }

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

export const deleteAnnouncement = catchAsync(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return next(new AppError('Announcement not found', 404));
  }

  if (announcement.author.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403));
  }

  await Announcement.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Announcement deleted successfully'
  });
});

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