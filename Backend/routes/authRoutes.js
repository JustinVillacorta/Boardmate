import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  archiveAccount,
  universalLogin,
} from '../controllers/authController.js';
import { protect, adminOnly, staffOrAdmin } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  validateUpdateDetails,
  validateUpdatePassword,
} from '../middleware/validation.js';

// Import tenant routes
import tenantRoutes from './tenantRoutes.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
// User registration and login
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Universal login (works for both users and tenants)
router.post('/universal-login', validateLogin, universalLogin);

// ==================== TENANT ROUTES ====================
// Mount tenant routes under /tenant
router.use('/tenant', tenantRoutes);

// ==================== SHARED PROTECTED ROUTES ====================
// Routes that work for both users and tenants
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

// ==================== USER-ONLY PROTECTED ROUTES ====================
// All routes below require authentication and user role (admin/staff)
router.put('/updatedetails', protect, staffOrAdmin, validateUpdateDetails, updateDetails);
router.put('/updatepassword', protect, staffOrAdmin, validateUpdatePassword, updatePassword);
router.delete('/archive', protect, staffOrAdmin, archiveAccount);

export default router;