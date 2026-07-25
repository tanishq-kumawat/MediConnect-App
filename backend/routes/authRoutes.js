import express from 'express';
import {
  registerUser,
  loginUser,
  sendOTP,
  verifyOTP,
  googleLogin,
  getUserProfile,
  updateMedicalHistory
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/google-login', googleLogin);
router.get('/profile', protect, getUserProfile);
router.post('/medical-history', protect, updateMedicalHistory);

export default router;
