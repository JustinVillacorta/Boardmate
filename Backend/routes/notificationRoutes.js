import express from 'express';
import {
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  createAnnouncement
} from '../controllers/notificationController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validateAnnouncement } from '../middleware/validation.js';

const router = express.Router();

// Public routes (for authenticated users)
router.use(protect); // All routes require authentication

// Get user's notifications and unread count
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);

// Mark all as read
router.put('/mark-all-read', markAllAsRead);

// Single notification operations
router.route('/:id')
  .get(getNotification)
  .delete(deleteNotification);

// Mark single notification as read
router.put('/:id/read', markAsRead);

// Admin-only routes
router.post('/announcement', adminOnly, validateAnnouncement, createAnnouncement);

// Manual trigger routes (for testing - Admin only)
router.post('/trigger/payment-reminders', adminOnly, async (req, res) => {
  try {
    const CronJobs = (await import('../utils/cronJobs.js')).default;
    await CronJobs.triggerPaymentReminders();
    res.json({ success: true, message: 'Payment reminders triggered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error triggering payment reminders', error: error.message });
  }
});

router.post('/trigger/lease-reminders', adminOnly, async (req, res) => {
  try {
    const CronJobs = (await import('../utils/cronJobs.js')).default;
    await CronJobs.triggerLeaseReminders();
    res.json({ success: true, message: 'Lease reminders triggered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error triggering lease reminders', error: error.message });
  }
});

export default router;