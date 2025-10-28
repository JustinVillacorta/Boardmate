import { body } from 'express-validator';

export const validateAnnouncementCreate = [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('content').trim().isLength({ min: 10, max: 5000 }).withMessage('Content must be between 10 and 5000 characters'),
  body('audience').optional().isIn(['all', 'tenants', 'staff', 'admins', 'custom']).withMessage('Audience must be one of: all, tenants, staff, admins, custom'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Priority must be one of: low, medium, high, urgent'),
  body('publishDate').optional().isISO8601().withMessage('Publish date must be a valid date'),
  body('targetUsers').optional().isArray().withMessage('Target users must be an array'),
  body('targetUsers.*.user').optional().isMongoId().withMessage('Each target user ID must be a valid MongoDB ObjectId'),
  body('targetUsers.*.userModel').optional().isIn(['User', 'Tenant']).withMessage('User model must be either User or Tenant'),
  body('targetRooms').optional().isArray().withMessage('Target rooms must be an array'),
  body('targetRooms.*').optional().isMongoId().withMessage('Each target room ID must be a valid MongoDB ObjectId'),
  body('attachments').optional().isArray().withMessage('Attachments must be an array'),
  body('attachments.*.name').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Attachment name must be between 1 and 255 characters'),
  body('attachments.*.url').optional().isURL().withMessage('Attachment URL must be valid'),
];

export const validateAnnouncementUpdate = [
  body('title').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('content').optional().trim().isLength({ min: 10, max: 5000 }).withMessage('Content must be between 10 and 5000 characters'),
  body('audience').optional().isIn(['all', 'tenants', 'staff', 'admins', 'custom']).withMessage('Audience must be one of: all, tenants, staff, admins, custom'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Priority must be one of: low, medium, high, urgent'),
  body('publishDate').optional().isISO8601().withMessage('Publish date must be a valid date'),
  body('targetUsers').optional().isArray().withMessage('Target users must be an array'),
  body('targetRooms').optional().isArray().withMessage('Target rooms must be an array'),
  body('attachments').optional().isArray().withMessage('Attachments must be an array'),
];
