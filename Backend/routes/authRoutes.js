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
  getUsers,
  getTenants,
  getTenantsOnly,
  getAuthStats,
  getStaffAndTenants,
  updateTenantByStaff,
  updateUserByAdmin,
  archiveUserByAdmin,
  unarchiveUserByAdmin,
  archiveTenantByAdmin,
  unarchiveTenantByAdmin,
  forgotPassword, 
  verifyOTP, 
  resetPasswordWithOTP,
  cleanupArchivedTenantsFromRooms,
  verifyRoomTenantDataIntegrity
} from '../controllers/authController.js';
import { protect, adminOnly, staffOrAdmin, canManageTenants, canManageStaff } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  validateUpdateDetails,
  validateUpdatePassword,
} from '../middleware/validation.js';
import tenantRoutes from './tenantRoutes.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, universalLogin);
router.post('/user-login', validateLogin, login);
router.post('/universal-login', validateLogin, universalLogin);

router.use('/tenant', tenantRoutes);

router.post('/logout', logout);
router.get('/me', protect, getMe);

router.get('/staff-and-tenants', protect, staffOrAdmin, getStaffAndTenants);
router.get('/users', protect, staffOrAdmin, getUsers);
router.get('/tenants', protect, staffOrAdmin, getTenants);
router.get('/tenants-only', protect, staffOrAdmin, getTenantsOnly);
router.get('/stats', protect, staffOrAdmin, getAuthStats);

router.put('/updatedetails', protect, staffOrAdmin, validateUpdateDetails, updateDetails);
router.put('/updatepassword', protect, staffOrAdmin, validateUpdatePassword, updatePassword);
router.delete('/archive', protect, staffOrAdmin, archiveAccount);

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