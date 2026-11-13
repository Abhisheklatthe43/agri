import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { sendError } from '../utils/apiResponse.js';

// General API Rate Limiter: 100 requests per 15 minutes per IP
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(res, 'Too many requests from this IP, please try again later.', 429, 'RATE_LIMIT_EXCEEDED');
  }
});

// Dedicated AI Execution Rate Limiter: Configured via AI_RATE_LIMIT (requests per 15 minutes)
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.AI_RATE_LIMIT,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      'AI advisory request limit reached. Please wait a few minutes before submitting another analysis.',
      429,
      'AI_RATE_LIMIT_EXCEEDED'
    );
  }
});
