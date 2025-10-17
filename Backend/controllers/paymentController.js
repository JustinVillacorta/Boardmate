import { validationResult } from 'express-validator';
import Payment from '../models/Payment.js';
import Tenant from '../models/Tenant.js';
import Room from '../models/Room.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { generateReceiptPDF } from '../utils/receiptGenerator.js';
import { generateReceiptHTML } from '../utils/receiptHTMLGenerator.js';
import NotificationService from '../utils/notificationService.js';

// @desc    Create new payment record
// @route   POST /api/payments
// @access  Private (Admin/Staff)
export const createPayment = catchAsync(async (req, res, next) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const {
    tenant,
    room,
    amount,
    paymentType,
    paymentMethod,
    paymentDate,
    dueDate,
    status,
    periodCovered,
    transactionReference,
    description,
    notes,
    lateFee
  } = req.body;

  // Verify tenant exists
  const tenantExists = await Tenant.findById(tenant);
  if (!tenantExists) {
    return next(new AppError('Tenant not found', 404));
  }

  // Verify room exists
  const roomExists = await Room.findById(room);
  if (!roomExists) {
    return next(new AppError('Room not found', 404));
  }

  // Create payment
  const payment = await Payment.create({
    tenant,
    room,
    amount,
    paymentType,
    paymentMethod,
    paymentDate: paymentDate || (status === 'paid' ? new Date() : undefined),
    dueDate,
    status: status || 'pending',
    periodCovered,
    transactionReference,
    description,
    notes,
    recordedBy: req.user.id,
    lateFee: lateFee || { amount: 0, isLatePayment: false }
  });

  // Populate the payment data
  await payment.populate([
    { path: 'tenant', select: 'firstName lastName email phoneNumber' },
    { path: 'room', select: 'roomNumber roomType monthlyRent' },
    { path: 'recordedBy', select: 'name email role' }
  ]);

  // Create payment due notification if payment is pending and due soon
  if (payment.status === 'pending') {
    await NotificationService.createPaymentDueNotification(payment);
  }

  res.status(201).json({
    success: true,
    message: 'Payment record created successfully',
    data: {
      payment
    }
  });
});

// @desc    Get all payments with filtering and pagination
// @route   GET /api/payments
// @access  Private (Admin/Staff)
export const getPayments = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    tenant,
    room,
    paymentType,
    paymentMethod,
    status,
    dateFrom,
    dateTo,
    dueFrom,
    dueTo,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = {};

  if (tenant) query.tenant = tenant;
  if (room) query.room = room;
  if (paymentType) query.paymentType = paymentType;
  if (paymentMethod) query.paymentMethod = paymentMethod;
  if (status) query.status = status;

  // Date filters for payment date
  if (dateFrom || dateTo) {
    query.paymentDate = {};
    if (dateFrom) query.paymentDate.$gte = new Date(dateFrom);
    if (dateTo) query.paymentDate.$lte = new Date(dateTo);
  }

  // Date filters for due date
  if (dueFrom || dueTo) {
    query.dueDate = {};
    if (dueFrom) query.dueDate.$gte = new Date(dueFrom);
    if (dueTo) query.dueDate.$lte = new Date(dueTo);
  }

  // Search functionality
  if (search) {
    // We'll search in populated fields via aggregation
    const searchRegex = new RegExp(search, 'i');
    query.$or = [
      { description: searchRegex },
      { notes: searchRegex },
      { receiptNumber: searchRegex },
      { transactionReference: searchRegex }
    ];
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Sort options
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with population
  const payments = await Payment.find(query)
    .populate('tenant', 'firstName lastName email phoneNumber')
    .populate('room', 'roomNumber roomType monthlyRent')
    .populate('recordedBy', 'name email role')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count
  const total = await Payment.countDocuments(query);

  // Get payment statistics
  const stats = await Payment.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  const summary = {
    totalPayments: total,
    paid: stats.find(s => s._id === 'paid') || { count: 0, totalAmount: 0 },
    pending: stats.find(s => s._id === 'pending') || { count: 0, totalAmount: 0 },
    overdue: stats.find(s => s._id === 'overdue') || { count: 0, totalAmount: 0 }
  };

  res.status(200).json({
    success: true,
    data: {
      payments,
      summary,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPayments: total,
        hasNextPage: skip + payments.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    }
  });
});

// @desc    Get single payment by ID
// @route   GET /api/payments/:id
// @access  Private (Admin/Staff)
export const getPayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id)
    .populate('tenant', 'firstName lastName email phoneNumber address occupation')
    .populate('room', 'roomNumber roomType monthlyRent securityDeposit floor amenities')
    .populate('recordedBy', 'name email role');

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      payment
    }
  });
});

// @desc    Update payment record
// @route   PUT /api/payments/:id
// @access  Private (Admin/Staff)
export const updatePayment = catchAsync(async (req, res, next) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  let payment = await Payment.findById(req.params.id);

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  const {
    amount,
    paymentType,
    paymentMethod,
    paymentDate,
    dueDate,
    status,
    periodCovered,
    transactionReference,
    description,
    notes,
    lateFee
  } = req.body;

  // Build update object
  const updateFields = {};
  if (amount !== undefined) updateFields.amount = amount;
  if (paymentType) updateFields.paymentType = paymentType;
  if (paymentMethod) updateFields.paymentMethod = paymentMethod;
  if (paymentDate !== undefined) updateFields.paymentDate = paymentDate;
  if (dueDate) updateFields.dueDate = dueDate;
  if (status) updateFields.status = status;
  if (periodCovered) updateFields.periodCovered = periodCovered;
  if (transactionReference !== undefined) updateFields.transactionReference = transactionReference;
  if (description !== undefined) updateFields.description = description;
  if (notes !== undefined) updateFields.notes = notes;
  if (lateFee) updateFields.lateFee = lateFee;

  // If marking as paid, ensure payment date is set
  if (status === 'paid' && !updateFields.paymentDate && !payment.paymentDate) {
    updateFields.paymentDate = new Date();
  }

  payment = await Payment.findByIdAndUpdate(
    req.params.id,
    updateFields,
    {
      new: true,
      runValidators: true
    }
  ).populate([
    { path: 'tenant', select: 'firstName lastName email phoneNumber' },
    { path: 'room', select: 'roomNumber roomType monthlyRent' },
    { path: 'recordedBy', select: 'name email role' }
  ]);

  res.status(200).json({
    success: true,
    message: 'Payment updated successfully',
    data: {
      payment
    }
  });
});

// @desc    Delete payment record
// @route   DELETE /api/payments/:id
// @access  Private (Admin/Staff)
export const deletePayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  await Payment.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Payment record deleted successfully'
  });
});

// @desc    Mark payment as paid
// @route   PATCH /api/payments/:id/mark-paid
// @access  Private (Admin/Staff)
export const markPaymentAsPaid = catchAsync(async (req, res, next) => {
  const { transactionReference, notes } = req.body;

  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  if (payment.status === 'paid') {
    return next(new AppError('Payment is already marked as paid', 400));
  }

  // Use the model method to mark as paid
  await payment.markAsPaid(req.user.id, transactionReference);

  // Update notes if provided
  if (notes) {
    payment.notes = notes;
    await payment.save();
  }

  // Populate and return updated payment
  await payment.populate([
    { path: 'tenant', select: 'firstName lastName email phoneNumber' },
    { path: 'room', select: 'roomNumber roomType monthlyRent' },
    { path: 'recordedBy', select: 'name email role' }
  ]);

  res.status(200).json({
    success: true,
    message: 'Payment marked as paid successfully',
    data: {
      payment
    }
  });
});

// @desc    Get tenant payment history
// @route   GET /api/payments/tenant/:tenantId
// @access  Private (Admin/Staff/Tenant)
export const getTenantPayments = catchAsync(async (req, res, next) => {
  const { tenantId } = req.params;
  const {
    page = 1,
    limit = 10,
    paymentType,
    status,
    sortBy = 'dueDate',
    sortOrder = 'desc'
  } = req.query;

  // Check if tenant exists
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    return next(new AppError('Tenant not found', 404));
  }

  // Build query
  const query = { tenant: tenantId };
  if (paymentType) query.paymentType = paymentType;
  if (status) query.status = status;

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Sort options
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Get payments
  const payments = await Payment.find(query)
    .populate('room', 'roomNumber roomType monthlyRent')
    .populate('recordedBy', 'name email role')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count
  const total = await Payment.countDocuments(query);

  // Get payment summary for this tenant
  const summary = await Payment.getTenantPaymentSummary(tenantId);

  res.status(200).json({
    success: true,
    data: {
      tenant: {
        _id: tenant._id,
        firstName: tenant.firstName,
        lastName: tenant.lastName,
        email: tenant.email
      },
      payments,
      summary,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPayments: total,
        hasNextPage: skip + payments.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    }
  });
});

// @desc    Get overdue payments
// @route   GET /api/payments/overdue
// @access  Private (Admin/Staff)
export const getOverduePayments = catchAsync(async (req, res, next) => {
  const overduePayments = await Payment.getOverduePayments();

  res.status(200).json({
    success: true,
    data: {
      overduePayments,
      count: overduePayments.length
    }
  });
});

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private (Admin/Staff)
export const getPaymentStats = catchAsync(async (req, res, next) => {
  const { year, month } = req.query;
  
  // Build date filter
  let dateFilter = {};
  if (year) {
    const startDate = new Date(year, month ? month - 1 : 0, 1);
    const endDate = month 
      ? new Date(year, month, 0) 
      : new Date(year + 1, 0, 0);
    
    dateFilter = {
      paymentDate: {
        $gte: startDate,
        $lte: endDate
      }
    };
  }

  // Get comprehensive statistics
  const stats = await Payment.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        paidCount: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
        paidAmount: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] } },
        pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        pendingAmount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } },
        overdueCount: { $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] } },
        overdueAmount: { $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, '$amount', 0] } }
      }
    }
  ]);

  // Get payment by type
  const paymentsByType = await Payment.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: '$paymentType',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  // Get payment by method
  const paymentsByMethod = await Payment.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: '$paymentMethod',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  const summary = stats[0] || {
    totalPayments: 0,
    totalAmount: 0,
    paidCount: 0,
    paidAmount: 0,
    pendingCount: 0,
    pendingAmount: 0,
    overdueCount: 0,
    overdueAmount: 0
  };

  res.status(200).json({
    success: true,
    data: {
      summary,
      paymentsByType,
      paymentsByMethod
    }
  });
});

// @desc    Download receipt for a payment
// @route   GET /api/payments/:id/receipt
// @access  Private (Admin/Staff/Tenant - own receipts only)
export const downloadReceipt = catchAsync(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id)
    .populate('tenant', 'firstName lastName email phoneNumber address')
    .populate('room', 'roomNumber roomType monthlyRent floor')
    .populate('recordedBy', 'name email role');

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  // Check if payment is paid (only paid payments can have receipts downloaded)
  if (payment.status !== 'paid') {
    return next(new AppError('Receipt can only be downloaded for paid payments', 400));
  }

  // If user is a tenant, they can only download their own receipts
  if (req.userType === 'tenant' && payment.tenant._id.toString() !== req.user.id) {
    return next(new AppError('Access denied: You can only download your own receipts', 403));
  }

  try {
    // Generate PDF receipt
    const pdfBuffer = await generateReceiptPDF(payment);

    // Set response headers for PDF download
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="receipt-${payment.receiptNumber}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    // Send the PDF buffer
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Receipt generation error:', error);
    return next(new AppError('Error generating receipt', 500));
  }
});

// @desc    Get receipt data (JSON format for preview)
// @route   GET /api/payments/:id/receipt-data
// @access  Private (Admin/Staff/Tenant - own receipts only)
export const getReceiptData = catchAsync(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id)
    .populate('tenant', 'firstName lastName email phoneNumber address')
    .populate('room', 'roomNumber roomType monthlyRent floor')
    .populate('recordedBy', 'name email role');

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  // Check if payment is paid
  if (payment.status !== 'paid') {
    return next(new AppError('Receipt data can only be viewed for paid payments', 400));
  }

  // If user is a tenant, they can only view their own receipts
  if (req.userType === 'tenant' && payment.tenant._id.toString() !== req.user.id) {
    return next(new AppError('Access denied: You can only view your own receipts', 403));
  }

  // Format receipt data
  const receiptData = {
    receiptInfo: {
      receiptNumber: payment.receiptNumber,
      paymentDate: payment.paymentDate,
      dueDate: payment.dueDate,
      issueDate: new Date()
    },
    tenant: {
      name: `${payment.tenant.firstName} ${payment.tenant.lastName}`,
      email: payment.tenant.email,
      phone: payment.tenant.phoneNumber,
      address: payment.tenant.address
    },
    room: {
      roomNumber: payment.room.roomNumber,
      roomType: payment.room.roomType,
      floor: payment.room.floor,
      monthlyRent: payment.room.monthlyRent
    },
    payment: {
      amount: payment.amount,
      paymentType: payment.paymentType,
      paymentMethod: payment.paymentMethod,
      description: payment.description,
      notes: payment.notes,
      periodCovered: payment.periodCovered,
      transactionReference: payment.transactionReference
    },
    lateFee: payment.lateFee,
    recordedBy: payment.recordedBy ? {
      name: payment.recordedBy.name,
      email: payment.recordedBy.email,
      role: payment.recordedBy.role
    } : null,
    total: payment.amount + (payment.lateFee?.amount || 0)
  };

  res.status(200).json({
    success: true,
    data: {
      receipt: receiptData
    }
  });
});

// @desc    Get receipt as HTML (for web preview)
// @route   GET /api/payments/:id/receipt-html
// @access  Private (Admin/Staff/Tenant - own receipts only)
export const getReceiptHTML = catchAsync(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id)
    .populate('tenant', 'firstName lastName email phoneNumber address')
    .populate('room', 'roomNumber roomType monthlyRent floor')
    .populate('recordedBy', 'name email role');

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  // Check if payment is paid
  if (payment.status !== 'paid') {
    return next(new AppError('Receipt can only be viewed for paid payments', 400));
  }

  // If user is a tenant, they can only view their own receipts
  if (req.userType === 'tenant' && payment.tenant._id.toString() !== req.user.id) {
    return next(new AppError('Access denied: You can only view your own receipts', 403));
  }

  try {
    // Generate HTML receipt
    const htmlContent = generateReceiptHTML(payment);

    // Set response headers for HTML
    res.set({
      'Content-Type': 'text/html',
      'Content-Disposition': `inline; filename="receipt-${payment.receiptNumber}.html"`,
    });

    // Send the HTML content
    res.status(200).send(htmlContent);
  } catch (error) {
    console.error('HTML receipt generation error:', error);
    return next(new AppError('Error generating HTML receipt', 500));
  }
});