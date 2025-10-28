import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';

class NotificationService {
  static async createReportNotification(report, createdBy) {
    try {
      let tenant = null;
      if (report.tenant) {
        tenant = await Tenant.findById(report.tenant);
      }

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

  static async createReportStatusNotification(report, updatedBy, oldStatus) {
    try {
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

  static async createFollowUpNotification(report, createdBy) {
    try {
      const staffUsers = await User.find({ 
        role: { $in: ['admin', 'staff'] },
        isArchived: false 
      });

      const staffNotifications = staffUsers.map(user => ({
        user: user._id,
        userModel: 'User',
        title: 'Report Follow-up Required',
        message: `A tenant has followed up on a resolved ${report.type} report "${report.title}". This requires immediate attention as the tenant is not satisfied with the resolution.`,
        type: 'report_followup',
        metadata: {
          reportId: report._id,
          reportType: report.type,
          reportStatus: report.status,
          tenantId: report.tenant,
          roomId: report.room,
          isFollowUp: true,
          followUpDate: report.followUpDate
        },
        createdBy: createdBy,
        createdByModel: 'Tenant'
      }));

      await Promise.all(
        staffNotifications.map(notification => 
          Notification.createNotification(notification)
        )
      );

      await Notification.createNotification({
        user: report.tenant,
        userModel: 'Tenant',
        title: 'Follow-up Submitted',
        message: `Your follow-up for the ${report.type} report "${report.title}" has been submitted successfully. Management will review your concerns and respond accordingly.`,
        type: 'report_followup',
        metadata: {
          reportId: report._id,
          reportType: report.type,
          isFollowUp: true,
          followUpDate: report.followUpDate
        },
        createdBy: createdBy,
        createdByModel: 'Tenant'
      });

      console.log(`Created follow-up notifications for report ${report._id}`);
    } catch (error) {
      console.error('Error creating follow-up notification:', error);
    }
  }

  static async createPaymentDueNotification(payment) {
    try {
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
        return;
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
        expiresAt: new Date(dueDate.getTime() + 30 * 24 * 60 * 60 * 1000)
      });

      console.log(`Created payment due notification for payment ${payment._id}`);
    } catch (error) {
      console.error('Error creating payment due notification:', error);
    }
  }

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
        expiresAt: new Date(leaseEndDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      });

      console.log(`Created lease reminder notification for tenant ${tenant._id}`);
    } catch (error) {
      console.error('Error creating lease reminder notification:', error);
    }
  }

  static async createSystemAnnouncement(title, message, userIds = null, expiresAt = null) {
    try {
      let targets = [];

      if (userIds && userIds.length > 0) {
        targets = userIds.map(id => ({ id, model: 'User' }));
      } else {
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
        type: 'system_alert',
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

  static async sendPaymentDueReminders() {
    try {
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

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