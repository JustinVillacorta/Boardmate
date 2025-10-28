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
import { protect, staffOrAdmin } from '../middleware/auth.js';
import {
  validatePaymentCreate,
  validatePaymentUpdate,
  validateMarkPaymentPaid
} from '../middleware/validation.js';

const router = express.Router();

router.post('/', protect, staffOrAdmin, validatePaymentCreate, createPayment);
router.get('/', protect, staffOrAdmin, getPayments);
router.get('/stats', protect, staffOrAdmin, getPaymentStats);
router.get('/overdue', protect, staffOrAdmin, getOverduePayments);
router.post('/generate-monthly', protect, staffOrAdmin, generateMonthlyRent);
router.post('/backfill-deposits', protect, staffOrAdmin, backfillDeposits);


router.get('/:id', protect, staffOrAdmin, getPayment);
router.put('/:id', protect, staffOrAdmin, validatePaymentUpdate, updatePayment);
router.delete('/:id', protect, staffOrAdmin, deletePayment);


router.put('/:id/mark-paid', protect, staffOrAdmin, validateMarkPaymentPaid, markPaymentAsPaid);


router.get('/:id/receipt', protect, (req, res, next) => {
  next();
}, downloadReceipt);
router.get('/:id/receipt-data', protect, (req, res, next) => {
  next();
}, getReceiptData);
router.get('/:id/receipt-html', protect, (req, res, next) => {
  next();
}, getReceiptHTML);

router.get('/tenant/:tenantId', protect, (req, res, next) => {
  if (req.userType === 'tenant' && req.user.id !== req.params.tenantId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: You can only view your own payment history'
    });
  }
  next();
}, getTenantPayments);

import { getTenantPaymentSummaryByType } from '../controllers/paymentController.js';
router.get('/tenant/:tenantId/summary', protect, (req, res, next) => {
  if (req.userType === 'tenant' && req.user.id !== req.params.tenantId) {
    return res.status(403).json({ success: false, message: 'Access denied: You can only view your own summary' });
  }
  next();
}, getTenantPaymentSummaryByType);

export default router;