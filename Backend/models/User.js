import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
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
    minlength: 8,
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'staff'],
    default: 'admin',
    required: true,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
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

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ name: 1 });
userSchema.index({ isArchived: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
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
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get user without sensitive data
userSchema.methods.toAuthJSON = function() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    isArchived: this.isArchived,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isArchived: false });
};

// Static method to find by email (including password)
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email }).select('+password');
};

export default mongoose.model('User', userSchema);