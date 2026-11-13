import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import {
  uploadMiddleware,
  analyzeDisease,
  getDiseaseHistory,
  getDiseaseReportById,
  deleteDiseaseReport
} from '../controllers/diseaseController.js';

const router = Router();

router.use(requireAuth);

router.post('/analyze', aiLimiter, uploadMiddleware, analyzeDisease);
router.get('/history', getDiseaseHistory);
router.get('/:id', getDiseaseReportById);
router.delete('/:id', deleteDiseaseReport);

export default router;
