import express from 'express';
import {
  createReport,
  getReports,
  getReport,
  updateReport,
  deleteReport,
  createFollowUp
} from '../controllers/reportController.js';
import { protect, staffOrAdmin } from '../middleware/auth.js';
import {
  validateReportCreate,
  validateReportUpdate
} from '../middleware/validation.js';

const router = express.Router();

// Basic CRUD operations
router.route('/')
  .get(protect, getReports) // Both tenants and staff can get reports (filtered in controller)
  .post(protect, validateReportCreate, createReport);

router.route('/:id')
  .get(protect, getReport) // Allow tenants to view their own reports
  .put(protect, staffOrAdmin, validateReportUpdate, updateReport) // Only staff can update status
  .delete(protect, staffOrAdmin, deleteReport); // Only staff can delete

// Follow-up route for tenants
router.route('/:id/follow-up')
  .put(protect, createFollowUp); // Tenants can follow up on their resolved reports

export default router;