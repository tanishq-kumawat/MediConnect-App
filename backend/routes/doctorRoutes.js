import express from 'express';
import { getDoctors, getDoctorById, getSpecializations } from '../controllers/doctorController.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/specializations', getSpecializations);
router.get('/:id', getDoctorById);

export default router;
