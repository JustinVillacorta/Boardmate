import React, { useState } from 'react';
import { X } from 'lucide-react';
import { authService } from '../../services/authService';

interface SubmitMaintenanceFormProps {
  onClose: () => void;
  // payload expected by backend: { room, type: 'maintenance', title, description }
  onSubmit: (payload: { room: string; type: string; title: string; description: string }) => void;
}

interface MaintenanceFormData {
  type: string;
  title: string;
  description: string;
}

const SubmitMaintenanceForm: React.FC<SubmitMaintenanceFormProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<MaintenanceFormData>({
    type: 'maintenance',
    title: '',
    description: ''
  });

  const [errors, setErrors] = useState<Partial<MaintenanceFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const validateForm = (): boolean => {
    const newErrors: Partial<MaintenanceFormData> = {};

    if (!formData.type || !formData.type.trim()) {
      newErrors.type = 'Type is required';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    // only title and description are required for API payload

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Try to get tenant data from local storage first
      let userData: any = authService.getUserData();

      if (!userData) {
        // Attempt to refresh from API
        const refreshed = await authService.getCurrentUser();
        userData = refreshed?.userData || null;
      }

      const tenant = userData as any;
      const roomId = tenant?.room?._id || tenant?.room;

      if (!roomId) {
        throw new Error('No room assigned to your account. Please contact administration.');
      }

      console.log('Debug: Submitting report with room ID:', roomId);

  const payload = { room: roomId, type: formData.type || 'maintenance', title: formData.title.trim(), description: formData.description.trim() };

      await onSubmit(payload);
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      console.error('Error submitting report:', err);
      setErrors(prev => ({ ...prev, description: prev.description }));
      alert(err?.message || 'Failed to submit maintenance request');
    }
  };

  const handleClear = () => {
    setFormData({ type: 'maintenance', title: '', description: '' });
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
            {/* Type selector */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="maintenance">maintenance</option>
                <option value="complaint">complaint</option>
                <option value="other">other</option>
              </select>
              {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
            </div>

            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Short summary (e.g., Broken Air Conditioning)"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the issue in detail"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={4}
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
              )}
            </div>

            {/* Only Title and Description are required by the API body; other fields removed */}
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
