import express from 'express';
import {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  assignTenant,
  removeTenant,
  getAvailableRooms,
  getRoomStats,
  updateRoomStatus,
  getMyRoom,
} from '../controllers/roomController.js';
import { protect, adminOnly, staffOrAdmin, tenantOnly, authorize } from '../middleware/auth.js';
import {
  validateRoomCreate,
  validateRoomUpdate,
  validateTenantAssignment,
  validateRoomStatusUpdate,
} from '../middleware/validation.js';

const router = express.Router();

// ==================== PUBLIC/SHARED ROUTES ====================
// Get available rooms (accessible by all authenticated users)
router.get('/available', protect, getAvailableRooms);

// ==================== TENANT-ONLY ROUTES ====================
// Get tenant's own room
router.get('/my-room', protect, tenantOnly, getMyRoom);

// ==================== ADMIN/STAFF ROUTES ====================
// All routes below require admin or staff access
router.use(protect, staffOrAdmin);

// Room CRUD operations
router.route('/')
  .get(getRooms)                                    // Get all rooms with filtering
  .post(validateRoomCreate, createRoom);            // Create new room

// Room statistics
router.get('/stats', getRoomStats);

// Individual room operations
router.route('/:id')
  .get(getRoom)                                     // Get single room
  .put(validateRoomUpdate, updateRoom)              // Update room
  .delete(adminOnly, deleteRoom);                   // Delete room (admin only)

// Room status management
router.patch('/:id/status', validateRoomStatusUpdate, updateRoomStatus);

// Tenant assignment operations
router.post('/:id/assign-tenant', validateTenantAssignment, assignTenant);
router.delete('/:id/remove-tenant/:tenantId', removeTenant);

export default router;