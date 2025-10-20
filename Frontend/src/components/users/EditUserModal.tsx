import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Home, Eye, EyeOff } from 'lucide-react';
import { userManagementService, UpdateStaffData, UpdateTenantData } from '../../services/userManagementService';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'Staff' | 'Tenant' | 'Admin';
  status: 'Active' | 'Inactive';
  startDate: string;
  roomNumber?: string;
  roomType?: string;
  monthlyRent?: number;
  avatar?: string;
}

interface EditUserModalProps {
  user: UserData;
  onClose: () => void;
  onUpdate: () => void; // Callback to refresh the user list
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    // Staff fields
    name: user.name,
    email: user.email,
    
    // Tenant fields
    firstName: '',
    lastName: '',
    phoneNumber: '',
    occupation: '',
    address: {
      street: '',
      city: '',
      province: '',
      zipCode: ''
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phoneNumber: ''
    }
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    // Initialize form data based on user role
    if (user.role === 'Tenant') {
      // Split name into first and last name for tenants
      const nameParts = user.name.split(' ');
      setFormData(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || ''
      }));
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (user.role === 'Staff' || user.role === 'Admin') {
      // Staff validation - both fields are optional, but if provided, must be valid
      if (formData.name.trim() && formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }
      if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      
      // At least one field must be provided
      if (!formData.name.trim() && !formData.email.trim()) {
        newErrors.general = 'Please provide at least one field to update';
      }
    } else {
      // Tenant validation
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
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = 'Phone number is required';
      } else if (!/^[\+]?[0-9]{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
        newErrors.phoneNumber = 'Please enter a valid phone number (10-15 digits)';
      }
      if (!formData.emergencyContact.name.trim()) {
        newErrors.emergencyContactName = 'Emergency contact name is required';
      }
      if (!formData.emergencyContact.phoneNumber.trim()) {
        newErrors.emergencyContactPhone = 'Emergency contact phone is required';
      } else if (!/^[\+]?[0-9]{10,15}$/.test(formData.emergencyContact.phoneNumber.replace(/\s/g, ''))) {
        newErrors.emergencyContactPhone = 'Please enter a valid emergency contact phone number (10-15 digits)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setGeneralError('');
    
    try {
      if (user.role === 'Staff' || user.role === 'Admin') {
        // Update staff user - only send fields that have been changed
        const staffData: UpdateStaffData = {};
        
        // Only include fields that are different from original or have been modified
        if (formData.name.trim() && formData.name.trim() !== user.name) {
          staffData.name = formData.name.trim();
        }
        if (formData.email.trim() && formData.email.trim() !== user.email) {
          staffData.email = formData.email.trim();
        }
        
        await userManagementService.updateStaff(user.id, staffData);
      } else {
        // Update tenant
        const tenantData: UpdateTenantData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          occupation: formData.occupation || undefined,
          address: Object.keys(formData.address).some(key => formData.address[key as keyof typeof formData.address]) 
            ? formData.address 
            : undefined,
          emergencyContact: {
            name: formData.emergencyContact.name,
            relationship: formData.emergencyContact.relationship,
            phoneNumber: formData.emergencyContact.phoneNumber
          }
        };
        await userManagementService.updateTenant(user.id, tenantData);
      }
      
      onUpdate(); // Refresh the user list
      onClose(); // Close the modal
    } catch (error: any) {
      console.error('Error updating user:', error);
      setGeneralError(error.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit {user.role} Account</h2>
            <p className="text-sm text-gray-500 mt-1">Update information for {user.name}</p>
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
            
            {/* General Error */}
            {generalError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{generalError}</p>
              </div>
            )}

            {/* Staff/Admin Form */}
            {(user.role === 'Staff' || user.role === 'Admin') ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                <p className="text-sm text-gray-600">You can update either field independently or both together. Leave fields unchanged to keep current values.</p>
                
                {/* Name */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Name (Optional)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter full name"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Email Address (Optional)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter email address"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
            ) : (
              /* Tenant Form */
              <div className="space-y-6">
                {/* Personal Information */}
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
                        placeholder="Enter first name"
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
                        placeholder="Enter last name"
                        disabled={isSubmitting}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter email address"
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={(e) => handleChange('phoneNumber', e.target.value)}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="+63 9XX XXX XXXX"
                          disabled={isSubmitting}
                        />
                      </div>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter occupation (optional)"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information (Optional)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Street */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Street</label>
                      <input
                        type="text"
                        value={formData.address.street}
                        onChange={(e) => handleChange('address.street', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="123 Main St"
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">City</label>
                      <input
                        type="text"
                        value={formData.address.city}
                        onChange={(e) => handleChange('address.city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="City"
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Province */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Province</label>
                      <input
                        type="text"
                        value={formData.address.province}
                        onChange={(e) => handleChange('address.province', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Province"
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Zip Code */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Zip Code</label>
                      <input
                        type="text"
                        value={formData.address.zipCode}
                        onChange={(e) => handleChange('address.zipCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="12345"
                        disabled={isSubmitting}
                      />
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
                        value={formData.emergencyContact.name}
                        onChange={(e) => handleChange('emergencyContact.name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.emergencyContactName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Contact name"
                        disabled={isSubmitting}
                      />
                      {errors.emergencyContactName && (
                        <p className="text-red-500 text-xs mt-1">{errors.emergencyContactName}</p>
                      )}
                    </div>

                    {/* Relationship */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Relationship</label>
                      <input
                        type="text"
                        value={formData.emergencyContact.relationship}
                        onChange={(e) => handleChange('emergencyContact.relationship', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Relationship"
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Contact Phone */}
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Contact Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.emergencyContact.phoneNumber}
                          onChange={(e) => handleChange('emergencyContact.phoneNumber', e.target.value)}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.emergencyContactPhone ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="+63 9XX XXX XXXX"
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.emergencyContactPhone && (
                        <p className="text-red-500 text-xs mt-1">{errors.emergencyContactPhone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Updating...' : 'Update User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;