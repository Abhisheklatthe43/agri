import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { chatRequestSchema } from '../schemas/chatSchema.js';
import {
  handleChatMessage,
  getConversations,
  getConversationMessages,
  deleteConversation
} from '../controllers/assistantController.js';

const router = Router();

router.use(requireAuth);

router.post('/chat', aiLimiter, validate(chatRequestSchema), handleChatMessage);
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversationMessages);
router.delete('/conversations/:id', deleteConversation);

export default router;
