import { body } from 'express-validator';

export const validateRoomCreate = [
  body('roomNumber').trim().isLength({ min: 1, max: 10 }).withMessage('Room number is required and must not exceed 10 characters').matches(/^[a-zA-Z0-9\-]+$/).withMessage('Room number can only contain letters, numbers, and hyphens'),
  body('roomType').isIn(['single', 'double', 'triple', 'quad']).withMessage('Room type must be one of: single, double, triple, quad'),
  body('capacity').isInt({ min: 1, max: 4 }).withMessage('Capacity must be between 1 and 4'),
  body('monthlyRent').isFloat({ min: 0 }).withMessage('Monthly rent must be a positive number'),
  body('securityDeposit').optional().isFloat({ min: 0 }).withMessage('Security deposit must be a positive number'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  body('amenities').optional().isArray().withMessage('Amenities must be an array'),
  body('amenities.*').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Each amenity must be between 1 and 50 characters'),
  body('floor').optional().isInt({ min: 0 }).withMessage('Floor must be a non-negative integer'),
  body('area').optional().isFloat({ min: 1 }).withMessage('Area must be a positive number'),
  body('status').optional().isIn(['available', 'occupied', 'maintenance', 'unavailable']).withMessage('Status must be one of: available, occupied, maintenance, unavailable'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('images.*').optional().trim().isURL().withMessage('Each image must be a valid URL'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
  body('nextMaintenanceDate').optional().isISO8601().withMessage('Next maintenance date must be a valid date'),
];

export const validateRoomUpdate = [
  body('roomNumber').optional().trim().isLength({ min: 1, max: 10 }).withMessage('Room number must not exceed 10 characters').matches(/^[a-zA-Z0-9\-]+$/).withMessage('Room number can only contain letters, numbers, and hyphens'),
  body('roomType').optional().isIn(['single', 'double', 'triple', 'quad']).withMessage('Room type must be one of: single, double, triple, quad'),
  body('capacity').optional().isInt({ min: 1, max: 4 }).withMessage('Capacity must be between 1 and 4'),
  body('monthlyRent').optional().isFloat({ min: 0 }).withMessage('Monthly rent must be a positive number'),
  body('securityDeposit').optional().isFloat({ min: 0 }).withMessage('Security deposit must be a positive number'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  body('amenities').optional().isArray().withMessage('Amenities must be an array'),
  body('amenities.*').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Each amenity must be between 1 and 50 characters'),
  body('floor').optional().isInt({ min: 0 }).withMessage('Floor must be a non-negative integer'),
  body('area').optional().isFloat({ min: 1 }).withMessage('Area must be a positive number'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('images.*').optional().trim().isURL().withMessage('Each image must be a valid URL'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
  body('nextMaintenanceDate').optional().isISO8601().withMessage('Next maintenance date must be a valid date'),
];

export const validateTenantAssignment = [
  body('tenantId').isMongoId().withMessage('Valid tenant ID is required'),
  body('leaseStartDate').isISO8601().withMessage('Valid lease start date is required'),
  body('leaseEndDate').optional().isISO8601().withMessage('Lease end date must be a valid date').custom((value, { req }) => {
    if (value && req.body.leaseStartDate && new Date(value) <= new Date(req.body.leaseStartDate)) {
      throw new Error('Lease end date must be after start date');
    }
    return true;
  }),
  body('monthlyRent').optional().isFloat({ min: 0 }).withMessage('Monthly rent must be a positive number'),
  body('securityDeposit').optional().isFloat({ min: 0 }).withMessage('Security deposit must be a positive number'),
  body('contractFile').notEmpty().withMessage('Contract file is required').custom((value) => {
    const base64Regex = /^data:application\/pdf;base64,/;
    if (!base64Regex.test(value)) {
      throw new Error('Contract file must be a PDF file in base64 format');
    }
    const base64Data = value.split(',')[1];
    const sizeInBytes = (base64Data.length * 3) / 4;
    const maxSize = 10 * 1024 * 1024;
    if (sizeInBytes > maxSize) {
      throw new Error('Contract file size must not exceed 10MB');
    }
    return true;
  }),
  body('contractFileName').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Contract file name must be between 1 and 255 characters').matches(/\.pdf$/i).withMessage('Contract file must have .pdf extension'),
];

export const validateContractGeneration = [
  body('tenantId').isMongoId().withMessage('Valid tenant ID is required'),
  body('roomId').isMongoId().withMessage('Valid room ID is required'),
  body('leaseDurationMonths').isInt({ min: 1, max: 60 }).withMessage('Lease duration must be between 1 and 60 months'),
  body('leaseStartDate').isISO8601().withMessage('Lease start date is required and must be a valid date'),
  body('monthlyRent').optional().isFloat({ min: 0 }).withMessage('Monthly rent must be a positive number'),
  body('securityDeposit').optional().isFloat({ min: 0 }).withMessage('Security deposit must be a positive number'),
  body('landlordName').trim().isLength({ min: 3, max: 100 }).withMessage('Landlord name must be between 3 and 100 characters'),
  body('landlordAddress').trim().isLength({ min: 10, max: 200 }).withMessage('Landlord address must be between 10 and 200 characters'),
  body('specialTerms').optional().trim().isLength({ max: 1000 }).withMessage('Special terms must not exceed 1000 characters'),
];
