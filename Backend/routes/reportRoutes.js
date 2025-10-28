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

router.route('/')
  .get(protect, getReports)
  .post(protect, validateReportCreate, createReport);

router.route('/:id')
  .get(protect, getReport)
  .put(protect, staffOrAdmin, validateReportUpdate, updateReport)
  .delete(protect, staffOrAdmin, deleteReport);

router.route('/:id/follow-up')
  .put(protect, createFollowUp);

export default router;