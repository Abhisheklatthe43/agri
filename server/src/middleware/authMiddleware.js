import { verifyAuthToken } from '../services/supabase/supabaseAdmin.js';
import { sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication required. Missing Bearer token.', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return sendError(res, 'Invalid authorization format.', 401, 'UNAUTHORIZED');
    }

    const user = await verifyAuthToken(token);
    req.user = user;
    next();
  } catch (error) {
    logger.warn('Unauthorized request rejected', { error: error.message, path: req.originalUrl });
    return sendError(res, error.message || 'Invalid or expired token', 401, 'UNAUTHORIZED');
  }
};
