import { body } from 'express-validator';

export const validatePaymentCreate = [
  body('tenant').isMongoId().withMessage('Valid tenant ID is required'),
  body('room').isMongoId().withMessage('Valid room ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('paymentType').isIn(['rent', 'deposit', 'utility', 'maintenance', 'penalty', 'other']).withMessage('Payment type must be one of: rent, deposit, utility, maintenance, penalty, other'),
  body('paymentMethod').isIn(['cash', 'bank_transfer', 'check', 'credit_card', 'debit_card', 'digital_wallet', 'money_order']).withMessage('Payment method must be one of: cash, bank_transfer, check, credit_card, debit_card, digital_wallet, money_order'),
  body('paymentDate').optional().isISO8601().withMessage('Payment date must be a valid date'),
  body('dueDate').isISO8601().withMessage('Due date is required and must be a valid date'),
  body('status').optional().isIn(['paid', 'pending', 'overdue']).withMessage('Status must be one of: paid, pending, overdue'),
  body('periodCovered.startDate').optional().isISO8601().withMessage('Period start date must be a valid date'),
  body('periodCovered.endDate').optional().isISO8601().withMessage('Period end date must be a valid date').custom((value, { req }) => {
    if (value && req.body.periodCovered?.startDate && new Date(value) <= new Date(req.body.periodCovered.startDate)) {
      throw new Error('Period end date must be after start date');
    }
    return true;
  }),
  body('receiptNumber').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Receipt number must be between 1 and 50 characters'),
  body('transactionReference').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Transaction reference must be between 1 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
  body('lateFee.amount').optional().isFloat({ min: 0 }).withMessage('Late fee amount must be a positive number'),
  body('lateFee.reason').optional().trim().isLength({ max: 200 }).withMessage('Late fee reason must not exceed 200 characters'),
  body('lateFee.isLatePayment').optional().isBoolean().withMessage('Late payment flag must be a boolean'),
];

export const validatePaymentUpdate = [
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('paymentType').optional().isIn(['rent', 'deposit', 'utility', 'maintenance', 'penalty', 'other']).withMessage('Payment type must be one of: rent, deposit, utility, maintenance, penalty, other'),
  body('paymentMethod').optional().isIn(['cash', 'bank_transfer', 'check', 'credit_card', 'debit_card', 'digital_wallet', 'money_order']).withMessage('Payment method must be one of: cash, bank_transfer, check, credit_card, debit_card, digital_wallet, money_order'),
  body('paymentDate').optional().isISO8601().withMessage('Payment date must be a valid date'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date'),
  body('status').optional().isIn(['paid', 'pending', 'overdue']).withMessage('Status must be one of: paid, pending, overdue'),
  body('periodCovered.startDate').optional().isISO8601().withMessage('Period start date must be a valid date'),
  body('periodCovered.endDate').optional().isISO8601().withMessage('Period end date must be a valid date').custom((value, { req }) => {
    if (value && req.body.periodCovered?.startDate && new Date(value) <= new Date(req.body.periodCovered.startDate)) {
      throw new Error('Period end date must be after start date');
    }
    return true;
  }),
  body('receiptNumber').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Receipt number must be between 1 and 50 characters'),
  body('transactionReference').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Transaction reference must be between 1 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
  body('lateFee.amount').optional().isFloat({ min: 0 }).withMessage('Late fee amount must be a positive number'),
  body('lateFee.reason').optional().trim().isLength({ max: 200 }).withMessage('Late fee reason must not exceed 200 characters'),
  body('lateFee.isLatePayment').optional().isBoolean().withMessage('Late payment flag must be a boolean'),
];

export const validateMarkPaymentPaid = [
  body('transactionReference').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Transaction reference must be between 1 and 100 characters'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
];
