import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  tenant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tenant', 
    required: true, 
    index: true 
  },
  room: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Room', 
    required: true, 
    index: true 
  },
  type: {
    type: String,
    enum: ['maintenance', 'complaint', 'other'],
    default: 'maintenance',
    required: true,
    index: true,
  },
  title: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 100 
  },
  description: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 1000 
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'rejected'],
    default: 'pending',
    required: true,
    index: true,
  },
  submittedAt: { 
    type: Date, 
    default: Date.now, 
    required: true 
  },
  followUp: {
    type: Boolean,
    default: false,
    index: true
  },
  followUpDate: {
    type: Date,
    default: null
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
reportSchema.index({ tenant: 1, status: 1 });
reportSchema.index({ room: 1, type: 1 });
reportSchema.index({ status: 1, submittedAt: -1 });
reportSchema.index({ followUp: 1, followUpDate: 1 });
reportSchema.index({ isArchived: 1, status: 1, updatedAt: -1 });

// Method to check if follow-up has expired (after 7 days)
reportSchema.methods.isFollowUpExpired = function() {
  if (!this.followUp || !this.followUpDate) return false;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return this.followUpDate < sevenDaysAgo;
};

// Pre-save middleware to track status changes and handle follow-up expiry
reportSchema.pre('save', function(next) {
  // Check if follow-up has expired and reset it
  if (this.isFollowUpExpired()) {
    this.followUp = false;
    this.followUpDate = null;
    console.log(`Report ${this._id} follow-up expired and was reset`);
  }

  if (this.isModified('status')) {
    console.log(`Report ${this._id} status changed to: ${this.status}`);
    
    // Reset follow-up when status is updated by staff
    // This allows tenants to follow up again if they're still not satisfied
    // BUT don't reset if tenant just followed up (followUp was just set to true)
    if (!this.isModified('followUp')) {
      this.followUp = false;
      this.followUpDate = null;
    }
  }
  next();
});

// Static method to get basic reports statistics
reportSchema.statics.getReportsStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static method to archive reports with resolved/rejected status older than 30 days
reportSchema.statics.archiveOldReports = function() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  return this.updateMany(
    {
      isArchived: false,
      status: { $in: ['resolved', 'rejected'] },
      updatedAt: { $lte: thirtyDaysAgo }
    },
    { isArchived: true }
  );
};

export default mongoose.model('Report', reportSchema);