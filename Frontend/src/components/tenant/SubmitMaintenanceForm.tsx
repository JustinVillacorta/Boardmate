import React, { useState } from 'react';
import { Paperclip, X } from 'lucide-react';

interface SubmitMaintenanceFormProps {
  onClose: () => void;
  onSubmit: (formData: MaintenanceFormData) => void;
}

interface MaintenanceFormData {
  requestDetails: string;
  category: string;
  location: string;
  preferredTime: string;
  contactInfo: string;
  expectedCost: string;
  attachment?: File;
}

const SubmitMaintenanceForm: React.FC<SubmitMaintenanceFormProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<MaintenanceFormData>({
    requestDetails: '',
    category: '',
    location: '',
    preferredTime: '',
    contactInfo: '',
    expectedCost: '',
    attachment: undefined
  });

  const [errors, setErrors] = useState<Partial<MaintenanceFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof MaintenanceFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormData(prev => ({
      ...prev,
      attachment: file
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<MaintenanceFormData> = {};

    if (!formData.requestDetails.trim()) {
      newErrors.requestDetails = 'Request details are required';
    } else if (formData.requestDetails.trim().length < 10) {
      newErrors.requestDetails = 'Request details must be at least 10 characters';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.preferredTime.trim()) {
      newErrors.preferredTime = 'Preferred time is required';
    }

    if (!formData.contactInfo.trim()) {
      newErrors.contactInfo = 'Contact information is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.contactInfo)) {
      newErrors.contactInfo = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Submitting maintenance request:', formData);
      onSubmit(formData);
      setIsSubmitting(false);
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    setFormData({
      requestDetails: '',
      category: '',
      location: '',
      preferredTime: '',
      contactInfo: '',
      expectedCost: '',
      attachment: undefined
    });
    setErrors({});
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Submit Maintenance Request</h2>
            <p className="text-sm text-gray-500 mt-1">
              Please provide detailed information about the maintenance issue you're experiencing.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Request Details */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Details *
              </label>
              <textarea
                name="requestDetails"
                value={formData.requestDetails}
                onChange={handleInputChange}
                placeholder="Brief summary of the issue (e.g., Leaky Faucet)"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.requestDetails ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={3}
              />
              {errors.requestDetails && (
                <p className="text-red-500 text-xs mt-1">{errors.requestDetails}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="(e.g., plumbing)"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">{errors.category}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="where is the issue? (e.g., showers)"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.location && (
                <p className="text-red-500 text-xs mt-1">{errors.location}</p>
              )}
            </div>

            {/* Preferred Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Time *
              </label>
              <input
                type="text"
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleInputChange}
                placeholder="When can we access your room?"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.preferredTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.preferredTime && (
                <p className="text-red-500 text-xs mt-1">{errors.preferredTime}</p>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Information *
              </label>
              <input
                type="tel"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleInputChange}
                placeholder="+63 (9xxx-xxx-xxxx)"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.contactInfo ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.contactInfo && (
                <p className="text-red-500 text-xs mt-1">{errors.contactInfo}</p>
              )}
            </div>

            {/* Expected Cost Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Cost Range (Optional)
              </label>
              <input
                type="text"
                name="expectedCost"
                value={formData.expectedCost}
                onChange={handleInputChange}
                placeholder="e.g., P580, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Attachment */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachment (Optional)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                  id="attachment"
                />
                <label
                  htmlFor="attachment"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <Paperclip className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Upload</span>
                </label>
                {formData.attachment && (
                  <span className="text-sm text-gray-600">{formData.attachment.name}</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitMaintenanceForm;
