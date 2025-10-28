import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
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
  amount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  paymentType: {
    type: String,
    enum: ['rent', 'deposit', 'utility', 'maintenance', 'penalty', 'other'],
    default: 'rent',
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'check', 'credit_card', 'debit_card', 'digital_wallet', 'money_order'],
    default: 'cash',
    required: true,
  },
  paymentDate: { 
    type: Date,
    default: Date.now
  },
  dueDate: { 
    type: Date, 
    required: true 
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'overdue'],
    default: 'pending',
    index: true,
  },
  periodCovered: {
    startDate: Date,
    endDate: Date,
  },
  receiptNumber: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  transactionReference: { 
    type: String, 
    index: true 
  },
  description: { 
    type: String, 
    trim: true, 
    maxlength: 500 
  },
  notes: { 
    type: String, 
    trim: true, 
    maxlength: 1000 
  },
  recordedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  lateFee: {
    amount: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    reason: { 
      type: String, 
      maxlength: 200 
    },
    isLatePayment: { 
      type: Boolean, 
      default: false 
    },
  },
}, { 
  timestamps: true 
});

paymentSchema.index({ tenant: 1, paymentDate: -1 });
paymentSchema.index({ room: 1, paymentDate: -1 });
paymentSchema.index({ status: 1, dueDate: 1 });
paymentSchema.index({ paymentType: 1, paymentDate: -1 });

paymentSchema.virtual('isOverdue').get(function() {
  return this.status === 'pending' && this.dueDate < new Date();
});

paymentSchema.methods.generateReceiptNumber = function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `RCP-${year}${month}${day}-${random}`;
};

paymentSchema.pre('save', function(next) {
  if (this.status === 'paid' && !this.receiptNumber) {
    this.receiptNumber = this.generateReceiptNumber();
  }
  
  if (this.status === 'paid' && !this.paymentDate) {
    this.paymentDate = new Date();
  }
  
  if (this.status === 'pending' && this.dueDate < new Date()) {
    this.status = 'overdue';
  }
  
  next();
});

paymentSchema.methods.markAsPaid = function(recordedBy = null, transactionRef = null) {
  this.status = 'paid';
  this.paymentDate = new Date();
  if (recordedBy) this.recordedBy = recordedBy;
  if (transactionRef) this.transactionReference = transactionRef;
  if (!this.receiptNumber) {
    this.receiptNumber = this.generateReceiptNumber();
  }
  return this.save();
};

paymentSchema.statics.getTenantPaymentSummary = function(tenantId) {
  return this.aggregate([
    { $match: { tenant: new mongoose.Types.ObjectId(tenantId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
};

paymentSchema.statics.getOverduePayments = function() {
  return this.find({
    status: { $in: ['pending', 'overdue'] },
    dueDate: { $lt: new Date() }
  }).populate('tenant', 'firstName lastName email phoneNumber')
    .populate('room', 'roomNumber roomType');
};

export default mongoose.model('Payment', paymentSchema);