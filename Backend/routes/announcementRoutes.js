import express from 'express';
import {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementStats,
  markAnnouncementAsRead
} from '../controllers/announcementController.js';
import { protect, staffOrAdmin, adminOnly } from '../middleware/auth.js';
import {
  validateAnnouncementCreate,
  validateAnnouncementUpdate
} from '../middleware/validation.js';

const router = express.Router();

router.use(protect);

router.get('/', getAnnouncements);
router.get('/stats', staffOrAdmin, getAnnouncementStats);
router.get('/:id', getAnnouncement);
router.put('/:id/read', markAnnouncementAsRead);

router.post('/', adminOnly, validateAnnouncementCreate, createAnnouncement);
router.put('/:id', adminOnly, validateAnnouncementUpdate, updateAnnouncement);
router.delete('/:id', adminOnly, deleteAnnouncement);

export default router;