import express from 'express';
import {
  registerTenant,
  loginTenant,
  getTenantProfile,
  updateTenantDetails,
  updateTenantPassword,
  archiveTenantAccount,
} from '../controllers/authController.js';
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

export default router;