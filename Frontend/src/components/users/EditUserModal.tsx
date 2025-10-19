import React, { useState, useEffect } from 'react';
import { X, User, Mail, Shield, Calendar, MapPin, Phone, Home, CreditCard, Eye, EyeOff } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'Staff' | 'Tenant' | 'Admin';
  status: 'Active' | 'Inactive';
  startDate: string;
  roomNumber?: string;
  avatar?: string;
}

interface EditUserData {
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
  idType?: string;
  idNumber?: string;
  
  // Emergency Contact
  contactName: string;
  relationship: string;
  contactPhone: string;
  
  // User Type and Status
  role: 'Staff' | 'Tenant';
  isActive: boolean;
}

interface EditUserModalProps {
  user: UserData;
  onClose: () => void;
  onUpdate: (userId: string, userData: EditUserData) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState<EditUserData>({
    // Personal Information
    firstName: '',
    lastName: '',
    email: user.email,
    username: user.name,
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
    role: user.role === 'Admin' ? 'Staff' : user.role,
    isActive: user.status === 'Active',
  });
  
  const [errors, setErrors] = useState<Partial<EditUserData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Split name into first and last name
    const nameParts = user.name.split(' ');
    setFormData(prev => ({
      ...prev,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
    }));
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Partial<EditUserData> = {};

    // Personal Information Validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Tenant specific validation
    if (formData.role === 'Tenant') {
      if (!formData.roomNumber?.trim()) {
        newErrors.roomNumber = 'Room number is required for tenants';
      }
      if (!formData.monthlyRent?.trim()) {
        newErrors.monthlyRent = 'Monthly rent is required for tenants';
      }
    }

    // Emergency contact validation
    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Emergency contact name is required';
    }
    
    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Emergency contact phone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      await onUpdate(user.id, formData);
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof EditUserData, value: string | boolean) => {
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
    const nameParts = user.name.split(' ');
    setFormData({
      // Personal Information
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: user.email,
      username: user.name,
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
      role: user.role === 'Admin' ? 'Staff' : user.role,
      isActive: user.status === 'Active',
    });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit User Account</h2>
            <p className="text-sm text-gray-500 mt-1">Update user information for {user.name}. Modify the fields below to edit the user account.</p>
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
            
            {/* User Type Selection */}
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

            {/* Conditional Form Content based on User Type */}
            {formData.role === 'Staff' ? (
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => handleChange('phoneNumber', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="+63 9XX XXX XXXX"
                        disabled={isSubmitting}
                      />
                      {errors.phoneNumber && (
                        <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
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
                    {/* Room Number */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Room Number</label>
                      <input
                        type="text"
                        value={formData.roomNumber}
                        onChange={(e) => handleChange('roomNumber', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.roomNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="101"
                        disabled={isSubmitting}
                      />
                      {errors.roomNumber && (
                        <p className="text-red-500 text-xs mt-1">{errors.roomNumber}</p>
                      )}
                    </div>

                    {/* Monthly Rent */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Monthly Rent</label>
                      <input
                        type="text"
                        value={formData.monthlyRent}
                        onChange={(e) => handleChange('monthlyRent', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.monthlyRent ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="₱5,000"
                        disabled={isSubmitting}
                      />
                      {errors.monthlyRent && (
                        <p className="text-red-500 text-xs mt-1">{errors.monthlyRent}</p>
                      )}
                    </div>

                    {/* Security Deposit */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Security Deposit</label>
                      <input
                        type="text"
                        value={formData.securityDeposit}
                        onChange={(e) => handleChange('securityDeposit', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="₱10,000"
                        disabled={isSubmitting}
                      />
                    </div>

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

                    {/* ID Number - Full width */}
                    <div className="md:col-span-2">
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
                      <input
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => handleChange('contactPhone', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.contactPhone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="+63 9XX XXX XXXX"
                        disabled={isSubmitting}
                      />
                      {errors.contactPhone && (
                        <p className="text-red-500 text-xs mt-1">{errors.contactPhone}</p>
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
            {isSubmitting ? 'Updating...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;