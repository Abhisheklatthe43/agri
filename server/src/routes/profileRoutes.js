import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { updateProfileSchema } from '../schemas/profileSchema.js';
import { getProfile, updateProfile } from '../controllers/profileController.js';

const router = Router();

router.use(requireAuth);

router.get('/', getProfile);
router.put('/', validate(updateProfileSchema), updateProfile);

export default router;
