import { sendEmail } from '../utils/emailService.js';
import { buildPasswordResetEmail } from '../utils/passwordResetEmailTemplate.js';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import PasswordOTP from '../models/PasswordOTP.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError('Email is required', 400));

  let account = await User.findOne({ email });
  let accountType = 'user';
  if (!account) {
    account = await Tenant.findOne({ email });
    accountType = 'tenant';
  }
  if (!account) return next(new AppError('No user or tenant found with that email', 404));
  if (account.isArchived) {
    return next(new AppError('Account has been archived and cannot reset password', 403));
  }

  const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
  const ttlMinutes = parseInt(process.env.OTP_TTL_MINUTES) || 10;
  const ttlMs = ttlMinutes * 60 * 1000;
  await PasswordOTP.createOTP(account.email, otp, ttlMs, accountType);

  if (account.resetPasswordOTP !== undefined) {
    account.resetPasswordOTP = undefined;
    account.resetPasswordOTPExpires = undefined;
    await account.save();
  }

  const accountName = account.name || account.fullName || account.firstName || 'User';
  const accountDisplayType = accountType === 'tenant' ? 'Tenant' : 'Staff';

  const html = buildPasswordResetEmail({
    accountName,
    accountDisplayType,
    otp,
    ttlMinutes,
  });

  await sendEmail({
    to: account.email,
    subject: `Boardmate Password Reset - Your Verification Code`,
    text: `Your OTP for password reset is: ${otp}. It expires in ${ttlMinutes} minutes.`,
    html,
  });

  res.status(200).json({ success: true, message: 'OTP sent to email' });
});

export const verifyOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !otp) return next(new AppError('Email and OTP are required', 400));

  const doc = await PasswordOTP.verifyOTP(email, otp);
  if (!doc) return next(new AppError('Invalid or expired OTP', 400));

  res.status(200).json({ success: true, message: 'OTP verified' });
});

export const resetPasswordWithOTP = catchAsync(async (req, res, next) => {
  const { email, otp, newPassword, confirmPassword } = req.body;
  if (!email || !otp || !newPassword || !confirmPassword)
    return next(new AppError('All fields are required', 400));
  if (newPassword !== confirmPassword)
    return next(new AppError('Passwords do not match', 400));

  const doc = await PasswordOTP.verifyOTP(email, otp);
  if (!doc) return next(new AppError('Invalid or expired OTP', 400));

  let account = await User.findOne({ email }).select('+password');
  let accountType = 'user';
  if (!account) {
    account = await Tenant.findOne({ email }).select('+password');
    accountType = 'tenant';
  }
  if (!account) return next(new AppError('No user or tenant found with that email', 404));
  if (account.isArchived) {
    return next(new AppError('Account has been archived and cannot reset password', 403));
  }

  account.password = newPassword;
  if (account.resetPasswordOTP !== undefined) {
    account.resetPasswordOTP = undefined;
    account.resetPasswordOTPExpires = undefined;
  }
  await account.save();

  await doc.markUsed();

  res.status(200).json({ success: true, message: 'Password reset successful' });
});
