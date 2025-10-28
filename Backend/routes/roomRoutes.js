import express from 'express';
import {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  assignTenant,
  removeTenant,
  getRoomStats,
  getContract,
  generateContract,
} from '../controllers/roomController.js';
import { protect, adminOnly, staffOrAdmin } from '../middleware/auth.js';
import {
  validateRoomCreate,
  validateRoomUpdate,
  validateTenantAssignment,
  validateContractGeneration,
} from '../middleware/validation.js';

const router = express.Router();

router.get('/contracts/:tenantId', protect, getContract);

router.use(protect, staffOrAdmin);

router.route('/')
  .get(getRooms)
  .post(validateRoomCreate, createRoom);

router.get('/stats', getRoomStats);

router.route('/:id')
  .put(validateRoomUpdate, updateRoom)
  .delete(adminOnly, deleteRoom);

router.post('/:id/assign-tenant', validateTenantAssignment, assignTenant);
router.delete('/:id/remove-tenant/:tenantId', removeTenant);

router.post('/generate-contract', validateContractGeneration, generateContract);

export default router;