import React from 'react';
import { UserMinus, AlertTriangle } from 'lucide-react';

interface RemoveTenantConfirmDialogProps {
  isOpen: boolean;
  tenantName?: string;
  roomName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const RemoveTenantConfirmDialog: React.FC<RemoveTenantConfirmDialogProps> = ({
  isOpen,
  tenantName,
  roomName,
  onConfirm,
  onCancel,
  loading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onCancel} />
      
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Remove Tenant</h3>
            <p className="text-sm text-gray-500">This action cannot be undone</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <UserMinus className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-800">
                  Are you sure you want to remove{' '}
                  <span className="font-semibold">{tenantName || 'this tenant'}</span>{' '}
                  from{' '}
                  <span className="font-semibold">{roomName || 'this room'}</span>?
                </p>
                <ul className="mt-3 text-xs text-red-700 space-y-1">
                  <li>• The tenant's lease will be terminated</li>
                  <li>• The room will become available for new tenants</li>
                  <li>• All tenant data will remain in the system</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <UserMinus className="w-4 h-4" />
                Remove Tenant
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveTenantConfirmDialog;