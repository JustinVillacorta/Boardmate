import cron from 'node-cron';
import NotificationService from '../utils/notificationService.js';
import { generateMonthlyRentChargesInternal } from '../controllers/paymentController.js';

class CronJobs {
  // Start all scheduled jobs
  static startJobs() {
    console.log('Starting scheduled notification jobs...');

    // Daily payment reminder job - runs every day at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      console.log('Running daily payment reminder job...');
      try {
        await NotificationService.sendPaymentDueReminders();
        console.log('Daily payment reminders completed');
      } catch (error) {
        console.error('Error in daily payment reminder job:', error);
      }
    }, {
      scheduled: true,
      timezone: "America/New_York" // Adjust timezone as needed
    });

    // Monthly rent generation - runs on the 1st day at 08:00 AM
    cron.schedule('0 8 1 * *', async () => {
      console.log('Running monthly rent generation job...');
      try {
        const target = new Date();
        target.setDate(1);
        const result = await generateMonthlyRentChargesInternal(target, null);
        console.log('Monthly rent generation completed:', result);
      } catch (error) {
        console.error('Error in monthly rent generation job:', error);
      }
    }, {
      scheduled: true,
      timezone: "America/New_York"
    });

    // Weekly lease reminder job - runs every Monday at 10:00 AM
    cron.schedule('0 10 * * 1', async () => {
      console.log('Running weekly lease reminder job...');
      try {
        await NotificationService.sendLeaseExpiryReminders();
        console.log('Weekly lease reminders completed');
      } catch (error) {
        console.error('Error in weekly lease reminder job:', error);
      }
    }, {
      scheduled: true,
      timezone: "America/New_York" // Adjust timezone as needed
    });

    // Clean up expired notifications and announcements - runs every day at midnight
    cron.schedule('0 0 * * *', async () => {
      console.log('Running notification and announcement cleanup job...');
      try {
        // Clean up expired notifications
        const Notification = (await import('../models/Notification.js')).default;
        const notificationResult = await Notification.deleteMany({
          expiresAt: { $exists: true, $lt: new Date() }
        });
        console.log(`Cleaned up ${notificationResult.deletedCount} expired notifications`);

        // Archive old announcements (30 days old)
        const Announcement = (await import('../models/Announcement.js')).default;
        const announcementResult = await Announcement.archiveOldAnnouncements();
        console.log(`Archived ${announcementResult.modifiedCount} announcements older than 30 days`);

        // Archive old notifications (30 days old)
        const notificationArchiveResult = await Notification.archiveOldNotifications();
        console.log(`Archived ${notificationArchiveResult.modifiedCount} notifications older than 30 days`);

        // Archive old resolved/rejected reports (30 days old)
        const Report = (await import('../models/Report.js')).default;
        const reportResult = await Report.archiveOldReports();
        console.log(`Archived ${reportResult.modifiedCount} resolved/rejected reports older than 30 days`);
      } catch (error) {
        console.error('Error in cleanup job:', error);
      }
    }, {
      scheduled: true,
      timezone: "America/New_York" // Adjust timezone as needed
    });

    console.log('All notification cron jobs started successfully');
  }

  // Stop all jobs (for graceful shutdown)
  static stopJobs() {
    cron.getTasks().forEach(task => task.stop());
    console.log('All cron jobs stopped');
  }

  // Manual trigger for payment reminders (for testing)
  static async triggerPaymentReminders() {
    try {
      await NotificationService.sendPaymentDueReminders();
      console.log('Manual payment reminders triggered successfully');
    } catch (error) {
      console.error('Error in manual payment reminder trigger:', error);
      throw error;
    }
  }

  // Manual trigger for lease reminders (for testing)
  static async triggerLeaseReminders() {
    try {
      await NotificationService.sendLeaseExpiryReminders();
      console.log('Manual lease reminders triggered successfully');
    } catch (error) {
      console.error('Error in manual lease reminder trigger:', error);
      throw error;
    }
  }

  // Manual trigger for archiving old content (for testing)
  static async triggerArchiving() {
    try {
      const results = {};

      // Archive announcements
      const Announcement = (await import('../models/Announcement.js')).default;
      const announcementResult = await Announcement.archiveOldAnnouncements();
      results.announcements = announcementResult.modifiedCount;

      // Archive notifications  
      const Notification = (await import('../models/Notification.js')).default;
      const notificationResult = await Notification.archiveOldNotifications();
      results.notifications = notificationResult.modifiedCount;

      // Archive reports
      const Report = (await import('../models/Report.js')).default;
      const reportResult = await Report.archiveOldReports();
      results.reports = reportResult.modifiedCount;

      console.log(`Manual archiving completed:`, results);
      return results;
    } catch (error) {
      console.error('Error in manual archiving trigger:', error);
      throw error;
    }
  }
}

export default CronJobs;