import { body } from 'express-validator';

export const validateReportCreate = [
  body('tenant').optional().isMongoId().withMessage('Valid tenant ID is required'),
  body('room').isMongoId().withMessage('Valid room ID is required'),
  body('type').isIn(['maintenance', 'complaint', 'other']).withMessage('Type must be either maintenance or complaint'),
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
];

export const validateReportUpdate = [
  body('status').isIn(['pending', 'in-progress', 'resolved', 'rejected']).withMessage('Status must be one of: pending, in-progress, resolved, rejected'),
];
