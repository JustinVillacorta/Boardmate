import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const tenantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
  phoneNumber: {
    type: String,
    required: true,
    match: [/^[\+]?[0-9]{10,15}$/, 'Invalid phone number format'],
  },
  dateOfBirth: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        const today = new Date();
        const age = today.getFullYear() - v.getFullYear();
        const monthDiff = today.getMonth() - v.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < v.getDate())) {
          return age >= 18; // Must be at least 18 years old
        }
        return age >= 18;
      },
      message: 'Tenant must be at least 18 years old',
    },
  },
  occupation: { 
    type: String, 
    trim: true, 
    maxlength: 100 
  },
  address: {
    street: { type: String, trim: true, maxlength: 100 },
    city: { type: String, trim: true, maxlength: 50 },
    province: { type: String, trim: true, maxlength: 50 },
    zipCode: { type: String, trim: true, maxlength: 10 },
  },
  idType: {
    type: String,
    enum: ['passport', 'drivers_license', 'national_id', 'other'],
    required: true,
  },
  idNumber: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  emergencyContact: {
    name: { 
      type: String, 
      required: true, 
      trim: true, 
      maxlength: 100 
    },
    relationship: { 
      type: String, 
      required: true, 
      trim: true, 
      maxlength: 50 
    },
    phoneNumber: {
      type: String,
      required: true,
      match: [/^[\+]?[0-9]{10,15}$/, 'Invalid emergency contact phone number'],
    },
  },
  room: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Room' 
  },
  leaseStartDate: Date,
  leaseEndDate: {
    type: Date,
    validate: {
      validator: function(v) {
        return !this.leaseStartDate || !v || v > this.leaseStartDate;
      },
      message: 'Lease end date must be after start date',
    },
  },
  monthlyRent: { 
    type: Number, 
    min: 0 
  },
  securityDeposit: { 
    type: Number, 
    min: 0,
    default: 0 
  },
  tenantStatus: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending',
  },
  isArchived: { 
    type: Boolean, 
    default: false 
  },
  // Authentication-related fields
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  resetPasswordOTP: {
    type: String,
    select: false,
  },
  resetPasswordOTPExpires: {
    type: Date,
    select: false,
  },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
tenantSchema.index({ email: 1 });
tenantSchema.index({ room: 1 });
tenantSchema.index({ tenantStatus: 1 });
tenantSchema.index({ isArchived: 1 });
tenantSchema.index({ leaseStartDate: 1, leaseEndDate: 1 });

// Virtual for full name
tenantSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
tenantSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
tenantSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get tenant without sensitive data
tenantSchema.methods.toAuthJSON = function() {
  return {
    _id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    fullName: this.fullName,
    email: this.email,
    phoneNumber: this.phoneNumber,
    dateOfBirth: this.dateOfBirth,
    occupation: this.occupation,
    address: this.address,
    idType: this.idType,
    idNumber: this.idNumber,
    emergencyContact: this.emergencyContact,
    room: this.room,
    leaseStartDate: this.leaseStartDate,
    leaseEndDate: this.leaseEndDate,
    monthlyRent: this.monthlyRent,
    securityDeposit: this.securityDeposit,
    tenantStatus: this.tenantStatus,
    isArchived: this.isArchived,
    isVerified: this.isVerified,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Instance method for public profile (limited data)
tenantSchema.methods.toPublicJSON = function() {
  return {
    _id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    fullName: this.fullName,
    email: this.email,
    phoneNumber: this.phoneNumber,
    room: this.room,
    tenantStatus: this.tenantStatus,
    createdAt: this.createdAt,
  };
};

// Static method to find active tenants
tenantSchema.statics.findActive = function() {
  return this.find({ isArchived: false, tenantStatus: 'active' });
};

// Static method to find by email (including password)
tenantSchema.statics.findByEmail = function(email) {
  return this.findOne({ email }).select('+password');
};

// Static method to find tenants by room
tenantSchema.statics.findByRoom = function(roomId) {
  return this.find({ room: roomId, isArchived: false });
};

// Static method to find tenants with active leases
tenantSchema.statics.findWithActiveLease = function() {
  const today = new Date();
  return this.find({
    isArchived: false,
    tenantStatus: 'active',
    leaseStartDate: { $lte: today },
    $or: [
      { leaseEndDate: { $exists: false } },
      { leaseEndDate: null },
      { leaseEndDate: { $gte: today } }
    ]
  });
};

export default mongoose.model('Tenant', tenantSchema);