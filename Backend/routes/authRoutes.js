import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  archiveAccount,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  validateUpdateDetails,
  validateUpdatePassword,
} from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes
router.use(protect); // All routes below are protected

router.post('/logout', logout);
router.get('/me', getMe);
router.put('/updatedetails', validateUpdateDetails, updateDetails);
router.put('/updatepassword', validateUpdatePassword, updatePassword);
router.delete('/archive', archiveAccount);

export default router;