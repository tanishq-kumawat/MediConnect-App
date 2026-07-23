import express from 'express';
import {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  getAppointmentById
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createAppointment);
router.get('/my-appointments', protect, getMyAppointments);
router.get('/doctor/:doctorId', protect, getDoctorAppointments);
router.patch('/:id/status', protect, updateAppointmentStatus);
router.get('/:id', protect, getAppointmentById);

export default router;
