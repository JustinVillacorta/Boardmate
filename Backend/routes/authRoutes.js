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

// Import tenant routes
import tenantRoutes from './tenantRoutes.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
// User registration
router.post('/register', validateRegister, register);

// Universal login (primary login method for both users and tenants)
router.post('/login', validateLogin, universalLogin);

// Legacy login endpoints (kept for backwards compatibility)
router.post('/user-login', validateLogin, login);
router.post('/universal-login', validateLogin, universalLogin);

// ==================== TENANT ROUTES ====================
// Mount tenant routes under /tenant
router.use('/tenant', tenantRoutes);

// ==================== SHARED PROTECTED ROUTES ====================
// Routes that work for both users and tenants
router.post('/logout', logout);
router.get('/me', protect, getMe);

// ==================== ADMIN/STAFF MANAGEMENT ROUTES ====================
// User and tenant management (Admin/Staff only)
router.get('/staff-and-tenants', protect, staffOrAdmin, getStaffAndTenants);
router.get('/users', protect, staffOrAdmin, getUsers);
router.get('/tenants', protect, staffOrAdmin, getTenants);
router.get('/tenants-only', protect, staffOrAdmin, getTenantsOnly);
router.get('/stats', protect, staffOrAdmin, getAuthStats);

// ==================== USER-ONLY PROTECTED ROUTES ====================
// All routes below require authentication and user role (admin/staff)
router.put('/updatedetails', protect, staffOrAdmin, validateUpdateDetails, updateDetails);
router.put('/updatepassword', protect, staffOrAdmin, validateUpdatePassword, updatePassword);
router.delete('/archive', protect, staffOrAdmin, archiveAccount);

// ==================== ADMIN-ONLY ROUTES ====================
// Admin-only routes for managing other users
router.put('/admin/update-user/:userId', protect, canManageStaff, validateUpdateDetails, updateUserByAdmin);
router.delete('/admin/archive-user/:userId', protect, canManageStaff, archiveUserByAdmin);
router.patch('/admin/unarchive-user/:userId', protect, canManageStaff, unarchiveUserByAdmin);

// Admin-only maintenance routes
router.post('/admin/cleanup-archived-tenants', protect, adminOnly, cleanupArchivedTenantsFromRooms);
router.get('/admin/verify-room-tenant-integrity', protect, adminOnly, verifyRoomTenantDataIntegrity);

// ==================== STAFF/ADMIN ROUTES ====================
// Staff can manage tenants, Admin can manage everything
router.put('/staff/update-tenant/:tenantId', protect, canManageTenants, updateTenantByStaff);
router.delete('/admin/archive-tenant/:tenantId', protect, canManageTenants, archiveTenantByAdmin);
router.patch('/admin/unarchive-tenant/:tenantId', protect, canManageTenants, unarchiveTenantByAdmin);

// Forgot password (OTP) routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPasswordWithOTP);

export default router;