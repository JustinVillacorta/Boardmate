import React from 'react';

interface PaymentRecord {
  id: string;
  description: string;
  amount: string;
  dueDate: string;
  paidDate?: string;
  status: 'Paid' | 'Due' | 'Overdue';
}

interface Props {
  open: boolean;
  row?: PaymentRecord | null;
  onClose: () => void;
  onDownload: (row: PaymentRecord, format: 'csv' | 'json') => void;
}

const DownloadDialog: React.FC<Props> = ({ open, row, onClose, onDownload }) => {
  // PDF-only dialog copy (UI simplified to indicate download will be PDF)
  if (!open || !row) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-2">Download Payment (PDF)</h3>
        <p className="text-sm text-gray-600 mb-4">This will download a PDF file containing the payment record for <strong>{row.description}</strong>.</p>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-3 py-2 bg-white border rounded-md">Cancel</button>
          <button onClick={() => { onDownload(row, 'json'); onClose(); }} className="px-4 py-2 bg-blue-600 text-white rounded-md">Download PDF</button>
        </div>
      </div>
    </div>
  );
};

export default DownloadDialog;
