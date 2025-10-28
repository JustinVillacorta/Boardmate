import express from 'express';
import {
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} from '../controllers/notificationController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);

router.put('/mark-all-read', markAllAsRead);

router.route('/:id')
  .get(getNotification)
  .delete(deleteNotification);

router.put('/:id/read', markAsRead);

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