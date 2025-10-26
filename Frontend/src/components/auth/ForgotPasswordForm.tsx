import React, { useState, useRef, useEffect } from 'react';
import { authService } from '../../services/authService';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin }) => {
  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [verified, setVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Refs for auto-focus
  const otpInputRef = useRef<HTMLInputElement | null>(null);
  const newPasswordRef = useRef<HTMLInputElement | null>(null);

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    setSuccessMessage('');

    try {
      if (!forgotEmail) throw new Error('Please enter your email');
      await authService.requestPasswordReset(forgotEmail);
      setOtp('');
      setVerified(false);
      setOtpSent(true);
      setSuccessMessage('OTP has been sent to your email.');
    } catch (err: any) {
      console.error('Request OTP error', err);
      
      // Handle specific error cases
      if (err.response?.status === 403) {
        setForgotError('This account has been archived and cannot reset the password. Please contact an administrator for assistance.');
      } else {
        setForgotError(err.message || 'Failed to send OTP');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    setSuccessMessage('');

    try {
      if (!otp) throw new Error('Please enter the OTP');
      await authService.verifyOTP(forgotEmail, otp);
      setVerified(true);
      setSuccessMessage('OTP verified. Please enter your new password.');
    } catch (err: any) {
      console.error('Verify OTP error', err);
      setForgotError(err.message || 'Failed to verify OTP');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    setSuccessMessage('');

    try {
      if (!newPassword || !confirmPassword) throw new Error('Please fill all fields');
      if (newPassword !== confirmPassword) throw new Error('Passwords do not match');

      await authService.resetPasswordWithOTP({ email: forgotEmail, otp, newPassword, confirmPassword });
      setSuccessMessage('Password reset successful. You can now log in with your new password.');
      setTimeout(() => {
        onBackToLogin();
      }, 1800);
    } catch (err: any) {
      console.error('Reset password error', err);
      
      // Handle specific error cases
      if (err.response?.status === 403) {
        setForgotError('This account has been archived and cannot reset the password. Please contact an administrator for assistance.');
      } else {
        setForgotError(err.message || 'Failed to reset password');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  // Auto-focus effects
  useEffect(() => {
    if (otpSent && !verified) {
      setTimeout(() => otpInputRef.current?.focus(), 50);
    }
  }, [otpSent, verified]);

  useEffect(() => {
    if (verified) {
      setTimeout(() => newPasswordRef.current?.focus(), 50);
    }
  }, [verified]);

  return (
    <div className="space-y-6">
      {/* Back to login */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToLogin}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Login
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password</h2>
        <p className="text-sm text-gray-600">Enter your account email and we'll send a code to help you securely reset your password.</p>
      </div>

      {/* Error and success messages */}
      {forgotError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {forgotError}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Step 1: Request OTP */}
      {!otpSent && (
        <form onSubmit={handleRequestOtp} className="space-y-6">
          <div>
            <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <input
                type="email"
                id="forgot-email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-black hover:bg-gray-800 text-white py-3 px-4 text-base font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={forgotLoading}
          >
            {forgotLoading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {forgotLoading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      )}

      {/* Step 2: Verify OTP */}
      {otpSent && !verified && (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Enter the code you received
            </label>
            <input
              ref={otpInputRef}
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="123456"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black hover:bg-gray-800 text-white py-3 px-4 text-base font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={forgotLoading}
          >
            {forgotLoading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {forgotLoading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      )}

      {/* Step 3: Reset Password */}
      {otpSent && verified && (
        <form onSubmit={handleReset} className="space-y-6">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
              New password
            </label>
            <div className="relative">
              <input
                ref={newPasswordRef}
                type={showNewPassword ? 'text' : 'password'}
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? (
                  <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-black hover:bg-gray-800 text-white py-3 px-4 text-base font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={forgotLoading}
          >
            {forgotLoading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {forgotLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordForm;

