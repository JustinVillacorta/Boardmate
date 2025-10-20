import React from 'react';

export interface PaymentPayload {
  amount: number;
  paymentType: string;
  paymentMethod: string;
  dueDate?: string;
  status: string;
  paymentDate?: string;
  periodCovered?: { startDate?: string; endDate?: string };
  transactionReference?: string;
  description?: string;
}

export const defaultValues: Partial<PaymentPayload> = {
  paymentType: 'rent',
  paymentMethod: 'cash',
  status: 'pending',
};

const CreatePaymentForm: React.FC<{
  initial?: Partial<PaymentPayload>;
  onSubmit: (p: PaymentPayload) => void;
  onCancel?: () => void;
}> = ({ initial = {}, onSubmit, onCancel }) => {
  const [amount, setAmount] = React.useState<string>(String(initial.amount ?? ''));
  const [paymentType, setPaymentType] = React.useState<string>(initial.paymentType ?? defaultValues.paymentType!);
  const [paymentMethod, setPaymentMethod] = React.useState<string>(initial.paymentMethod ?? defaultValues.paymentMethod!);
  const [dueDate, setDueDate] = React.useState<string>(initial.dueDate ?? '');
  const [status, setStatus] = React.useState<string>(initial.status ?? defaultValues.status!);
  const [paymentDate, setPaymentDate] = React.useState<string>(initial.paymentDate ?? '');
  const [periodStart, setPeriodStart] = React.useState<string>(initial.periodCovered?.startDate ?? '');
  const [periodEnd, setPeriodEnd] = React.useState<string>(initial.periodCovered?.endDate ?? '');
  const [transactionReference, setTransactionReference] = React.useState<string>(initial.transactionReference ?? '');
  const [description, setDescription] = React.useState<string>(initial.description ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: PaymentPayload = {
      amount: Number(amount || 0),
      paymentType,
      paymentMethod,
      dueDate: dueDate || undefined,
      status,
      paymentDate: paymentDate || undefined,
      periodCovered: { startDate: periodStart || undefined, endDate: periodEnd || undefined },
      transactionReference: transactionReference || undefined,
      description: description || undefined,
    };
    onSubmit(payload);
  };

  const clearForm = () => {
    setAmount(String(initial.amount ?? ''));
    setPaymentType(initial.paymentType ?? defaultValues.paymentType!);
    setPaymentMethod(initial.paymentMethod ?? defaultValues.paymentMethod!);
    setDueDate(initial.dueDate ?? '');
    setStatus(initial.status ?? defaultValues.status!);
    setPaymentDate(initial.paymentDate ?? '');
    setPeriodStart(initial.periodCovered?.startDate ?? '');
    setPeriodEnd(initial.periodCovered?.endDate ?? '');
    setTransactionReference(initial.transactionReference ?? '');
    setDescription(initial.description ?? '');
  };

  // when status is 'pending' clear paymentDate and transactionReference so they're not accessible
  React.useEffect(() => {
    if (status === 'pending') {
      setPaymentDate('');
      setTransactionReference('');
    }
  }, [status]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <div className="text-sm text-gray-600 mb-1">Amount</div>
          <input value={amount} onChange={e => setAmount(e.target.value)} type="number" step="0.01" className="w-full border rounded-md px-3 py-2" required />
        </label>

        <label className="block">
          <div className="text-sm text-gray-600 mb-1">Payment Type</div>
          <select value={paymentType} onChange={e => setPaymentType(e.target.value)} className="w-full border rounded-md px-3 py-2">
            <option value="rent">Rent</option>
            <option value="deposit">Deposit</option>
            <option value="utility">Utility</option>
            <option value="maintenance">Maintenance</option>
            <option value="penalty">Penalty</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label className="block">
          <div className="text-sm text-gray-600 mb-1">Payment Method</div>
          <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full border rounded-md px-3 py-2">
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="check">Check</option>
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="digital_wallet">Digital Wallet</option>
            <option value="money_order">Money Order</option>
          </select>
        </label>

        <label className="block">
          <div className="text-sm text-gray-600 mb-1">Status</div>
          <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border rounded-md px-3 py-2">
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </label>
      </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <div className="text-sm text-gray-600 mb-1">Due Date</div>
          <input value={dueDate} onChange={e => setDueDate(e.target.value)} type="date" className="w-full border rounded-md px-3 py-2" />
        </label>

        <label className="block">
            <div className="text-sm text-gray-600 mb-1">Payment Date</div>
            <input value={paymentDate} onChange={e => setPaymentDate(e.target.value)} type="date" className="w-full border rounded-md px-3 py-2" disabled={status === 'due'} />
        </label>
      </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <div className="text-sm text-gray-600 mb-1">Period Start</div>
          <input value={periodStart} onChange={e => setPeriodStart(e.target.value)} type="date" className="w-full border rounded-md px-3 py-2" />
        </label>

        <label className="block">
          <div className="text-sm text-gray-600 mb-1">Period End</div>
          <input value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} type="date" className="w-full border rounded-md px-3 py-2" />
        </label>
      </div>

      <label className="block">
        <div className="text-sm text-gray-600 mb-1">Transaction Reference</div>
        <input value={transactionReference} onChange={e => setTransactionReference(e.target.value)} type="text" className="w-full border rounded-md px-3 py-2" disabled={status === 'due'} />
      </label>

      <label className="block">
        <div className="text-sm text-gray-600 mb-1">Description</div>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full border rounded-md px-3 py-2" />
      </label>

      <div className="flex items-center justify-end space-x-3 pt-4 border-t">
        <button type="button" onClick={clearForm} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium">Clear</button>
        <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white">Create Payment</button>
      </div>
    </form>
  );
};

export default CreatePaymentForm;
