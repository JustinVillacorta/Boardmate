// Payment types
export interface PaymentRow {
  id: string;
  room: string;
  tenant: string;
  pending: string;
  overdue: string;
  lastPayment: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending';
  method: string;
  hasReceipt: boolean;
}

export interface Payment {
  _id: string;
  tenant: string;
  room: string;
  amount: number;
  paymentDate: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paymentMethod?: 'cash' | 'bank_transfer' | 'gcash' | 'card';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}