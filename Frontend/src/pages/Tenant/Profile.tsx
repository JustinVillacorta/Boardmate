import React, { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import TopNavbar from "../../components/layout/TopNavbar";
import ConfirmationDialog from "../../components/tenant/ConfirmationDialog";
import PhoneInput from "../../components/ui/PhoneInput";
import { authService } from '../../services/authService';
import * as roomManagementService from '../../services/roomManagementService';
import api from '../../config/api';
import { FileText, Download, Eye } from 'lucide-react';
import { validatePhoneNumber } from '../../utils/validation';

interface ProfileProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ currentPage, onNavigate }) => {
  const [contactForm, setContactForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    emergencyContact: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // visibility toggles for password fields
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [contactErrors, setContactErrors] = useState<Partial<typeof contactForm>>({});
  const [passwordErrors, setPasswordErrors] = useState<Partial<typeof passwordForm>>({});
  const [isUpdatingContact, setIsUpdatingContact] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Contract states
  const [contractData, setContractData] = useState<any>(null);
  const [loadingContract, setLoadingContract] = useState(false);
  const [contractError, setContractError] = useState<string | null>(null);

  // Confirmation dialog states
  const [showContactConfirmDialog, setShowContactConfirmDialog] = useState(false);
  const [showPasswordConfirmDialog, setShowPasswordConfirmDialog] = useState(false);
  const [pendingContactData, setPendingContactData] = useState<any>(null);
  const [pendingPasswordData, setPendingPasswordData] = useState<any>(null);

  // tenancy information (populated from tenant profile)
  const [tenancyInfo, setTenancyInfo] = useState({
    roomNumber: '',
    roomType: '',
    monthlyRent: 0,
    leaseStartDate: '',
    accountStatus: '',
    securityDeposit: 0
  });

  useEffect(() => {
    // Only refetch when currentPage is 'profile' (or on mount)
    if (currentPage === undefined || currentPage === 'profile') {
      const loadProfile = async () => {
        // Always fetch latest user/tenant data from backend
        const refreshed = await authService.getCurrentUser();
        const userData = refreshed?.userData || null;

        if (userData && (userData as any).firstName) {
          // tenant object
          const tenant = userData as any;
          
          // Format phone numbers with +63 prefix if they don't have it
          const formatPhone = (phone: string) => {
            if (!phone) return '+63 ';
            if (phone.startsWith('+63')) return phone;
            if (phone.startsWith('0')) return '+63 ' + phone.slice(1);
            return '+63 ' + phone;
          };

          setContactForm({
            fullName: `${tenant.firstName} ${tenant.lastName}`.trim(),
            email: tenant.email || '',
            phone: formatPhone(tenant.phoneNumber || ''),
            emergencyContact: formatPhone(tenant.emergencyContact?.phoneNumber || '')
          });

          // Determine room details. tenant.room may be populated object or just an id string
          let roomNumber = '';
          let roomType = '';

          try {
            if (tenant.room) {
              if (typeof tenant.room === 'string') {
                // fetch room document
                const roomRes = await api.get(`/rooms/${tenant.room}`);
                const room = roomRes.data?.data?.room || roomRes.data?.data || roomRes.data;
                roomNumber = room?.roomNumber || tenant.room;
                roomType = room?.roomType || '';
              } else if (typeof tenant.room === 'object') {
                roomNumber = tenant.room.roomNumber || '';
                roomType = tenant.room.roomType || '';
              }
            }
          } catch (err) {
            // If room fetch fails, fall back to whatever is available
            roomNumber = tenant.room?.roomNumber || String(tenant.room || '');
          }

          // Calculate per-tenant rent if room.tenants is available
          let perTenantRent = tenant.monthlyRent || 0;
          if (tenant.room && typeof tenant.room === 'object' && Array.isArray(tenant.room.tenants)) {
            const activeTenants = tenant.room.tenants.filter((t: any) => t.tenantStatus === 'active');
            const numActive = activeTenants.length || 1;
            if (tenant.room.monthlyRent) {
              perTenantRent = tenant.room.monthlyRent / numActive;
            }
          }
          setTenancyInfo({
            roomNumber,
            roomType,
            monthlyRent: perTenantRent,
            leaseStartDate: tenant.leaseStartDate ? new Date(tenant.leaseStartDate).toLocaleDateString() : '',
            accountStatus: tenant.tenantStatus ? tenant.tenantStatus.charAt(0).toUpperCase() + tenant.tenantStatus.slice(1) : '',
            securityDeposit: tenant.securityDeposit || 0
          });
          
          // Load contract information
          if (tenant._id) {
            loadContract(tenant._id);
          }
        }
      };
      loadProfile();
    }
  }, [currentPage]);

  const loadContract = async (tenantId: string) => {
    try {
      setLoadingContract(true);
      setContractError(null);
      const response = await roomManagementService.getContract(tenantId);
      setContractData(response.data);
    } catch (err: any) {
      console.error('Error loading contract:', err);
      
      // Handle specific error cases with user-friendly messages
      if (err?.response?.status === 404) {
        setContractError('No contract has been uploaded yet. Please contact the administrator if you need assistance.');
      } else if (err?.response?.status === 403) {
        setContractError('You do not have permission to view this contract. Please contact support for assistance.');
      } else {
        setContractError(err?.response?.data?.message || err?.message || 'Unable to load contract information. Please try again later.');
      }
    } finally {
      setLoadingContract(false);
    }
  };

  const handleViewContract = () => {
    if (contractData?.contractFile) {
      const blob = roomManagementService.base64ToBlob(contractData.contractFile, contractData.contractMimeType || 'application/pdf');
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      // Clean up after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    }
  };

  const handleDownloadContract = () => {
    if (contractData?.contractFile) {
      roomManagementService.downloadContract(
        contractData.contractFile,
        contractData.contractFileName || 'contract.pdf'
      );
    }
  };

  const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (contactErrors[name as keyof typeof contactForm]) {
      setContactErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handlePhoneChange = (field: 'phone' | 'emergencyContact', value: string) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (contactErrors[field]) {
      setContactErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (passwordErrors[name as keyof typeof passwordForm]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateContactForm = (): boolean => {
    const newErrors: Partial<typeof contactForm> = {};

    if (!contactForm.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!contactForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!contactForm.phone.trim() || contactForm.phone.trim() === '+63') {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhoneNumber(contactForm.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Phone number must start with +63 followed by 10 digits';
    }

    if (!contactForm.emergencyContact.trim() || contactForm.emergencyContact.trim() === '+63') {
      newErrors.emergencyContact = 'Emergency contact is required';
    } else if (!validatePhoneNumber(contactForm.emergencyContact.replace(/\s/g, ''))) {
      newErrors.emergencyContact = 'Emergency contact must start with +63 followed by 10 digits';
    }

    setContactErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: Partial<typeof passwordForm> = {};

    if (!passwordForm.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordForm.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateContactForm()) {
      return;
    }

    // Prepare the payload but don't submit yet
    const payload = {
      firstName: contactForm.fullName.split(' ')[0] || '',
      lastName: contactForm.fullName.split(' ').slice(1).join(' ') || '',
      email: contactForm.email,
      phoneNumber: contactForm.phone.replace(/\s/g, ''),
      emergencyContact: { phoneNumber: contactForm.emergencyContact.replace(/\s/g, '') }
    };

    // Store pending data and show confirmation dialog
    setPendingContactData(payload);
    setShowContactConfirmDialog(true);
  };

  const confirmUpdateContact = async () => {
    if (!pendingContactData) return;

    setIsUpdatingContact(true);
    try {
      await api.put('/auth/tenant/updatedetails', pendingContactData);

      // Refresh stored user data
      await authService.getCurrentUser();

      setIsUpdatingContact(false);
      setShowContactConfirmDialog(false);
      setPendingContactData(null);
      alert('Contact information updated successfully');
    } catch (err: any) {
      setIsUpdatingContact(false);
      alert(err?.response?.data?.message || err?.message || 'Failed to update contact info');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    // Prepare the payload but don't submit yet
    const payload = {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword
    };

    // Store pending data and show confirmation dialog
    setPendingPasswordData(payload);
    setShowPasswordConfirmDialog(true);
  };

  const confirmChangePassword = async () => {
    if (!pendingPasswordData) return;

    setIsChangingPassword(true);
    try {
      await api.put('/auth/tenant/updatepassword', pendingPasswordData);

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
      setShowPasswordConfirmDialog(false);
      setPendingPasswordData(null);
      alert('Password changed successfully');
    } catch (err: any) {
      setIsChangingPassword(false);
      alert(err?.response?.data?.message || err?.message || 'Failed to change password');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      
      {/* Main Content - Responsive */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navigation */}
        <TopNavbar currentPage={currentPage} onNotificationOpen={() => onNavigate && onNavigate('notifications')} onAnnouncementOpen={() => onNavigate && onNavigate('announcements')} />

        {/* Profile Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">

          <div className="space-y-6">
            {/* Tenancy Information Card (moved above Contact) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Tenancy Information</h2>
                <p className="text-sm text-gray-500 mt-1">Your current lease details.</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Number
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {tenancyInfo.roomNumber}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Type
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {tenancyInfo.roomType}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lease Start Date
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {tenancyInfo.leaseStartDate}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Rent <span className="text-xs text-gray-500">(Your Share)</span>
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      ₱{tenancyInfo.monthlyRent.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Security Deposit
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      ₱{tenancyInfo.securityDeposit.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Status
                    </label>
                    <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-800 font-medium">
                      {tenancyInfo.accountStatus}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Information Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Contract Information</h2>
                <p className="text-sm text-gray-500 mt-1">Your lease agreement and documents.</p>
              </div>
              <div className="p-6">
                {loadingContract ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Loading contract...</div>
                  </div>
                ) : contractError ? (
                  <div className="text-center py-8">
                    <div className="text-red-600 mb-2">{contractError}</div>
                  </div>
                ) : contractData?.contractFile ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div>
                          <div className="font-medium text-gray-900">{contractData.contractFileName || 'contract.pdf'}</div>
                          {contractData.contractUploadDate && (
                            <div className="text-sm text-gray-500">
                              Uploaded: {new Date(contractData.contractUploadDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleViewContract}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={handleDownloadContract}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <div>No contract available</div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                <p className="text-sm text-gray-500 mt-1">Keep your contact details up to date.</p>
              </div>
              <form onSubmit={handleUpdateContact} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={contactForm.fullName}
                      onChange={handleContactInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        contactErrors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {contactErrors.fullName && (
                      <p className="text-red-500 text-xs mt-1">{contactErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        contactErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {contactErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{contactErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <PhoneInput
                      value={contactForm.phone}
                      onChange={(val: string) => handlePhoneChange('phone', val)}
                      error={contactErrors.phone}
                      label="Phone Number"
                    />
                  </div>

                  <div>
                    <PhoneInput
                      value={contactForm.emergencyContact}
                      onChange={(val: string) => handlePhoneChange('emergencyContact', val)}
                      error={contactErrors.emergencyContact}
                      label="Emergency Contact"
                      name="emergencyContact"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isUpdatingContact}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Update Contact
                  </button>
                </div>
              </form>
            </div>

            {/* Security & Privacy Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Security & Privacy</h2>
                <p className="text-sm text-gray-500 mt-1">Manage your account security settings.</p>
              </div>
              <form onSubmit={handleChangePassword} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordInputChange}
                        className={`w-full px-3 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(s => !s)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                      >
                        {showCurrentPassword ? (
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
                    {passwordErrors.currentPassword && (
                      <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordInputChange}
                        className={`w-full px-3 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(s => !s)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
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
                    {passwordErrors.newPassword && (
                      <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordInputChange}
                        className={`w-full px-3 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(s => !s)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
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
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>

      {/* Contact Update Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showContactConfirmDialog}
        onClose={() => {
          setShowContactConfirmDialog(false);
          setPendingContactData(null);
        }}
        onConfirm={confirmUpdateContact}
        title="Confirm Contact Information Update"
        message="Are you sure you want to update your contact information? This will change your profile details and may affect how you receive important notifications."
        confirmButtonText="Update Contact Info"
        confirmButtonColor="blue"
        isLoading={isUpdatingContact}
      />

      {/* Password Change Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showPasswordConfirmDialog}
        onClose={() => {
          setShowPasswordConfirmDialog(false);
          setPendingPasswordData(null);
        }}
        onConfirm={confirmChangePassword}
        title="Confirm Password Change"
        message="Are you sure you want to change your password? You will need to use the new password for future logins. Make sure you remember it or store it securely."
        confirmButtonText="Change Password"
        confirmButtonColor="red"
        isLoading={isChangingPassword}
      />
    </div>
  );
};

export default Profile;