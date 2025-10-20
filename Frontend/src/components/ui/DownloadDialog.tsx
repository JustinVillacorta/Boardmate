import React from 'react';
import { generateReceiptPDF } from '../../utils/receiptPdfGenerator';

interface PaymentRecord {
  id: string;
  description: string;
  amount: string;
  dueDate: string;
  paidDate?: string;
  status: 'Paid' | 'Due' | 'Overdue';
  paymentMethod?: string;
  transactionReference?: string;
  notes?: string;
  tenantName?: string;
  roomNumber?: string;
}

interface Props {
  open: boolean;
  row?: PaymentRecord | null;
  onClose: () => void;
  tenantName?: string;
  roomNumber?: string;
}

const DownloadDialog: React.FC<Props> = ({ open, row, onClose, tenantName, roomNumber }) => {
  if (!open || !row) return null;

  const handleDownload = () => {
    generateReceiptPDF({
      ...row,
      tenantName,
      roomNumber,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-2">Download Receipt</h3>
        <p className="text-sm text-gray-600 mb-4">Download payment receipt as PDF for <strong>{row.description}</strong>.</p>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-3 py-2 bg-white border rounded-md">Cancel</button>
          <button onClick={handleDownload} className="px-4 py-2 bg-blue-600 text-white rounded-md">Download PDF</button>
        </div>
      </div>
    </div>
  );
};

export default DownloadDialog;
