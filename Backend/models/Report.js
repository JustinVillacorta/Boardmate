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
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
reportSchema.index({ tenant: 1, status: 1 });
reportSchema.index({ room: 1, type: 1 });
reportSchema.index({ status: 1, submittedAt: -1 });

// Pre-save middleware to track status changes
reportSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    console.log(`Report ${this._id} status changed to: ${this.status}`);
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

export default mongoose.model('Report', reportSchema);