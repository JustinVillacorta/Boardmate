import api from '../config/api';

export interface CreatePaymentDTO {
  tenant: string;
  room: string;
  amount?: number;
  paymentType: 'rent' | 'deposit' | 'utility' | 'maintenance' | 'penalty' | 'other';
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'credit_card' | 'debit_card' | 'digital_wallet' | 'money_order';
  paymentDate?: string;
  dueDate: string;
  status?: 'paid' | 'pending' | 'overdue' | 'due';
  periodCovered?: { startDate?: string; endDate?: string };
  transactionReference?: string;
  description?: string;
  notes?: string;
}

export const PaymentService = {
  list(params: Record<string, any>) {
    return api.get('/payments', { params }).then(r => r.data);
  },
  get(id: string) {
    return api.get(`/payments/${id}`).then(r => r.data);
  },
  create(payload: CreatePaymentDTO) {
    return api.post('/payments', payload).then(r => r.data);
  },
  update(id: string, payload: Partial<CreatePaymentDTO>) {
    return api.put(`/payments/${id}`, payload).then(r => r.data);
  },
  markPaid(id: string, data: { transactionReference?: string; notes?: string }) {
    return api.put(`/payments/${id}/mark-paid`, data).then(r => r.data);
  },
  generateMonthly(date?: string) {
    const params = date ? { date } : undefined;
    return api.post('/payments/generate-monthly', null, { params }).then(r => r.data);
  },
  backfillDeposits() {
    return api.post('/payments/backfill-deposits').then(r => r.data);
  },
  tenantPayments(tenantId: string, params?: Record<string, any>) {
    return api.get(`/payments/tenant/${tenantId}`, { params }).then(r => r.data);
  },
  tenantSummary(tenantId: string) {
    return api.get(`/payments/tenant/${tenantId}/summary`).then(r => r.data);
  },
  receipt(id: string) {
    return api.get(`/payments/${id}/receipt`, { responseType: 'blob' });
  },
  receiptData(id: string) {
    return api.get(`/payments/${id}/receipt-data`).then(r => r.data);
  },
  receiptHTML(id: string) {
    return api.get(`/payments/${id}/receipt-html`).then(r => r.data);
  },
};

export default PaymentService;

