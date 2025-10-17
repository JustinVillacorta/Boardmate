import { body } from 'express-validator';

// Validation for user registration
export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Name must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage('Name can only contain letters, numbers, and spaces'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  body('role')
    .optional()
    .isIn(['admin', 'staff'])
    .withMessage('Role must be either admin or staff'),
];

// Validation for user login
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Validation for updating user details
export const validateUpdateDetails = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Name must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage('Name can only contain letters, numbers, and spaces'),

  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
];

// Validation for updating password
export const validateUpdatePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
];

// ==================== TENANT VALIDATIONS ====================

// Validation for tenant registration
export const validateTenantRegister = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),

  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  body('phoneNumber')
    .matches(/^[\+]?[0-9]{10,15}$/)
    .withMessage('Please provide a valid phone number (10-15 digits)'),

  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const today = new Date();
      const dob = new Date(value);
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        return age >= 18;
      }
      return age >= 18;
    })
    .withMessage('Tenant must be at least 18 years old'),

  body('occupation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Occupation must not exceed 100 characters'),

  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Street address must not exceed 100 characters'),

  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City must not exceed 50 characters'),

  body('address.province')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Province must not exceed 50 characters'),

  body('address.zipCode')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Zip code must not exceed 10 characters'),

  body('idType')
    .isIn(['passport', 'drivers_license', 'national_id', 'other'])
    .withMessage('ID type must be one of: passport, drivers_license, national_id, or other'),

  body('idNumber')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('ID number is required and must not exceed 50 characters'),

  body('emergencyContact.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Emergency contact name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Emergency contact name can only contain letters and spaces'),

  body('emergencyContact.relationship')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Emergency contact relationship must be between 2 and 50 characters'),

  body('emergencyContact.phoneNumber')
    .matches(/^[\+]?[0-9]{10,15}$/)
    .withMessage('Please provide a valid emergency contact phone number (10-15 digits)'),
];

// Validation for tenant login (same as user login)
export const validateTenantLogin = validateLogin;

// Validation for updating tenant details
export const validateTenantUpdateDetails = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),

  body('phoneNumber')
    .optional()
    .matches(/^[\+]?[0-9]{10,15}$/)
    .withMessage('Please provide a valid phone number (10-15 digits)'),

  body('occupation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Occupation must not exceed 100 characters'),

  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Street address must not exceed 100 characters'),

  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City must not exceed 50 characters'),

  body('address.province')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Province must not exceed 50 characters'),

  body('address.zipCode')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Zip code must not exceed 10 characters'),

  body('emergencyContact.name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Emergency contact name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Emergency contact name can only contain letters and spaces'),

  body('emergencyContact.relationship')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Emergency contact relationship must be between 2 and 50 characters'),

  body('emergencyContact.phoneNumber')
    .optional()
    .matches(/^[\+]?[0-9]{10,15}$/)
    .withMessage('Please provide a valid emergency contact phone number (10-15 digits)'),
];

// Validation for updating tenant password (same as user password update)
export const validateTenantUpdatePassword = validateUpdatePassword;

// ==================== ROOM VALIDATIONS ====================

// Validation for room creation
export const validateRoomCreate = [
  body('roomNumber')
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Room number is required and must not exceed 10 characters')
    .matches(/^[a-zA-Z0-9\-]+$/)
    .withMessage('Room number can only contain letters, numbers, and hyphens'),

  body('roomType')
    .isIn(['single', 'double', 'triple', 'quad'])
    .withMessage('Room type must be one of: single, double, triple, quad'),

  body('capacity')
    .isInt({ min: 1, max: 4 })
    .withMessage('Capacity must be between 1 and 4'),

  body('monthlyRent')
    .isFloat({ min: 0 })
    .withMessage('Monthly rent must be a positive number'),

  body('securityDeposit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Security deposit must be a positive number'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),

  body('amenities.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each amenity must be between 1 and 50 characters'),

  body('floor')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Floor must be a non-negative integer'),

  body('area')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Area must be a positive number'),

  body('status')
    .optional()
    .isIn(['available', 'occupied', 'maintenance', 'unavailable'])
    .withMessage('Status must be one of: available, occupied, maintenance, unavailable'),

  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),

  body('images.*')
    .optional()
    .trim()
    .isURL()
    .withMessage('Each image must be a valid URL'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),

  body('nextMaintenanceDate')
    .optional()
    .isISO8601()
    .withMessage('Next maintenance date must be a valid date'),
];

// Validation for room update
export const validateRoomUpdate = [
  body('roomNumber')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Room number must not exceed 10 characters')
    .matches(/^[a-zA-Z0-9\-]+$/)
    .withMessage('Room number can only contain letters, numbers, and hyphens'),

  body('roomType')
    .optional()
    .isIn(['single', 'double', 'triple', 'quad'])
    .withMessage('Room type must be one of: single, double, triple, quad'),

  body('capacity')
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage('Capacity must be between 1 and 4'),

  body('monthlyRent')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monthly rent must be a positive number'),

  body('securityDeposit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Security deposit must be a positive number'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),

  body('amenities.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each amenity must be between 1 and 50 characters'),

  body('floor')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Floor must be a non-negative integer'),

  body('area')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Area must be a positive number'),

  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),

  body('images.*')
    .optional()
    .trim()
    .isURL()
    .withMessage('Each image must be a valid URL'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),

  body('nextMaintenanceDate')
    .optional()
    .isISO8601()
    .withMessage('Next maintenance date must be a valid date'),
];

// Validation for tenant assignment
export const validateTenantAssignment = [
  body('tenantId')
    .isMongoId()
    .withMessage('Valid tenant ID is required'),

  body('leaseStartDate')
    .isISO8601()
    .withMessage('Valid lease start date is required'),

  body('leaseEndDate')
    .optional()
    .isISO8601()
    .withMessage('Lease end date must be a valid date')
    .custom((value, { req }) => {
      if (value && req.body.leaseStartDate && new Date(value) <= new Date(req.body.leaseStartDate)) {
        throw new Error('Lease end date must be after start date');
      }
      return true;
    }),

  body('monthlyRent')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monthly rent must be a positive number'),

  body('securityDeposit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Security deposit must be a positive number'),
];

// Validation for room status update
export const validateRoomStatusUpdate = [
  body('status')
    .isIn(['available', 'occupied', 'maintenance', 'unavailable'])
    .withMessage('Status must be one of: available, occupied, maintenance, unavailable'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
];