import { validationResult } from 'express-validator';
import Report from '../models/Report.js';
import Tenant from '../models/Tenant.js';
import Room from '../models/Room.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import NotificationService from '../utils/notificationService.js';

// @desc    Create new report
// @route   POST /api/reports
// @access  Private (Tenant for own reports, Admin/Staff for any)
export const createReport = catchAsync(async (req, res, next) => {
  // Check validation errors
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

  // If user is a tenant, they can only create reports for themselves
  if (req.userType === 'tenant') {
    if (tenant && tenant !== req.user.id) {
      return next(new AppError('Tenants can only create reports for themselves', 403));
    }
  }

  // Use current user as tenant if not specified and user is tenant
  const reportTenant = tenant || (req.userType === 'tenant' ? req.user.id : null);

  if (!reportTenant) {
    return next(new AppError('Tenant ID is required', 400));
  }

  // Verify tenant exists
  const tenantExists = await Tenant.findById(reportTenant);
  if (!tenantExists) {
    return next(new AppError('Tenant not found', 404));
  }

  // Verify room exists
  const roomExists = await Room.findById(room);
  if (!roomExists) {
    return next(new AppError('Room not found', 404));
  }

  // If tenant is creating report, verify they are assigned to the room
  if (req.userType === 'tenant') {
    if (tenantExists.room?.toString() !== room) {
      return next(new AppError('You can only create reports for your assigned room', 403));
    }
  }

  // Create report
  const report = await Report.create({
    tenant: reportTenant,
    room,
    type,
    title,
    description,
    submittedAt: new Date()
  });

  // Populate the report data
  await report.populate([
    { path: 'tenant', select: 'firstName lastName email phoneNumber' },
    { path: 'room', select: 'roomNumber roomType floor' }
  ]);

  // Create notification for report creation
  await NotificationService.createReportNotification(report, req.user.id);

  res.status(201).json({
    success: true,
    message: 'Report submitted successfully',
    data: {
      report
    }
  });
});

// @desc    Get all reports with filtering, search, and pagination
// @route   GET /api/reports
// @access  Private (Admin/Staff see all, Tenants see own)
export const getReports = catchAsync(async (req, res, next) => {
  // Build query object
  let queryObj = {};

  // Default: exclude archived reports unless explicitly requested
  const includeArchived = req.query.isArchived === 'true';
  if (!includeArchived) {
    queryObj.isArchived = false;
  }

  // If tenant, only show their reports
  if (req.userType === 'tenant') {
    queryObj.tenant = req.user.id;
  } else {
    // For admin/staff: exclude reports from archived tenants unless explicitly requested
    const includeArchivedUsers = req.query.includeArchivedUsers === 'true';
    if (!includeArchivedUsers) {
      // Get all non-archived tenant IDs
      const Tenant = (await import('../models/Tenant.js')).default;
      const activeTenantIds = await Tenant.find({ isArchived: false }).distinct('_id');
      
      // Filter by tenant (Admin/Staff only)
      if (req.query.tenant) {
        // If specific tenant requested, check if they're active
        const requestedTenantId = req.query.tenant;
        if (activeTenantIds.some(id => id.toString() === requestedTenantId)) {
          queryObj.tenant = requestedTenantId;
        } else {
          // Requested tenant is archived, return no results
          queryObj.tenant = null;
        }
      } else {
        // No specific tenant requested, filter to active tenants only
        queryObj.tenant = { $in: activeTenantIds };
      }
    } else {
      // Include archived users - handle tenant filter normally
      if (req.query.tenant) {
        queryObj.tenant = req.query.tenant;
      }
    }
  }

  // Filter by room
  if (req.query.room) {
    queryObj.room = req.query.room;
  }

  // Filter by type
  if (req.query.type) {
    queryObj.type = req.query.type;
  }

  // Filter by status
  if (req.query.status) {
    if (Array.isArray(req.query.status)) {
      queryObj.status = { $in: req.query.status };
    } else {
      queryObj.status = req.query.status;
    }
  }

  // Filter by date range
  if (req.query.startDate || req.query.endDate) {
    queryObj.submittedAt = {};
    if (req.query.startDate) {
      queryObj.submittedAt.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      queryObj.submittedAt.$lte = new Date(req.query.endDate);
    }
  }

  // Search functionality
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    queryObj.$or = [
      { title: searchRegex },
      { description: searchRegex }
    ];
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Sort
  let sortObj = {};
  if (req.query.sortBy) {
    const sortFields = req.query.sortBy.split(',');
    sortFields.forEach(field => {
      const [key, order] = field.split(':');
      sortObj[key] = order === 'desc' ? -1 : 1;
    });
  } else {
    sortObj = { submittedAt: -1 }; // Default: newest first
  }

  // Execute query
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

  // Get total count for pagination
  const totalReports = await Report.countDocuments(queryObj);
  const totalPages = Math.ceil(totalReports / limit);

  // Calculate stats for admins/staff including follow-up data
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

// @desc    Get single report by ID
// @route   GET /api/reports/:id
// @access  Private (Admin/Staff/Tenant for own reports)
export const getReport = catchAsync(async (req, res, next) => {
  const report = await Report.findById(req.params.id)
    .populate('tenant', 'firstName lastName email phoneNumber address isArchived')
    .populate('room', 'roomNumber roomType floor amenities');

  if (!report) {
    return next(new AppError('Report not found', 404));
  }

  // Check if the report belongs to an archived tenant (unless explicitly allowed)
  const includeArchivedUsers = req.query.includeArchivedUsers === 'true';
  if (!includeArchivedUsers && report.tenant && report.tenant.isArchived) {
    return next(new AppError('Report not found', 404));
  }

  // If user is a tenant, they can only view their own reports
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

// @desc    Update report (status change)
// @route   PUT /api/reports/:id
// @access  Private (Admin/Staff only)
export const updateReport = catchAsync(async (req, res, next) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  let report = await Report.findById(req.params.id);

  if (!report) {
    return next(new AppError('Report not found', 404));
  }

  const { status } = req.body;

  // Only allow status updates
  if (!status) {
    return next(new AppError('Status is required', 400));
  }

  const oldStatus = report.status;

  // Update status
  report.status = status;
  await report.save();

  // Populate the report data
  await report.populate([
    { path: 'tenant', select: 'firstName lastName email phoneNumber' },
    { path: 'room', select: 'roomNumber roomType floor' }
  ]);

  // Create notification for status update
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

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private (Admin only)
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

// @desc    Tenant follow-up on resolved report
// @route   PUT /api/reports/:id/follow-up
// @access  Private (Tenant only for own reports)
export const createFollowUp = catchAsync(async (req, res, next) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    return next(new AppError('Report not found', 404));
  }

  // Check if user is a tenant and owns this report
  if (req.userType !== 'tenant' || report.tenant.toString() !== req.user.id) {
    return next(new AppError('You can only follow up on your own reports', 403));
  }

  // Check if report is pending
  if (report.status !== 'pending') {
    return next(new AppError('You can only follow up on pending reports', 400));
  }

  // Check if already followed up
  if (report.followUp) {
    return next(new AppError('This report has already been followed up', 400));
  }

  // Update report with follow-up (no status change)
  report.followUp = true;
  report.followUpDate = new Date();

  await report.save();

  // Populate the report data
  await report.populate([
    { path: 'tenant', select: 'firstName lastName email phoneNumber' },
    { path: 'room', select: 'roomNumber roomType floor' }
  ]);

  // Create notification for follow-up
  await NotificationService.createFollowUpNotification(report, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Follow-up submitted successfully',
    data: {
      report
    }
  });
});