import cron from 'node-cron';
import NotificationService from '../utils/notificationService.js';
import { generateMonthlyRentChargesInternal } from '../controllers/paymentController.js';
import { cleanupArchivedTenants } from './tenantCleanup.js';

class CronJobs {
  static startJobs() {
    console.log('Starting scheduled notification jobs...');

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
      timezone: "Asia/Manila"
    });

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
      timezone: "Asia/Manila"
    });

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
      timezone: "Asia/Manila"
    });

    cron.schedule('0 0 * * *', async () => {
      console.log('Running notification and announcement cleanup job...');
      try {
        const Notification = (await import('../models/Notification.js')).default;
        const notificationResult = await Notification.deleteMany({
          expiresAt: { $exists: true, $lt: new Date() }
        });
        console.log(`Cleaned up ${notificationResult.deletedCount} expired notifications`);
        const Announcement = (await import('../models/Announcement.js')).default;
        const announcementResult = await Announcement.archiveOldAnnouncements();
        console.log(`Archived ${announcementResult.modifiedCount} announcements older than 30 days`);
        const notificationArchiveResult = await Notification.archiveOldNotifications();
        console.log(`Archived ${notificationArchiveResult.modifiedCount} notifications older than 30 days`);
        const Report = (await import('../models/Report.js')).default;
        const reportResult = await Report.archiveOldReports();
        console.log(`Archived ${reportResult.modifiedCount} resolved/rejected reports older than 30 days`);
        const tenantCleanupResult = await cleanupArchivedTenants();
        console.log('Archived tenant cleanup completed:', tenantCleanupResult);
      } catch (error) {
        console.error('Error in cleanup job:', error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Manila"
    });

    console.log('All notification cron jobs started successfully');
  }

  static stopJobs() {
    cron.getTasks().forEach(task => task.stop());
    console.log('All cron jobs stopped');
  }

  static async triggerPaymentReminders() {
    try {
      await NotificationService.sendPaymentDueReminders();
      console.log('Manual payment reminders triggered successfully');
    } catch (error) {
      console.error('Error in manual payment reminder trigger:', error);
      throw error;
    }
  }

  static async triggerLeaseReminders() {
    try {
      await NotificationService.sendLeaseExpiryReminders();
      console.log('Manual lease reminders triggered successfully');
    } catch (error) {
      console.error('Error in manual lease reminder trigger:', error);
      throw error;
    }
  }

  static async triggerArchiving() {
    try {
      const results = {};
      const Announcement = (await import('../models/Announcement.js')).default;
      const announcementResult = await Announcement.archiveOldAnnouncements();
      results.announcements = announcementResult.modifiedCount;
      const Notification = (await import('../models/Notification.js')).default;
      const notificationResult = await Notification.archiveOldNotifications();
      results.notifications = notificationResult.modifiedCount;
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

  static async triggerTenantCleanup() {
    try {
      const result = await cleanupArchivedTenants();
      console.log('Manual tenant cleanup completed:', result);
      return result;
    } catch (error) {
      console.error('Error in manual tenant cleanup trigger:', error);
      throw error;
    }
  }
}

export default CronJobs;