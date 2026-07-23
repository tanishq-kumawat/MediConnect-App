import express from 'express';
import { handleSymptomTriage } from '../controllers/triageController.js';

const router = express.Router();

router.post('/check', handleSymptomTriage);

export default router;
