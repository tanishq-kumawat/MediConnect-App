import express from 'express';
import { registerUser, loginUser, getUserProfile, updateMedicalHistory } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.post('/medical-history', protect, updateMedicalHistory);

export default router;
