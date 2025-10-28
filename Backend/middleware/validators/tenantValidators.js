import { body } from 'express-validator';

export const validateTenantRegister = [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters').matches(/^[a-zA-Z\s]+$/).withMessage('First name can only contain letters and spaces'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters').matches(/^[a-zA-Z\s]+$/).withMessage('Last name can only contain letters and spaces'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('phoneNumber').matches(/^[\+]?\d{10,15}$/).withMessage('Please provide a valid phone number (10-15 digits)'),
  body('dateOfBirth').isISO8601().withMessage('Please provide a valid date of birth').custom((value) => {
    const today = new Date();
    const dob = new Date(value);
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      return age >= 16;
    }
    return age >= 16;
  }).withMessage('Tenant must be at least 16 years old'),
  body('occupation').optional().trim().isLength({ max: 100 }).withMessage('Occupation must not exceed 100 characters'),
  body('address.street').optional().trim().isLength({ max: 100 }).withMessage('Street address must not exceed 100 characters'),
  body('address.city').optional().trim().isLength({ max: 50 }).withMessage('City must not exceed 50 characters'),
  body('address.province').optional().trim().isLength({ max: 50 }).withMessage('Province must not exceed 50 characters'),
  body('address.zipCode').optional().trim().isLength({ max: 10 }).withMessage('Zip code must not exceed 10 characters'),
  body('idType').isIn(['passport', 'drivers_license', 'national_id', 'other']).withMessage('ID type must be one of: passport, drivers_license, national_id, or other'),
  body('idNumber').trim().isLength({ min: 1, max: 50 }).withMessage('ID number is required and must not exceed 50 characters'),
  body('emergencyContact.name').trim().isLength({ min: 2, max: 100 }).withMessage('Emergency contact name must be between 2 and 100 characters').matches(/^[a-zA-Z\s]+$/).withMessage('Emergency contact name can only contain letters and spaces'),
  body('emergencyContact.relationship').trim().isLength({ min: 2, max: 50 }).withMessage('Emergency contact relationship must be between 2 and 50 characters'),
  body('emergencyContact.phoneNumber').matches(/^[\+]?\d{10,15}$/).withMessage('Please provide a valid emergency contact phone number (10-15 digits)'),
];

export const validateTenantUpdateDetails = [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters').matches(/^[a-zA-Z\s]+$/).withMessage('First name can only contain letters and spaces'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters').matches(/^[a-zA-Z\s]+$/).withMessage('Last name can only contain letters and spaces'),
  body('phoneNumber').optional().matches(/^[\+]?\d{10,15}$/).withMessage('Please provide a valid phone number (10-15 digits)'),
  body('occupation').optional().trim().isLength({ max: 100 }).withMessage('Occupation must not exceed 100 characters'),
  body('address.street').optional().trim().isLength({ max: 100 }).withMessage('Street address must not exceed 100 characters'),
  body('address.city').optional().trim().isLength({ max: 50 }).withMessage('City must not exceed 50 characters'),
  body('address.province').optional().trim().isLength({ max: 50 }).withMessage('Province must not exceed 50 characters'),
  body('address.zipCode').optional().trim().isLength({ max: 10 }).withMessage('Zip code must not exceed 10 characters'),
  body('emergencyContact.name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Emergency contact name must be between 2 and 100 characters').matches(/^[a-zA-Z\s]+$/).withMessage('Emergency contact name can only contain letters and spaces'),
  body('emergencyContact.relationship').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Emergency contact relationship must be between 2 and 50 characters'),
  body('emergencyContact.phoneNumber').optional().matches(/^[\+]?\d{10,15}$/).withMessage('Please provide a valid emergency contact phone number (10-15 digits)'),
];

export { validateUpdatePassword as validateTenantUpdatePassword } from './authValidators.js';
