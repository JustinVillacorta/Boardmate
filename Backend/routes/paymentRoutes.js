import express from 'express';
import {
  createPayment,
  getPayments,
  getPayment,
  updatePayment,
  deletePayment,
  markPaymentAsPaid,
  getTenantPayments,
  getOverduePayments,
  getPaymentStats,
  generateMonthlyRent,
  backfillDeposits,
  downloadReceipt,
  getReceiptData,
  getReceiptHTML
} from '../controllers/paymentController.js';
import { protect, staffOrAdmin, tenantOnly } from '../middleware/auth.js';
import {
  validatePaymentCreate,
  validatePaymentUpdate,
  validateMarkPaymentPaid
} from '../middleware/validation.js';

const router = express.Router();

// ==================== ADMIN/STAFF PAYMENT ROUTES ====================

// Payment CRUD operations (Admin/Staff only)
router.post('/', protect, staffOrAdmin, validatePaymentCreate, createPayment);
router.get('/', protect, staffOrAdmin, getPayments);
router.get('/stats', protect, staffOrAdmin, getPaymentStats);
router.get('/overdue', protect, staffOrAdmin, getOverduePayments);
router.post('/generate-monthly', protect, staffOrAdmin, generateMonthlyRent);
router.post('/backfill-deposits', protect, staffOrAdmin, backfillDeposits);

// Single payment operations (Admin/Staff only)
router.get('/:id', protect, staffOrAdmin, getPayment);
router.put('/:id', protect, staffOrAdmin, validatePaymentUpdate, updatePayment);
router.delete('/:id', protect, staffOrAdmin, deletePayment);

// Payment status operations (Admin/Staff only)
router.put('/:id/mark-paid', protect, staffOrAdmin, validateMarkPaymentPaid, markPaymentAsPaid);

// ==================== RECEIPT ROUTES ====================

// Receipt download (Admin/Staff + Tenant for own receipts)
router.get('/:id/receipt', protect, (req, res, next) => {
  // Allow both admin/staff and tenants (tenant access controlled in controller)
  next();
}, downloadReceipt);

// Receipt data preview (Admin/Staff + Tenant for own receipts)
router.get('/:id/receipt-data', protect, (req, res, next) => {
  // Allow both admin/staff and tenants (tenant access controlled in controller)
  next();
}, getReceiptData);

// Receipt HTML preview (Admin/Staff + Tenant for own receipts)
router.get('/:id/receipt-html', protect, (req, res, next) => {
  // Allow both admin/staff and tenants (tenant access controlled in controller)
  next();
}, getReceiptHTML);

// ==================== TENANT PAYMENT ROUTES ====================

// Tenant-specific payment history (Admin/Staff/Tenant can access)
router.get('/tenant/:tenantId', protect, (req, res, next) => {
  // Tenants can only access their own payment history
  if (req.userType === 'tenant' && req.user.id !== req.params.tenantId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: You can only view your own payment history'
    });
  }
  next();
}, getTenantPayments);

// Tenant payment summary by type
import { getTenantPaymentSummaryByType } from '../controllers/paymentController.js';
router.get('/tenant/:tenantId/summary', protect, (req, res, next) => {
  if (req.userType === 'tenant' && req.user.id !== req.params.tenantId) {
    return res.status(403).json({ success: false, message: 'Access denied: You can only view your own summary' });
  }
  next();
}, getTenantPaymentSummaryByType);

export default router;