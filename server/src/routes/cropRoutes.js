import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { cropRecommendationRequestSchema } from '../schemas/cropSchema.js';
import {
  recommendCrops,
  getRecommendations,
  getRecommendationById,
  deleteRecommendation
} from '../controllers/cropController.js';

const router = Router();

router.use(requireAuth);

router.post('/recommend', aiLimiter, validate(cropRecommendationRequestSchema), recommendCrops);
router.get('/recommendations', getRecommendations);
router.get('/recommendations/:id', getRecommendationById);
router.delete('/recommendations/:id', deleteRecommendation);

export default router;
