import React from 'react';

export interface MarkAsPaidData {
  paymentDate: string;
  paymentMethod: string;
  transactionReference: string;
  notes?: string;
}

const MarkAsPaidForm: React.FC<{
  open: boolean;
  initial?: Partial<MarkAsPaidData>;
  onCancel: () => void;
  onSubmit: (data: MarkAsPaidData) => void;
  title?: string;
}> = ({ open, initial = {}, onCancel, onSubmit, title = 'Mark as Paid' }) => {
  const [form, setForm] = React.useState<MarkAsPaidData>({
    paymentDate: initial.paymentDate ?? '',
    paymentMethod: initial.paymentMethod ?? 'cash',
    transactionReference: initial.transactionReference ?? '',
    notes: initial.notes ?? '',
  });

  React.useEffect(() => {
    setForm({
      paymentDate: initial.paymentDate ?? '',
      paymentMethod: initial.paymentMethod ?? 'cash',
      transactionReference: initial.transactionReference ?? '',
      notes: initial.notes ?? '',
    });
  }, [initial]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/40" onClick={onCancel} />
      <div className="bg-white rounded-xl shadow max-w-md w-full z-10 p-6 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button aria-label="Close" className="text-gray-500 text-xl leading-none" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Payment Date</label>
            <input required type="date" value={form.paymentDate} onChange={e => setForm(f => ({ ...f, paymentDate: e.target.value }))} className="w-full border rounded-md px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Payment Method</label>
            <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} className="w-full border rounded-md px-3 py-2">
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="card">Card</option>
              <option value="gcash">GCash</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Transaction Reference</label>
            <input required type="text" value={form.transactionReference} onChange={e => setForm(f => ({ ...f, transactionReference: e.target.value }))} className="w-full border rounded-md px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full border rounded-md px-3 py-2" rows={3} />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button type="button" onClick={() => setForm({ paymentDate: initial.paymentDate ?? '', paymentMethod: initial.paymentMethod ?? 'cash', transactionReference: initial.transactionReference ?? '', notes: initial.notes ?? '' })} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium">Clear</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white">Mark as Paid</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarkAsPaidForm;
