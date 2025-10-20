import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';

class NotificationService {
  // Create notification for report creation
  static async createReportNotification(report, createdBy) {
    try {
      // Get tenant details
      let tenant = null;
      if (report.tenant) {
        tenant = await Tenant.findById(report.tenant);
      }

      // For tenant users (self-created reports), create confirmation notification
      if (tenant && createdBy.toString() === report.tenant.toString()) {
        await Notification.createNotification({
          user: createdBy,
          userModel: 'Tenant',
          title: 'Report Submitted Successfully',
          message: `Your ${report.type} report "${report.title}" has been submitted and is now pending review by management.`,
          type: 'report_update',
          metadata: {
            reportId: report._id,
            reportType: report.type,
            reportStatus: report.status,
            roomId: report.room
          },
          createdBy: createdBy,
          createdByModel: 'Tenant'
        });
      }

      // Create notifications for all admin/staff users
      const staffUsers = await User.find({ 
        role: { $in: ['admin', 'staff'] },
        isArchived: false 
      });

      const staffNotifications = staffUsers.map(user => ({
        user: user._id,
        userModel: 'User',
        title: 'New Report Submitted',
        message: `A new ${report.type} report "${report.title}" has been submitted by a tenant and requires attention.`,
        type: 'report_update',
        metadata: {
          reportId: report._id,
          reportType: report.type,
          reportStatus: report.status,
          tenantId: report.tenant,
          roomId: report.room
        },
        createdBy: createdBy,
        createdByModel: (typeof createdBy === 'string' || createdBy instanceof String) ? 'Tenant' : 'User'
      }));

      await Promise.all(
        staffNotifications.map(notification => 
          Notification.createNotification(notification)
        )
      );

      console.log(`Created report notifications for report ${report._id}`);
    } catch (error) {
      console.error('Error creating report notification:', error);
    }
  }

  // Create notification for report status update
  static async createReportStatusNotification(report, updatedBy, oldStatus) {
    try {
      // Get tenant details and create notification for them
      if (report.tenant) {
        const statusMessages = {
          'in-progress': 'is now being worked on',
          'resolved': 'has been resolved',
          'rejected': 'has been rejected'
        };

        const message = statusMessages[report.status] || `status has been updated to ${report.status}`;

        await Notification.createNotification({
          user: report.tenant,
          title: 'Report Status Updated',
          message: `Your ${report.type} report "${report.title}" ${message}.`,
          type: 'report_update',
          metadata: {
            reportId: report._id,
            reportType: report.type,
            oldStatus: oldStatus,
            newStatus: report.status,
            roomId: report.room
          },
          createdBy: updatedBy
        });
      }

      console.log(`Created status update notification for report ${report._id}`);
    } catch (error) {
      console.error('Error creating report status notification:', error);
    }
  }

  // Create notification for payment due dates
  static async createPaymentDueNotification(payment) {
    try {
      // Check if tenant exists
      if (!payment.tenant) return;

      const dueDate = new Date(payment.dueDate);
      const now = new Date();
      const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

      let title, message, urgency;

      if (daysUntilDue <= 0) {
        title = 'Payment Overdue';
        message = `Your ${payment.paymentType} payment of $${payment.amount} was due on ${dueDate.toLocaleDateString()}. Please make payment immediately to avoid late fees.`;
        urgency = 'urgent';
      } else if (daysUntilDue <= 3) {
        title = 'Payment Due Soon';
        message = `Your ${payment.paymentType} payment of $${payment.amount} is due in ${daysUntilDue} day(s) on ${dueDate.toLocaleDateString()}.`;
        urgency = 'high';
      } else if (daysUntilDue <= 7) {
        title = 'Payment Reminder';
        message = `Reminder: Your ${payment.paymentType} payment of $${payment.amount} is due on ${dueDate.toLocaleDateString()}.`;
        urgency = 'medium';
      } else {
        return; // Don't send notifications more than 7 days in advance
      }

      await Notification.createNotification({
        user: payment.tenant,
        title: title,
        message: message,
        type: 'payment_due',
        metadata: {
          paymentId: payment._id,
          paymentType: payment.paymentType,
          amount: payment.amount,
          dueDate: payment.dueDate,
          urgency: urgency,
          roomId: payment.room
        },
        expiresAt: new Date(dueDate.getTime() + 30 * 24 * 60 * 60 * 1000) // Expire 30 days after due date
      });

      console.log(`Created payment due notification for payment ${payment._id}`);
    } catch (error) {
      console.error('Error creating payment due notification:', error);
    }
  }

  // Create notification for lease reminders
  static async createLeaseReminderNotification(tenant, daysUntilExpiry) {
    try {
      let tenantUser = null;
      if (tenant.user) {
        tenantUser = tenant.user;
      }

      if (!tenantUser) return;

      const leaseEndDate = new Date(tenant.leaseEndDate);
      
      let title, message;
      if (daysUntilExpiry <= 7) {
        title = 'Lease Expiring Soon';
        message = `Your lease expires in ${daysUntilExpiry} day(s) on ${leaseEndDate.toLocaleDateString()}. Please contact management regarding lease renewal.`;
      } else if (daysUntilExpiry <= 30) {
        title = 'Lease Renewal Reminder';
        message = `Your lease expires on ${leaseEndDate.toLocaleDateString()}. Please consider renewing your lease before it expires.`;
      } else {
        return;
      }

      await Notification.createNotification({
        user: tenantUser._id,
        title: title,
        message: message,
        type: 'lease_reminder',
        metadata: {
          tenantId: tenant._id,
          leaseEndDate: tenant.leaseEndDate,
          roomId: tenant.room,
          daysUntilExpiry: daysUntilExpiry
        },
        expiresAt: new Date(leaseEndDate.getTime() + 7 * 24 * 60 * 60 * 1000) // Expire 7 days after lease end
      });

      console.log(`Created lease reminder notification for tenant ${tenant._id}`);
    } catch (error) {
      console.error('Error creating lease reminder notification:', error);
    }
  }

  // Create system announcement
  static async createSystemAnnouncement(title, message, userIds = null, expiresAt = null) {
    try {
      let targets = [];

      if (userIds && userIds.length > 0) {
        targets = userIds.map(id => ({ id, model: 'User' }));
      } else {
        // Include all active user accounts (admins/staff/users)
        const users = await User.find({ isArchived: false }).select('_id');
        for (const u of users) {
          targets.push({ id: u._id, model: 'User' });
        }
        const tenants = await Tenant.find({ isArchived: false }).select('_id user');
        for (const t of tenants) {
          if (t.user) {
            targets.push({ id: t.user, model: 'User' });
          } else {
            targets.push({ id: t._id, model: 'Tenant' });
          }
        }
      }

      const seen = new Set();
      const uniqueTargets = [];
      for (const t of targets) {
        const key = `${String(t.model)}::${String(t.id)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        uniqueTargets.push(t);
      }

      const notifications = uniqueTargets.map(t => ({
        user: t.id,
        userModel: t.model,
        title: title,
        message: message,
        type: 'announcement',
        metadata: {
          isSystemAnnouncement: true
        },
        expiresAt: expiresAt
      }));

      await Promise.all(
        notifications.map(notification => 
          Notification.createNotification(notification)
        )
      );

      console.log(`Created system announcement for ${uniqueTargets.length} targets`);
    } catch (error) {
      console.error('Error creating system announcement:', error);
    }
  }

  // Bulk send payment due reminders (for scheduled job)
  static async sendPaymentDueReminders() {
    try {
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Find payments due within the next 7 days or overdue
      const Payment = (await import('../models/Payment.js')).default;
      const upcomingPayments = await Payment.find({
        status: { $in: ['pending', 'overdue'] },
        dueDate: { $lte: sevenDaysFromNow }
      });

      for (const payment of upcomingPayments) {
        await this.createPaymentDueNotification(payment);
      }

      console.log(`Processed ${upcomingPayments.length} payment due reminders`);
    } catch (error) {
      console.error('Error sending payment due reminders:', error);
    }
  }

  // Bulk send lease expiry reminders (for scheduled job)
  static async sendLeaseExpiryReminders() {
    try {
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const tenants = await Tenant.find({
        leaseEndDate: { $exists: true, $lte: thirtyDaysFromNow, $gte: now },
        tenantStatus: 'active',
        isArchived: false
      }).populate('user');

      for (const tenant of tenants) {
        if (tenant.leaseEndDate) {
          const daysUntilExpiry = Math.ceil((tenant.leaseEndDate - now) / (1000 * 60 * 60 * 24));
          await this.createLeaseReminderNotification(tenant, daysUntilExpiry);
        }
      }

      console.log(`Processed ${tenants.length} lease expiry reminders`);
    } catch (error) {
      console.error('Error sending lease expiry reminders:', error);
    }
  }
}

export default NotificationService;