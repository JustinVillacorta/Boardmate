import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  audience: {
    type: String,
    enum: ['all', 'tenants', 'staff', 'admins', 'custom'],
    default: 'all',
    required: true
  },
  targetUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'targetUsers.userModel'
    },
    userModel: {
      type: String,
      enum: ['User', 'Tenant']
    }
  }],
  targetRooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'readBy.userModel'
    },
    userModel: {
      type: String,
      enum: ['User', 'Tenant']
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    name: String,
    url: String,
    size: Number,
    type: String
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

announcementSchema.index({ publishDate: -1 });
announcementSchema.index({ audience: 1, publishDate: -1 });
announcementSchema.index({ author: 1 });
announcementSchema.index({ isArchived: 1, publishDate: -1 });
announcementSchema.index({ 'readBy.user': 1, 'readBy.userModel': 1 });

announcementSchema.virtual('isActive').get(function() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  return !this.isArchived && 
         this.publishDate <= now && 
         this.publishDate > thirtyDaysAgo;
});

announcementSchema.virtual('shouldArchive').get(function() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  return !this.isArchived && this.publishDate <= thirtyDaysAgo;
});

announcementSchema.methods.isReadBy = function(userId, userModel = 'User') {
  return this.readBy.some(read => 
    read.user.toString() === userId.toString() && read.userModel === userModel
  );
};

announcementSchema.methods.markAsRead = function(userId, userModel = 'User') {
  if (!this.isReadBy(userId, userModel)) {
    this.readBy.push({
      user: userId,
      userModel: userModel,
      readAt: new Date()
    });
    return this.save();
  }
  return Promise.resolve(this);
};

announcementSchema.statics.getForAudience = function(audienceType, userId = null, userModel = 'User', options = {}) {
  const {
    includeExpired = false,
    includeArchived = false,
    limit = 20,
    page = 1
  } = options;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const query = {};

  if (!includeArchived) {
    query.isArchived = false;
  }

  query.publishDate = { $lte: now };
  
  if (!includeExpired) {
    query.publishDate = { $gte: thirtyDaysAgo, $lte: now };
  }

  if (audienceType !== 'all') {
    query.$or = [
      { audience: 'all' },
      { audience: audienceType }
    ];

    if (userId) {
      query.$or.push({
        audience: 'custom',
        'targetUsers.user': userId,
        'targetUsers.userModel': userModel
      });
    }
  }

  const skip = (page - 1) * limit;

  return this.find(query)
    .populate('author', 'name email role')
    .populate('targetRooms', 'roomNumber roomType')
    .sort({ publishDate: -1 })
    .skip(skip)
    .limit(limit);
};

announcementSchema.statics.getActiveCount = function(audienceType = 'all') {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const query = {
    isArchived: false,
    publishDate: { $gte: thirtyDaysAgo, $lte: now }
  };

  if (audienceType !== 'all') {
    query.$or = [
      { audience: 'all' },
      { audience: audienceType }
    ];
  }

  return this.countDocuments(query);
};

announcementSchema.statics.archiveOldAnnouncements = function() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  return this.updateMany(
    {
      isArchived: false,
      publishDate: { $lte: thirtyDaysAgo }
    },
    { isArchived: true }
  );
};

export default mongoose.model('Announcement', announcementSchema);