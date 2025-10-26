import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // polymorphic reference: can point to User (staff/admin) or Tenant
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    refPath: 'userModel',
    required: true,
    index: true
  },
  userModel: {
    type: String,
    enum: ['User', 'Tenant'],
    default: 'User'
  },
  title: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 200 
  },
  message: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 1000 
  },
  type: {
    type: String,
    enum: [
      'payment_due',
      'report_update',
      'report_followup',
      'system_alert',
      'maintenance',
      'lease_reminder',
      'other'
    ],
    default: 'other',
    required: true,
    index: true
  },
  status: { 
    type: String, 
    enum: ['unread', 'read'], 
    default: 'unread', 
    required: true,
    index: true
  },
  metadata: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  expiresAt: { 
    type: Date, 
    default: null 
  },
  // who created the notification (can be a User or a Tenant)
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    refPath: 'createdByModel', 
    default: null 
  },
  createdByModel: {
    type: String,
    enum: ['User', 'Tenant'],
    default: 'User'
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index for efficient querying
notificationSchema.index({ user: 1, status: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ isArchived: 1, createdAt: -1 });

// Auto-remove expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.status = 'read';
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(notificationData) {
  try {
    const notification = new this(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = function(userId, options = {}) {
  const {
    status = null,
    type = null,
    limit = 20,
    page = 1,
    includeRead = true,
    includeArchived = false
  } = options;

  const query = { user: userId };
  
  if (status) query.status = status;
  if (type) query.type = type;
  if (!includeRead) query.status = 'unread';
  if (!includeArchived) query.isArchived = false;

  const skip = (page - 1) * limit;

  return this.find(query)
    .populate('createdBy', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to mark all as read for a user
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { user: userId, status: 'unread' },
    { status: 'read' }
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ 
    user: userId, 
    status: 'unread',
    isArchived: false
  });
};

// Static method to archive notifications older than 30 days
notificationSchema.statics.archiveOldNotifications = function() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  return this.updateMany(
    {
      isArchived: false,
      createdAt: { $lte: thirtyDaysAgo }
    },
    { isArchived: true }
  );
};

export default mongoose.model('Notification', notificationSchema);