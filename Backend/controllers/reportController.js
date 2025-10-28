import { validationResult } from 'express-validator';
import Report from '../models/Report.js';
import Tenant from '../models/Tenant.js';
import Room from '../models/Room.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import NotificationService from '../utils/notificationService.js';

export const createReport = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const {
    tenant,
    room,
    type,
    title,
    description
  } = req.body;

  if (req.userType === 'tenant') {
    if (tenant && tenant !== req.user.id) {
      return next(new AppError('Tenants can only create reports for themselves', 403));
    }
  }
  const reportTenant = tenant || (req.userType === 'tenant' ? req.user.id : null);

  if (!reportTenant) {
    return next(new AppError('Tenant ID is required', 400));
  }

  const tenantExists = await Tenant.findById(reportTenant);
  if (!tenantExists) {
    return next(new AppError('Tenant not found', 404));
  }
  const roomExists = await Room.findById(room);
  if (!roomExists) {
    return next(new AppError('Room not found', 404));
  }
  if (req.userType === 'tenant') {
    if (tenantExists.room?.toString() !== room) {
      return next(new AppError('You can only create reports for your assigned room', 403));
    }
  }
  const report = await Report.create({
    tenant: reportTenant,
    room,
    type,
    title,
    description,
    submittedAt: new Date()
  });
  await report.populate([
    { path: 'tenant', select: 'firstName lastName email phoneNumber' },
    { path: 'room', select: 'roomNumber roomType floor' }
  ]);
  await NotificationService.createReportNotification(report, req.user.id);

  res.status(201).json({
    success: true,
    message: 'Report submitted successfully',
    data: {
      report
    }
  });
});

export const getReports = catchAsync(async (req, res, next) => {
  let queryObj = {};
  const includeArchived = req.query.isArchived === 'true';
  if (!includeArchived) {
    queryObj.isArchived = false;
  }
  if (req.userType === 'tenant') {
    queryObj.tenant = req.user.id;
  } else {
    const includeArchivedUsers = req.query.includeArchivedUsers === 'true';
    if (!includeArchivedUsers) {
      const Tenant = (await import('../models/Tenant.js')).default;
      const activeTenantIds = await Tenant.find({ isArchived: false }).distinct('_id');
      
      if (req.query.tenant) {
        const requestedTenantId = req.query.tenant;
        if (activeTenantIds.some(id => id.toString() === requestedTenantId)) {
          queryObj.tenant = requestedTenantId;
        } else {
          queryObj.tenant = null;
        }
      } else {
        queryObj.tenant = { $in: activeTenantIds };
      }
    } else {
      if (req.query.tenant) {
        queryObj.tenant = req.query.tenant;
      }
    }
  }
  if (req.query.room) {
    queryObj.room = req.query.room;
  }
  if (req.query.type) {
    queryObj.type = req.query.type;
  }
  if (req.query.status) {
    if (Array.isArray(req.query.status)) {
      queryObj.status = { $in: req.query.status };
    } else {
      queryObj.status = req.query.status;
    }
  }
  if (req.query.startDate || req.query.endDate) {
    queryObj.submittedAt = {};
    if (req.query.startDate) {
      queryObj.submittedAt.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      queryObj.submittedAt.$lte = new Date(req.query.endDate);
    }
  }
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    queryObj.$or = [
      { title: searchRegex },
      { description: searchRegex }
    ];
  }
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  let sortObj = {};
  if (req.query.sortBy) {
    const sortFields = req.query.sortBy.split(',');
    sortFields.forEach(field => {
      const [key, order] = field.split(':');
      sortObj[key] = order === 'desc' ? -1 : 1;
    });
  } else {
    sortObj = { submittedAt: -1 };
  }
  const reports = await Report.find(queryObj)
    .populate([
      { 
        path: 'tenant', 
        select: 'firstName lastName email phoneNumber room'
      },
      { 
        path: 'room', 
        select: 'roomNumber roomType floor'
      }
    ])
    .sort(sortObj)
    .skip(skip)
    .limit(limit);
  const totalReports = await Report.countDocuments(queryObj);
  const totalPages = Math.ceil(totalReports / limit);
  let stats = null;
  if (req.userType !== 'tenant') {
    const statusStats = await Report.aggregate([
      { $match: queryObj },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const followUpStats = await Report.aggregate([
      { $match: queryObj },
      {
        $group: {
          _id: '$followUp',
          count: { $sum: 1 }
        }
      }
    ]);

    stats = {
      status: statusStats,
      followUp: followUpStats,
      total: totalReports
    };
  }

  res.status(200).json({
    success: true,
    count: reports.length,
    pagination: {
      page,
      limit,
      totalPages,
      totalReports,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    stats,
    data: {
      reports
    }
  });
});

export const getReport = catchAsync(async (req, res, next) => {
  const report = await Report.findById(req.params.id)
    .populate('tenant', 'firstName lastName email phoneNumber address isArchived')
    .populate('room', 'roomNumber roomType floor amenities');

  if (!report) {
    return next(new AppError('Report not found', 404));
  }

  const includeArchivedUsers = req.query.includeArchivedUsers === 'true';
  if (!includeArchivedUsers && report.tenant && report.tenant.isArchived) {
    return next(new AppError('Report not found', 404));
  }
  if (req.userType === 'tenant' && report.tenant._id.toString() !== req.user.id) {
    return next(new AppError('Access denied: You can only view your own reports', 403));
  }

  res.status(200).json({
    success: true,
    data: {
      report
    }
  });
});

export const updateReport = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  let report = await Report.findById(req.params.id);

  if (!report) {
    return next(new AppError('Report not found', 404));
  }

  const { status } = req.body;

  if (!status) {
    return next(new AppError('Status is required', 400));
  }

  const oldStatus = report.status;

  report.status = status;
  await report.save();
  await report.populate([
    { path: 'tenant', select: 'firstName lastName email phoneNumber' },
    { path: 'room', select: 'roomNumber roomType floor' }
  ]);
  if (oldStatus !== status) {
    await NotificationService.createReportStatusNotification(report, req.user.id, oldStatus);
  }

  res.status(200).json({
    success: true,
    message: 'Report status updated successfully',
    data: {
      report
    }
  });
});

export const deleteReport = catchAsync(async (req, res, next) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    return next(new AppError('Report not found', 404));
  }

  await Report.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Report deleted successfully'
  });
});

export const createFollowUp = catchAsync(async (req, res, next) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    return next(new AppError('Report not found', 404));
  }

  if (req.userType !== 'tenant' || report.tenant.toString() !== req.user.id) {
    return next(new AppError('You can only follow up on your own reports', 403));
  }
  if (report.status !== 'pending') {
    return next(new AppError('You can only follow up on pending reports', 400));
  }
  if (report.followUp) {
    return next(new AppError('This report has already been followed up', 400));
  }
  report.followUp = true;
  report.followUpDate = new Date();

  await report.save();
  await report.populate([
    { path: 'tenant', select: 'firstName lastName email phoneNumber' },
    { path: 'room', select: 'roomNumber roomType floor' }
  ]);
  await NotificationService.createFollowUpNotification(report, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Follow-up submitted successfully',
    data: {
      report
    }
  });
});