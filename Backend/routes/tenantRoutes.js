import express from 'express';
import {
  registerTenant,
  updateTenantDetails,
  updateTenantPassword,
} from '../controllers/authController.js';
import {
  getTenantPayments,
  downloadReceipt,
  getReceiptData,
  getReceiptHTML
} from '../controllers/paymentController.js';
import {
  createReport,
  getReports,
  getReport
} from '../controllers/reportController.js';
import {
  validateReportCreate
} from '../middleware/validation.js';
import { protect, tenantOnly } from '../middleware/auth.js';
import {
  validateTenantRegister,
  validateTenantUpdateDetails,
  validateTenantUpdatePassword,
} from '../middleware/validation.js';

const router = express.Router();

router.post('/register', validateTenantRegister, registerTenant);

router.use(protect, tenantOnly);

router.put('/updatedetails', validateTenantUpdateDetails, updateTenantDetails);
router.put('/updatepassword', validateTenantUpdatePassword, updateTenantPassword);

router.get('/payments', (req, res, next) => {
  req.params.tenantId = req.user.id;
  next();
}, getTenantPayments);

router.get('/payments/:id/receipt', (req, res, next) => {
  next();
}, downloadReceipt);

router.get('/payments/:id/receipt-data', (req, res, next) => {
  next();
}, getReceiptData);

router.get('/payments/:id/receipt-html', (req, res, next) => {
  next();
}, getReceiptHTML);

router.post('/reports', validateReportCreate, (req, res, next) => {
  req.body.tenant = req.user.id;
  next();
}, createReport);

router.get('/reports', (req, res, next) => {
  req.params.tenantId = req.user.id;
  next();
}, getReports);

router.get('/reports/:id', getReport);

export default router;