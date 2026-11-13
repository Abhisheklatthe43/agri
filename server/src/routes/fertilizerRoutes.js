import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { fertilizerRequestSchema } from '../schemas/fertilizerSchema.js';
import {
  recommendFertilizer,
  getFertilizerHistory,
  getFertilizerReportById,
  deleteFertilizerReport
} from '../controllers/fertilizerController.js';

const router = Router();

router.use(requireAuth);

router.post('/recommend', aiLimiter, validate(fertilizerRequestSchema), recommendFertilizer);
router.get('/history', getFertilizerHistory);
router.get('/:id', getFertilizerReportById);
router.delete('/:id', deleteFertilizerReport);

export default router;
