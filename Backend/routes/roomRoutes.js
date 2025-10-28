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
  getContract,
  generateContract,
} from '../controllers/roomController.js';
import { protect, adminOnly, staffOrAdmin, tenantOnly, authorize } from '../middleware/auth.js';
import {
  validateRoomCreate,
  validateRoomUpdate,
  validateTenantAssignment,
  validateRoomStatusUpdate,
  validateContractGeneration,
} from '../middleware/validation.js';

const router = express.Router();

router.get('/available', protect, getAvailableRooms);

router.get('/my-room', protect, tenantOnly, getMyRoom);

router.get('/contracts/:tenantId', protect, getContract);

router.use(protect, staffOrAdmin);

router.route('/')
  .get(getRooms)
  .post(validateRoomCreate, createRoom);

router.get('/stats', getRoomStats);

router.route('/:id')
  .get(getRoom)
  .put(validateRoomUpdate, updateRoom)
  .delete(adminOnly, deleteRoom);

router.patch('/:id/status', validateRoomStatusUpdate, updateRoomStatus);

router.post('/:id/assign-tenant', validateTenantAssignment, assignTenant);
router.delete('/:id/remove-tenant/:tenantId', removeTenant);

router.post('/generate-contract', validateContractGeneration, generateContract);

export default router;