import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getNotifications, markAsRead } from '../controllers/notificationController.js';

const router = Router();

router.use(requireAuth);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);

export default router;
