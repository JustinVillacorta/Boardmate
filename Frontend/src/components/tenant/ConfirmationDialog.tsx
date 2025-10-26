import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: 'blue' | 'red' | 'green' | 'gray';
  isLoading?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  confirmButtonColor = 'blue',
  isLoading = false
}) => {
  if (!isOpen) return null;

  const getConfirmButtonClasses = () => {
    const baseClasses = 'px-4 py-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    
    switch (confirmButtonColor) {
      case 'red':
        return `${baseClasses} bg-red-600 text-white hover:bg-red-700`;
      case 'green':
        return `${baseClasses} bg-green-600 text-white hover:bg-green-700`;
      case 'gray':
        return `${baseClasses} bg-gray-600 text-white hover:bg-gray-700`;
      case 'blue':
      default:
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={getConfirmButtonClasses()}
          >
            {isLoading ? 'Processing...' : confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;