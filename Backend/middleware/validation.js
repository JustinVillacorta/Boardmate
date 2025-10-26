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
        return age >= 16;
      }
      return age >= 16;
    })
    .withMessage('Tenant must be at least 16 years old'),

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

  // Contract file validation
  body('contractFile')
    .notEmpty()
    .withMessage('Contract file is required')
    .custom((value) => {
      // Check if it's a valid base64 string
      const base64Regex = /^data:application\/pdf;base64,/
      if (!base64Regex.test(value)) {
        throw new Error('Contract file must be a PDF file in base64 format');
      }
      
      // Decode base64 to check size (approximately 4/3 of the string length)
      const base64Data = value.split(',')[1];
      const sizeInBytes = (base64Data.length * 3) / 4;
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (sizeInBytes > maxSize) {
        throw new Error('Contract file size must not exceed 10MB');
      }
      
      return true;
    }),

  body('contractFileName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Contract file name must be between 1 and 255 characters')
    .matches(/\.pdf$/i)
    .withMessage('Contract file must have .pdf extension'),
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

// ==================== PAYMENT VALIDATIONS ====================

// Validation for payment creation
export const validatePaymentCreate = [
  body('tenant')
    .isMongoId()
    .withMessage('Valid tenant ID is required'),

  body('room')
    .isMongoId()
    .withMessage('Valid room ID is required'),

  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),

  body('paymentType')
    .isIn(['rent', 'deposit', 'utility', 'maintenance', 'penalty', 'other'])
    .withMessage('Payment type must be one of: rent, deposit, utility, maintenance, penalty, other'),

  body('paymentMethod')
    .isIn(['cash', 'bank_transfer', 'check', 'credit_card', 'debit_card', 'digital_wallet', 'money_order'])
    .withMessage('Payment method must be one of: cash, bank_transfer, check, credit_card, debit_card, digital_wallet, money_order'),

  body('paymentDate')
    .optional()
    .isISO8601()
    .withMessage('Payment date must be a valid date'),

  body('dueDate')
    .isISO8601()
    .withMessage('Due date is required and must be a valid date'),

  body('status')
    .optional()
    .isIn(['paid', 'pending', 'overdue'])
    .withMessage('Status must be one of: paid, pending, overdue'),

  body('periodCovered.startDate')
    .optional()
    .isISO8601()
    .withMessage('Period start date must be a valid date'),

  body('periodCovered.endDate')
    .optional()
    .isISO8601()
    .withMessage('Period end date must be a valid date')
    .custom((value, { req }) => {
      if (value && req.body.periodCovered?.startDate && new Date(value) <= new Date(req.body.periodCovered.startDate)) {
        throw new Error('Period end date must be after start date');
      }
      return true;
    }),

  body('receiptNumber')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Receipt number must be between 1 and 50 characters'),

  body('transactionReference')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Transaction reference must be between 1 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),

  body('lateFee.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Late fee amount must be a positive number'),

  body('lateFee.reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Late fee reason must not exceed 200 characters'),

  body('lateFee.isLatePayment')
    .optional()
    .isBoolean()
    .withMessage('Late payment flag must be a boolean'),
];

// Validation for payment update
export const validatePaymentUpdate = [
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),

  body('paymentType')
    .optional()
    .isIn(['rent', 'deposit', 'utility', 'maintenance', 'penalty', 'other'])
    .withMessage('Payment type must be one of: rent, deposit, utility, maintenance, penalty, other'),

  body('paymentMethod')
    .optional()
    .isIn(['cash', 'bank_transfer', 'check', 'credit_card', 'debit_card', 'digital_wallet', 'money_order'])
    .withMessage('Payment method must be one of: cash, bank_transfer, check, credit_card, debit_card, digital_wallet, money_order'),

  body('paymentDate')
    .optional()
    .isISO8601()
    .withMessage('Payment date must be a valid date'),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),

  body('status')
    .optional()
    .isIn(['paid', 'pending', 'overdue'])
    .withMessage('Status must be one of: paid, pending, overdue'),

  body('periodCovered.startDate')
    .optional()
    .isISO8601()
    .withMessage('Period start date must be a valid date'),

  body('periodCovered.endDate')
    .optional()
    .isISO8601()
    .withMessage('Period end date must be a valid date')
    .custom((value, { req }) => {
      if (value && req.body.periodCovered?.startDate && new Date(value) <= new Date(req.body.periodCovered.startDate)) {
        throw new Error('Period end date must be after start date');
      }
      return true;
    }),

  body('receiptNumber')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Receipt number must be between 1 and 50 characters'),

  body('transactionReference')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Transaction reference must be between 1 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),

  body('lateFee.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Late fee amount must be a positive number'),

  body('lateFee.reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Late fee reason must not exceed 200 characters'),

  body('lateFee.isLatePayment')
    .optional()
    .isBoolean()
    .withMessage('Late payment flag must be a boolean'),
];

// Validation for mark payment as paid
export const validateMarkPaymentPaid = [
  body('transactionReference')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Transaction reference must be between 1 and 100 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
];

// ==================== REPORT VALIDATIONS ====================

// Validation for report creation
export const validateReportCreate = [
  body('tenant')
    .optional()
    .isMongoId()
    .withMessage('Valid tenant ID is required'),

  body('room')
    .isMongoId()
    .withMessage('Valid room ID is required'),

  body('type')
    .isIn(['maintenance', 'complaint', 'other'])
    .withMessage('Type must be either maintenance or complaint'),

  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
];

// Validation for report update (status change only)
export const validateReportUpdate = [
  body('status')
    .isIn(['pending', 'in-progress', 'resolved', 'rejected'])
    .withMessage('Status must be one of: pending, in-progress, resolved, rejected'),
];

// ==================== NOTIFICATION VALIDATIONS ====================

// Validation for announcement creation
// Validation for report assignment
export const validateReportAssignment = [
  body('assignedTo')
    .isMongoId()
    .withMessage('Valid user ID is required for assignment'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
];

// Validation for report resolution
export const validateReportResolution = [
  body('resolutionNotes')
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Resolution notes must be between 5 and 1000 characters'),

  body('actualCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Actual cost must be a positive number'),
];

// Validation for report rejection
export const validateReportRejection = [
  body('rejectionReason')
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Rejection reason must be between 5 and 1000 characters'),
];

// Validation for contract generation
export const validateContractGeneration = [
  body('tenantId')
    .isMongoId()
    .withMessage('Valid tenant ID is required'),

  body('roomId')
    .isMongoId()
    .withMessage('Valid room ID is required'),

  body('leaseDurationMonths')
    .isInt({ min: 1, max: 60 })
    .withMessage('Lease duration must be between 1 and 60 months'),

  body('leaseStartDate')
    .isISO8601()
    .withMessage('Lease start date is required and must be a valid date'),

  body('monthlyRent')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monthly rent must be a positive number'),

  body('securityDeposit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Security deposit must be a positive number'),

  body('landlordName')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Landlord name must be between 3 and 100 characters'),

  body('landlordAddress')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Landlord address must be between 10 and 200 characters'),

  body('specialTerms')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Special terms must not exceed 1000 characters'),
];

// ==================== ANNOUNCEMENT VALIDATIONS ====================

// Validation for announcement creation
export const validateAnnouncementCreate = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),

  body('content')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be between 10 and 5000 characters'),

  body('audience')
    .optional()
    .isIn(['all', 'tenants', 'staff', 'admins', 'custom'])
    .withMessage('Audience must be one of: all, tenants, staff, admins, custom'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),

  body('publishDate')
    .optional()
    .isISO8601()
    .withMessage('Publish date must be a valid date'),

  body('targetUsers')
    .optional()
    .isArray()
    .withMessage('Target users must be an array'),

  body('targetUsers.*.user')
    .optional()
    .isMongoId()
    .withMessage('Each target user ID must be a valid MongoDB ObjectId'),

  body('targetUsers.*.userModel')
    .optional()
    .isIn(['User', 'Tenant'])
    .withMessage('User model must be either User or Tenant'),

  body('targetRooms')
    .optional()
    .isArray()
    .withMessage('Target rooms must be an array'),

  body('targetRooms.*')
    .optional()
    .isMongoId()
    .withMessage('Each target room ID must be a valid MongoDB ObjectId'),

  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),

  body('attachments.*.name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Attachment name must be between 1 and 255 characters'),

  body('attachments.*.url')
    .optional()
    .isURL()
    .withMessage('Attachment URL must be valid'),
];

// Validation for announcement update
export const validateAnnouncementUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),

  body('content')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be between 10 and 5000 characters'),

  body('audience')
    .optional()
    .isIn(['all', 'tenants', 'staff', 'admins', 'custom'])
    .withMessage('Audience must be one of: all, tenants, staff, admins, custom'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),

  body('publishDate')
    .optional()
    .isISO8601()
    .withMessage('Publish date must be a valid date'),

  body('targetUsers')
    .optional()
    .isArray()
    .withMessage('Target users must be an array'),

  body('targetRooms')
    .optional()
    .isArray()
    .withMessage('Target rooms must be an array'),

  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),
];