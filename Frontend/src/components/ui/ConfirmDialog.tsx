import React, { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  // allow message to be a string or React node for flexibility
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  // optional status to style the confirm button (e.g., 'Resolved' -> green)
  confirmStatus?: 'Resolved' | 'In Progress' | 'Pending' | 'Rejected';
  // optional variant for special confirm styling (e.g., reopen uses primary blue)
  confirmVariant?: 'reopen';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmStatus,
  confirmVariant,
  onConfirm,
  onCancel,
}) => {
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };

    document.addEventListener('keydown', onKey);
    // focus cancel button for safe default
    setTimeout(() => cancelRef.current?.focus(), 0);

    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onCancel, onConfirm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-auto overflow-hidden">
        <div className="flex items-start justify-between p-5 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title || 'Are you sure?'}</h3>
          <button
            onClick={onCancel}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 ml-3"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t bg-white">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${(
              (confirmVariant === 'reopen' && 'bg-blue-600 hover:bg-blue-700') ||
              (confirmStatus === 'Resolved' && 'bg-green-600 hover:bg-green-700') ||
              (confirmStatus === 'Rejected' && 'bg-red-600 hover:bg-red-700') ||
              (confirmStatus === 'In Progress' && 'bg-blue-600 hover:bg-blue-700') ||
              (confirmStatus === 'Pending' && 'bg-yellow-500 hover:bg-yellow-600') ||
              'bg-blue-600 hover:bg-blue-700'
            )}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
