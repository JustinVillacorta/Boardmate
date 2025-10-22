import React, { useState, useEffect, useRef } from 'react';
import { authService } from '../../services/authService';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<Props> = ({ open, onClose }) => {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [verified, setVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const resetState = () => {
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setOtpSent(false);
    setVerified(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setError('');
    setSuccessMessage('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (!email) throw new Error('Please enter your email');
      await authService.requestPasswordReset(email);
      // clear any previous verification state when requesting a fresh OTP
      setOtp('');
      setVerified(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setOtpSent(true);
      setSuccessMessage('OTP has been sent to your email.');
      // keep focus on OTP input in the next step
  // focus handled by effect
    } catch (err: any) {
      console.error('Request OTP error', err);
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (!otp) throw new Error('Please enter the OTP');
      await authService.verifyOTP(email, otp);
      setVerified(true);
      setSuccessMessage('OTP verified. Please enter your new password.');
    } catch (err: any) {
      console.error('Verify OTP error', err);
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (!newPassword || !confirmPassword) throw new Error('Please fill all fields');
      if (newPassword !== confirmPassword) throw new Error('Passwords do not match');

      // still include email and otp for backend validation
      await authService.resetPasswordWithOTP({ email, otp, newPassword, confirmPassword });
      setSuccessMessage('Password reset successful. You can now log in with your new password.');
      setTimeout(() => handleClose(), 1800);
    } catch (err: any) {
      console.error('Reset password error', err);
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  // Refs for focusing inputs when moving between steps
  const otpInputRef = useRef<HTMLInputElement | null>(null);
  const newPasswordRef = useRef<HTMLInputElement | null>(null);

  // Reset step-related state whenever the modal is opened to avoid carrying over previous attempt state
  useEffect(() => {
    if (open) {
      setOtp('');
      setOtpSent(false);
      setVerified(false);
      setNewPassword('');
      setConfirmPassword('');
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setError('');
      setSuccessMessage('');
    }
  }, [open]);

  useEffect(() => {
    if (otpSent && !verified) {
      // Focus OTP input when OTP is marked sent
      setTimeout(() => otpInputRef.current?.focus(), 50);
    }
  }, [otpSent, verified]);

  useEffect(() => {
    if (verified) {
      // Focus new password input when OTP is verified
      setTimeout(() => newPasswordRef.current?.focus(), 50);
    }
  }, [verified]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Removed dark backdrop per user request. Modal will sit above content without dimming background. */}

      <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 pointer-events-auto">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">Forgot Password</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

  <p className="text-sm text-gray-600 mt-2">Enter your account email and we'll send a code to help you securely reset your password.</p>

        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
        {successMessage && <div className="mt-4 text-sm text-green-600">{successMessage}</div>}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-2xl">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-8 w-8 text-gray-700 mb-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <div className="text-sm text-gray-700">Processing...</div>
            </div>
          </div>
        )}

        {/* Step 1: Request OTP */}
        {!otpSent && (
          <form className="mt-4 space-y-4" onSubmit={handleRequestOtp}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
              >
                Send OTP
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Verify OTP */}
        {otpSent && !verified && (
          <form className="mt-4 space-y-4" onSubmit={handleVerifyOtp}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter the code you received</label>
              <input
                ref={otpInputRef}
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123456"
                required
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
              >
                Verify OTP
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Reset Password */}
        {otpSent && verified && (
          <form className="mt-4 space-y-4" onSubmit={handleReset}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
              <div className="relative">
                <input
                  ref={newPasswordRef}
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
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

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
              >
                Reset Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
