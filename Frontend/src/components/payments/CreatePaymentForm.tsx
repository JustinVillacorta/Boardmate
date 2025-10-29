import React from 'react';
import { validatePaymentCreate } from '../../utils/validation';

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
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const mapErrors = (validationErrors: Record<string, string>): Record<string, string> => {
    const keyMap: Record<string, string> = {
      'periodCovered.startDate': 'periodStart',
      'periodCovered.endDate': 'periodEnd',
    };
    const allowedKeys = new Set([
      'amount',
      'paymentType',
      'paymentMethod',
      'dueDate',
      'paymentDate',
      'status',
      'transactionReference',
      'description',
      'periodStart',
      'periodEnd',
    ]);
    const next: Record<string, string> = {};
    Object.entries(validationErrors).forEach(([key, message]) => {
      const mappedKey = keyMap[key] ?? key;
      if (allowedKeys.has(mappedKey)) {
        next[mappedKey] = message;
      }
    });
    return next;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const provisional = {
      amount,
      paymentType,
      paymentMethod,
      dueDate,
      status,
      paymentDate,
      periodCovered: { startDate: periodStart, endDate: periodEnd },
      transactionReference,
      description,
    };
    const validationErrors = validatePaymentCreate(provisional, { requireTenantRoom: false });
    const mapped = mapErrors(validationErrors);
    setErrors(mapped);
    if (Object.keys(mapped).length > 0) {
      return;
    }

    const payload: PaymentPayload = {
      amount: Number(amount),
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
          <input
            value={amount}
            onChange={e => {
              setAmount(e.target.value);
              if (errors.amount) setErrors(prev => { const next = { ...prev }; delete next.amount; return next; });
            }}
            type="number"
            step="0.01"
            className={`w-full border rounded-md px-3 py-2 ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
            aria-invalid={!!errors.amount}
            aria-describedby={errors.amount ? 'payment-amount-error' : undefined}
            required
          />
          {errors.amount && <p id="payment-amount-error" className="text-xs text-red-500 mt-1">{errors.amount}</p>}
        </label>

        <label className="block">
          <div className="text-sm text-gray-600 mb-1">Payment Type</div>
          <select
            value={paymentType}
            onChange={e => {
              setPaymentType(e.target.value);
              if (errors.paymentType) setErrors(prev => { const next = { ...prev }; delete next.paymentType; return next; });
            }}
            className={`w-full border rounded-md px-3 py-2 ${errors.paymentType ? 'border-red-500' : 'border-gray-300'}`}
            aria-invalid={!!errors.paymentType}
            aria-describedby={errors.paymentType ? 'payment-type-error' : undefined}
          >
            <option value="rent">Rent</option>
            <option value="deposit">Deposit</option>
            <option value="utility">Utility</option>
            <option value="maintenance">Maintenance</option>
            <option value="penalty">Penalty</option>
            <option value="other">Other</option>
          </select>
          {errors.paymentType && <p id="payment-type-error" className="text-xs text-red-500 mt-1">{errors.paymentType}</p>}
        </label>

        <label className="block">
          <div className="text-sm text-gray-600 mb-1">Payment Method</div>
          <select
            value={paymentMethod}
            onChange={e => {
              setPaymentMethod(e.target.value);
              if (errors.paymentMethod) setErrors(prev => { const next = { ...prev }; delete next.paymentMethod; return next; });
            }}
            className={`w-full border rounded-md px-3 py-2 ${errors.paymentMethod ? 'border-red-500' : 'border-gray-300'}`}
            aria-invalid={!!errors.paymentMethod}
            aria-describedby={errors.paymentMethod ? 'payment-method-error' : undefined}
          >
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="check">Check</option>
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="digital_wallet">Digital Wallet</option>
            <option value="money_order">Money Order</option>
          </select>
          {errors.paymentMethod && <p id="payment-method-error" className="text-xs text-red-500 mt-1">{errors.paymentMethod}</p>}
        </label>

        <label className="block">
          <div className="text-sm text-gray-600 mb-1">Status</div>
          <select
            value={status}
            onChange={e => {
              setStatus(e.target.value);
              if (errors.status) setErrors(prev => { const next = { ...prev }; delete next.status; return next; });
            }}
            className={`w-full border rounded-md px-3 py-2 ${errors.status ? 'border-red-500' : 'border-gray-300'}`}
            aria-invalid={!!errors.status}
            aria-describedby={errors.status ? 'payment-status-error' : undefined}
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
          {errors.status && <p id="payment-status-error" className="text-xs text-red-500 mt-1">{errors.status}</p>}
        </label>
      </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <div className="text-sm text-gray-600 mb-1">Due Date</div>
          <input
            value={dueDate}
            onChange={e => {
              setDueDate(e.target.value);
              if (errors.dueDate) setErrors(prev => { const next = { ...prev }; delete next.dueDate; return next; });
            }}
            type="date"
            className={`w-full border rounded-md px-3 py-2 ${errors.dueDate ? 'border-red-500' : 'border-gray-300'}`}
            aria-invalid={!!errors.dueDate}
            aria-describedby={errors.dueDate ? 'payment-dueDate-error' : undefined}
            required
          />
          {errors.dueDate && <p id="payment-dueDate-error" className="text-xs text-red-500 mt-1">{errors.dueDate}</p>}
        </label>

        <label className="block">
            <div className="text-sm text-gray-600 mb-1">Payment Date</div>
            <input
              value={paymentDate}
              onChange={e => {
                setPaymentDate(e.target.value);
                if (errors.paymentDate) setErrors(prev => { const next = { ...prev }; delete next.paymentDate; return next; });
              }}
              type="date"
              className={`w-full border rounded-md px-3 py-2 ${errors.paymentDate ? 'border-red-500' : 'border-gray-300'}`}
              aria-invalid={!!errors.paymentDate}
              aria-describedby={errors.paymentDate ? 'payment-paymentDate-error' : undefined}
              disabled={status === 'due'}
            />
            {errors.paymentDate && <p id="payment-paymentDate-error" className="text-xs text-red-500 mt-1">{errors.paymentDate}</p>}
        </label>
      </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <div className="text-sm text-gray-600 mb-1">Period Start</div>
          <input
            value={periodStart}
            onChange={e => {
              setPeriodStart(e.target.value);
              if (errors.periodStart) setErrors(prev => { const next = { ...prev }; delete next.periodStart; return next; });
            }}
            type="date"
            className={`w-full border rounded-md px-3 py-2 ${errors.periodStart ? 'border-red-500' : 'border-gray-300'}`}
            aria-invalid={!!errors.periodStart}
            aria-describedby={errors.periodStart ? 'payment-periodStart-error' : undefined}
          />
          {errors.periodStart && <p id="payment-periodStart-error" className="text-xs text-red-500 mt-1">{errors.periodStart}</p>}
        </label>

        <label className="block">
          <div className="text-sm text-gray-600 mb-1">Period End</div>
          <input
            value={periodEnd}
            onChange={e => {
              setPeriodEnd(e.target.value);
              if (errors.periodEnd) setErrors(prev => { const next = { ...prev }; delete next.periodEnd; return next; });
            }}
            type="date"
            className={`w-full border rounded-md px-3 py-2 ${errors.periodEnd ? 'border-red-500' : 'border-gray-300'}`}
            aria-invalid={!!errors.periodEnd}
            aria-describedby={errors.periodEnd ? 'payment-periodEnd-error' : undefined}
          />
          {errors.periodEnd && <p id="payment-periodEnd-error" className="text-xs text-red-500 mt-1">{errors.periodEnd}</p>}
        </label>
      </div>

      <label className="block">
        <div className="text-sm text-gray-600 mb-1">Transaction Reference</div>
        <input
          value={transactionReference}
          onChange={e => {
            setTransactionReference(e.target.value);
            if (errors.transactionReference) setErrors(prev => { const next = { ...prev }; delete next.transactionReference; return next; });
          }}
          type="text"
          className={`w-full border rounded-md px-3 py-2 ${errors.transactionReference ? 'border-red-500' : 'border-gray-300'}`}
          aria-invalid={!!errors.transactionReference}
          aria-describedby={errors.transactionReference ? 'payment-transactionReference-error' : undefined}
          disabled={status === 'due'}
        />
        {errors.transactionReference && <p id="payment-transactionReference-error" className="text-xs text-red-500 mt-1">{errors.transactionReference}</p>}
      </label>

      <label className="block">
        <div className="text-sm text-gray-600 mb-1">Description</div>
        <textarea
          value={description}
          onChange={e => {
            setDescription(e.target.value);
            if (errors.description) setErrors(prev => { const next = { ...prev }; delete next.description; return next; });
          }}
          rows={4}
          className={`w-full border rounded-md px-3 py-2 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'payment-description-error' : undefined}
        />
        {errors.description && <p id="payment-description-error" className="text-xs text-red-500 mt-1">{errors.description}</p>}
      </label>

      <div className="flex items-center justify-end space-x-3 pt-4 border-t">
        <button type="button" onClick={() => { clearForm(); setErrors({}); }} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium">Clear</button>
        <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white">Create Payment</button>
      </div>
    </form>
  );
};

export default CreatePaymentForm;
