import express from 'express';
import {
  registerTenant,
  loginTenant,
  getTenantProfile,
  updateTenantDetails,
  updateTenantPassword,
  archiveTenantAccount,
} from '../controllers/authController.js';
import {
  getTenantPayments,
  downloadReceipt,
  getReceiptData,
  getReceiptHTML
} from '../controllers/paymentController.js';
import {
  createReport,
  getTenantReports,
  getReport
} from '../controllers/reportController.js';
import {
  validateReportCreate
} from '../middleware/validation.js';
import { protect, tenantOnly } from '../middleware/auth.js';
import {
  validateTenantRegister,
  validateTenantLogin,
  validateTenantUpdateDetails,
  validateTenantUpdatePassword,
} from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateTenantRegister, registerTenant);
router.post('/login', validateTenantLogin, loginTenant);

// Protected routes (tenant only)
router.use(protect, tenantOnly); // All routes below require tenant authentication

router.get('/me', getTenantProfile);
router.put('/updatedetails', validateTenantUpdateDetails, updateTenantDetails);
router.put('/updatepassword', validateTenantUpdatePassword, updateTenantPassword);
router.delete('/archive', archiveTenantAccount);

// ==================== TENANT PAYMENT & RECEIPT ROUTES ====================

// Get tenant's own payment history
router.get('/payments', (req, res, next) => {
  // Set tenantId to current user's ID for security
  req.params.tenantId = req.user.id;
  next();
}, getTenantPayments);

// Download tenant's own receipt
router.get('/payments/:id/receipt', (req, res, next) => {
  // Security check will be done in the controller
  next();
}, downloadReceipt);

// Get tenant's own receipt data
router.get('/payments/:id/receipt-data', (req, res, next) => {
  // Security check will be done in the controller
  next();
}, getReceiptData);

// Get tenant's own receipt as HTML
router.get('/payments/:id/receipt-html', (req, res, next) => {
  // Security check will be done in the controller
  next();
}, getReceiptHTML);

// ==================== TENANT REPORT ROUTES ====================

// Create maintenance/complaint report
router.post('/reports', validateReportCreate, (req, res, next) => {
  // Set tenant ID to current user for security
  req.body.tenant = req.user.id;
  next();
}, createReport);

// Get tenant's own reports
router.get('/reports', (req, res, next) => {
  // Set tenantId to current user's ID for security
  req.params.tenantId = req.user.id;
  next();
}, getTenantReports);

// Get specific report (security check in controller)
router.get('/reports/:id', getReport);

export default router;