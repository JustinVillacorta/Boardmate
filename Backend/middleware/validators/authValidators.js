import { body } from 'express-validator';

export const validateRegister = [
  body('name').trim().isLength({ min: 3, max: 30 }).withMessage('Name must be between 3 and 30 characters').matches(/^[a-zA-Z0-9\s]+$/).withMessage('Name can only contain letters, numbers, and spaces'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('role').optional().isIn(['admin', 'staff']).withMessage('Role must be either admin or staff'),
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const validateUpdateDetails = [
  body('name').optional().trim().isLength({ min: 3, max: 30 }).withMessage('Name must be between 3 and 30 characters').matches(/^[a-zA-Z0-9\s]+$/).withMessage('Name can only contain letters, numbers, and spaces'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
];

export const validateUpdatePassword = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Password confirmation does not match new password');
    }
    return true;
  }),
];
