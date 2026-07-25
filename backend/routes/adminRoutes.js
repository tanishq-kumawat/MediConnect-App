import express from 'express';
import {
  getAdminStats,
  createDoctorByAdmin,
  deleteDoctorByAdmin,
  createHospitalByAdmin
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/stats', protect, admin, getAdminStats);
router.post('/doctors', protect, admin, createDoctorByAdmin);
router.delete('/doctors/:id', protect, admin, deleteDoctorByAdmin);
router.post('/hospitals', protect, admin, createHospitalByAdmin);

export default router;
