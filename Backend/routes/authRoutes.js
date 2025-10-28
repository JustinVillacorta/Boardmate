import express from 'express';
import {
  register,
  logout,
  getMe,
  universalLogin,
  getTenantsOnly,
  getStaffAndTenants,
  updateTenantByStaff,
  updateUserByAdmin,
  archiveUserByAdmin,
  unarchiveUserByAdmin,
  archiveTenantByAdmin,
  unarchiveTenantByAdmin,
  cleanupArchivedTenantsFromRooms,
  verifyRoomTenantDataIntegrity
} from '../controllers/authController.js';
import {
  forgotPassword,
  verifyOTP,
  resetPasswordWithOTP
} from '../controllers/passwordResetController.js';
import { protect, adminOnly, staffOrAdmin, canManageTenants, canManageStaff } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  validateUpdateDetails,
} from '../middleware/validation.js';
import tenantRoutes from './tenantRoutes.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, universalLogin);

router.use('/tenant', tenantRoutes);

router.post('/logout', logout);
router.get('/me', protect, getMe);

router.get('/staff-and-tenants', protect, staffOrAdmin, getStaffAndTenants);
router.get('/tenants-only', protect, staffOrAdmin, getTenantsOnly);

router.put('/admin/update-user/:userId', protect, canManageStaff, validateUpdateDetails, updateUserByAdmin);
router.delete('/admin/archive-user/:userId', protect, canManageStaff, archiveUserByAdmin);
router.patch('/admin/unarchive-user/:userId', protect, canManageStaff, unarchiveUserByAdmin);

router.post('/admin/cleanup-archived-tenants', protect, adminOnly, cleanupArchivedTenantsFromRooms);
router.get('/admin/verify-room-tenant-integrity', protect, adminOnly, verifyRoomTenantDataIntegrity);

router.put('/staff/update-tenant/:tenantId', protect, canManageTenants, updateTenantByStaff);
router.delete('/admin/archive-tenant/:tenantId', protect, canManageTenants, archiveTenantByAdmin);
router.patch('/admin/unarchive-tenant/:tenantId', protect, canManageTenants, unarchiveTenantByAdmin);

router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPasswordWithOTP);

export default router;