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

// All routes require authentication
router.use(protect);

// Public routes (all authenticated users)
router.get('/', getAnnouncements);
router.get('/stats', staffOrAdmin, getAnnouncementStats);
router.get('/:id', getAnnouncement);
router.put('/:id/read', markAnnouncementAsRead);

// Admin/Staff only routes
router.post('/', adminOnly, validateAnnouncementCreate, createAnnouncement);
router.put('/:id', adminOnly, validateAnnouncementUpdate, updateAnnouncement);
router.delete('/:id', adminOnly, deleteAnnouncement);

export default router;