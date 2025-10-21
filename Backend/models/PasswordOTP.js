import mongoose from 'mongoose';

const passwordOTPSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  used: { type: Boolean, default: false, index: true },
  userType: { type: String, enum: ['user', 'tenant'], default: 'user' },
}, { timestamps: true });

// Create an OTP document (stored in plaintext)
passwordOTPSchema.statics.createOTP = async function(email, otp, ttlMs = 10 * 60 * 1000, userType = 'user') {
  const expiresAt = new Date(Date.now() + ttlMs);
  return this.create({ email, otp, expiresAt, userType });
};

// Verify OTP: returns the document if valid (not used, not expired, matches)
passwordOTPSchema.statics.verifyOTP = async function(email, otp) {
  const doc = await this.findOne({ email, used: false }).sort({ createdAt: -1 });
  if (!doc) return null;
  if (doc.expiresAt < Date.now()) return null;
  if (doc.otp !== otp) return null;
  return doc;
};

// Mark OTP as used
passwordOTPSchema.methods.markUsed = async function() {
  this.used = true;
  await this.save();
};

export default mongoose.model('PasswordOTP', passwordOTPSchema);
