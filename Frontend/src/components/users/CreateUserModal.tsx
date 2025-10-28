import React, { useState } from 'react';
import { X, User, Mail, Shield, Calendar, MapPin, Phone, Home, CreditCard, Eye, EyeOff } from 'lucide-react';
import { registerService } from '../../services/registerService';
import { RegisterStaffData, RegisterTenantData } from '../../types';
import { validateCreateUser, withPH, sanitizeDigits } from '../../utils/validation';

interface UserData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  dateOfBirth: string;
  phoneNumber: string;
  occupation: string;
  password: string;
  confirmPassword: string;
  
  // Address Information
  street: string;
  province: string;
  city: string;
  zipCode: string;
  
  // Tenant Information (for tenants only)
  roomNumber?: string;
  monthlyRent?: string;
  securityDeposit?: string;
  idType: string;
  idNumber?: string;
  
  // Emergency Contact
  contactName: string;
  relationship: string;
  contactPhone: string;
  
  // User Type and Status
  role: 'Staff' | 'Tenant';
  isActive: boolean;
}


interface CreateUserModalProps {
  onClose: () => void;
  onCreate: (userData: Omit<UserData, 'id'>) => void;
  isStaffUser?: boolean;
}

// Helper function to map frontend ID type display names to backend values
const mapIdTypeToBackend = (frontendIdType: string): 'passport' | 'drivers_license' | 'national_id' | 'other' => {
  const mapping: Record<string, 'passport' | 'drivers_license' | 'national_id' | 'other'> = {
    'National ID': 'national_id',
    'Driver\'s License': 'drivers_license',
    'Passport': 'passport',
    'SSS ID': 'other',
    'PhilHealth ID': 'other',
    'TIN ID': 'other'
  };
  return mapping[frontendIdType] || 'other';
};

const CreateUserModal: React.FC<CreateUserModalProps> = ({ onClose, onCreate, isStaffUser = false }) => {
  const [formData, setFormData] = useState<UserData>({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    dateOfBirth: '',
    phoneNumber: '',
    occupation: '',
    password: '',
    confirmPassword: '',
    
    // Address Information
    street: '',
    province: '',
    city: '',
    zipCode: '',
    
    // Tenant Information
    roomNumber: '',
    monthlyRent: '',
    securityDeposit: '',
    idType: 'National ID',
    idNumber: '',
    
    // Emergency Contact
    contactName: '',
    relationship: '',
    contactPhone: '',
    
    // User Type and Status
    role: 'Tenant',
    isActive: true,
  });
  
  const [errors, setErrors] = useState<Partial<UserData>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneDigits, setPhoneDigits] = useState('');
  const [contactPhoneDigits, setContactPhoneDigits] = useState('');
  const [errorSummary, setErrorSummary] = useState<string[]>([]);

  const validateForm = (): boolean => {
    const composed: any = {
      ...formData,
      phoneNumber: formData.role === 'Tenant' && phoneDigits ? withPH(phoneDigits) : formData.phoneNumber,
      contactPhone: formData.role === 'Tenant' && contactPhoneDigits ? withPH(contactPhoneDigits) : formData.contactPhone,
    };
    const newErrors: Partial<UserData> = validateCreateUser(composed);
    setErrors(newErrors);
    const summary = Object.values(newErrors).filter(Boolean) as string[];
    setErrorSummary(summary);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // If the modal was opened in staff-only mode, enforce tenant creation
      if (isStaffUser && formData.role === 'Staff') {
        formData.role = 'Tenant';
      }

      if (formData.role === 'Staff') {
        // Create staff user
        const staffData: RegisterStaffData = {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password,
          role: 'staff'
        };
        await registerService.registerStaff(staffData);
      } else {
        // Create tenant user
        const tenantData: RegisterTenantData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phoneNumber: withPH(phoneDigits),
          dateOfBirth: formData.dateOfBirth,
          occupation: formData.occupation || undefined,
          address: {
            street: formData.street || undefined,
            city: formData.city || undefined,
            province: formData.province || undefined,
            zipCode: formData.zipCode || undefined
          },
          idType: mapIdTypeToBackend(formData.idType),
          idNumber: formData.idNumber || '',
          emergencyContact: {
            name: formData.contactName,
            relationship: formData.relationship,
            phoneNumber: withPH(contactPhoneDigits)
          }
        };
        
        await registerService.registerTenant(tenantData);
      }
      
      // Call the original onCreate callback for UI updates
      await onCreate(formData);
      setGeneralError(null);
    } catch (error: any) {
      console.error('Error creating user:', error);
      // Set a general error message
      setGeneralError(error.message || 'Failed to create user account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof UserData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleClear = () => {
    setFormData({
      // Personal Information
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      dateOfBirth: '',
      phoneNumber: '',
      occupation: '',
      password: '',
      confirmPassword: '',
      
      // Address Information
      street: '',
      province: '',
      city: '',
      zipCode: '',
      
      // Tenant Information
      roomNumber: '',
      monthlyRent: '',
      securityDeposit: '',
      idType: 'National ID',
      idNumber: '',
      
      // Emergency Contact
      contactName: '',
      relationship: '',
      contactPhone: '',
      
      // User Type and Status
      role: 'Tenant',
      isActive: true,
    });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setGeneralError(null);
    setPhoneDigits('');
    setContactPhoneDigits('');
    setErrorSummary([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create New User Account</h2>
            <p className="text-sm text-gray-500 mt-1">Fill in the form below to create a new user account. Complete all required information below.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form - Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* General Error Message */}
            {generalError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {generalError}
              </div>
            )}
            {/* Error Summary (Client-side) */}
            {errorSummary.length > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="font-medium mb-2">Please fix the following:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {errorSummary.map((msg, idx) => (
                    <li key={idx} className="text-sm">{msg}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* User Type Selection */}
            {!isStaffUser && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">User Type</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleChange('role', 'Tenant')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium text-sm transition-colors ${
                      formData.role === 'Tenant' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'
                    }`}
                    disabled={isSubmitting}
                  >
                    <User className="w-4 h-4" />
                    Tenant
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('role', 'Staff')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium text-sm transition-colors ${
                      formData.role === 'Staff' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'
                    }`}
                    disabled={isSubmitting}
                  >
                    <Shield className="w-4 h-4" />
                    Staff
                  </button>
                </div>
              </div>
            )}

            {/* Conditional Form Content based on User Type */}
            {formData.role === 'Staff' && !isStaffUser ? (
              /* Staff Form - Simple Layout - Only Basic Fields */
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter First Name"
                      disabled={isSubmitting}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter Last Name"
                      disabled={isSubmitting}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="dasasdd"
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Username */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Username</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleChange('username', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.username ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Username"
                      disabled={isSubmitting}
                    />
                    {errors.username && (
                      <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter Password"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        disabled={isSubmitting}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Confirm Password"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        disabled={isSubmitting}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Tenant Form - Full Layout */
              <>
                {/* Personal Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">First Name</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter First Name"
                        disabled={isSubmitting}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter Last Name"
                        disabled={isSubmitting}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="abc@email.com"
                        disabled={isSubmitting}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>

                    {/* Username */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Username</label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleChange('username', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.username ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Username"
                        disabled={isSubmitting}
                      />
                      {errors.username && (
                        <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Date of Birth</label>
                        <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.dateOfBirth && (
                        <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Phone Number</label>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-2 border rounded-lg bg-gray-50 text-gray-600 select-none">+63</span>
                        <input
                          inputMode="numeric"
                          pattern="\\d*"
                          maxLength={10}
                          value={phoneDigits}
                          onChange={(e) => setPhoneDigits(sanitizeDigits(e.target.value).slice(0,10))}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="9XXXXXXXXX"
                          aria-invalid={!!errors.phoneNumber}
                          aria-describedby={errors.phoneNumber ? 'phoneNumber-error' : undefined}
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.phoneNumber && (
                        <p id="phoneNumber-error" className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                      )}
                    </div>

                    {/* Occupation - Full width */}
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Occupation</label>
                      <input
                        type="text"
                        value={formData.occupation}
                        onChange={(e) => handleChange('occupation', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.occupation ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter occupation"
                        disabled={isSubmitting}
                      />
                      {errors.occupation && (
                        <p className="text-red-500 text-xs mt-1">{errors.occupation}</p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => handleChange('password', e.target.value)}
                          className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.password ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter Password"
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                          disabled={isSubmitting}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => handleChange('confirmPassword', e.target.value)}
                          className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Confirm Password"
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                          disabled={isSubmitting}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>

                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Street */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Street</label>
                      <input
                        type="text"
                        value={formData.street}
                        onChange={(e) => handleChange('street', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="123 Main St"
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Province */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Province</label>
                      <input
                        type="text"
                        value={formData.province}
                        onChange={(e) => handleChange('province', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Province"
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="City"
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Zip Code */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Zip Code</label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => handleChange('zipCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="12345"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Tenant Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tenant Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* ID Type */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">ID Type</label>
                      <select
                        value={formData.idType}
                        onChange={(e) => handleChange('idType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isSubmitting}
                      >
                        <option value="National ID">National ID</option>
                        <option value="Driver's License">Driver's License</option>
                        <option value="Passport">Passport</option>
                        <option value="SSS ID">SSS ID</option>
                        <option value="PhilHealth ID">PhilHealth ID</option>
                        <option value="TIN ID">TIN ID</option>
                      </select>
                    </div>

                    {/* ID Number */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">ID Number</label>
                      <input
                        type="text"
                        value={formData.idNumber}
                        onChange={(e) => handleChange('idNumber', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.idNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter ID number"
                        disabled={isSubmitting}
                      />
                      {errors.idNumber && (
                        <p className="text-red-500 text-xs mt-1">{errors.idNumber}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Contact Name */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Contact Name</label>
                      <input
                        type="text"
                        value={formData.contactName}
                        onChange={(e) => handleChange('contactName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.contactName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Name"
                        disabled={isSubmitting}
                      />
                      {errors.contactName && (
                        <p className="text-red-500 text-xs mt-1">{errors.contactName}</p>
                      )}
                    </div>

                    {/* Relationship */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Relationship</label>
                      <input
                        type="text"
                        value={formData.relationship}
                        onChange={(e) => handleChange('relationship', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Relationship"
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Contact Phone */}
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Contact Phone</label>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-2 border rounded-lg bg-gray-50 text-gray-600 select-none">+63</span>
                        <input
                          inputMode="numeric"
                          pattern="\\d*"
                          maxLength={10}
                          value={contactPhoneDigits}
                          onChange={(e) => setContactPhoneDigits(sanitizeDigits(e.target.value).slice(0,10))}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.contactPhone ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="9XXXXXXXXX"
                          aria-invalid={!!errors.contactPhone}
                          aria-describedby={errors.contactPhone ? 'contactPhone-error' : undefined}
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.contactPhone && (
                        <p id="contactPhone-error" className="text-red-500 text-xs mt-1">{errors.contactPhone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Footer - Always Visible */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0 bg-white">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            disabled={isSubmitting}
          >
            Clear
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;