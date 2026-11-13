import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { irrigationRequestSchema } from '../schemas/irrigationSchema.js';
import {
  recommendIrrigation,
  getIrrigationHistory,
  getIrrigationReportById,
  deleteIrrigationReport
} from '../controllers/irrigationController.js';

const router = Router();

router.use(requireAuth);

router.post('/recommend', aiLimiter, validate(irrigationRequestSchema), recommendIrrigation);
router.get('/history', getIrrigationHistory);
router.get('/:id', getIrrigationReportById);
router.delete('/:id', deleteIrrigationReport);

export default router;
