import { sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled request exception', {
    method: req.method,
    url: req.originalUrl,
    message: err.message,
    stack: err.stack
  });

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 'Uploaded image exceeds maximum allowed size (8MB).', 413, 'FILE_TOO_LARGE');
    }
    return sendError(res, `File upload error: ${err.message}`, 400, 'UPLOAD_ERROR');
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational || process.env.NODE_ENV === 'development'
    ? err.message
    : 'An unexpected internal server error occurred. Please try again.';

  return sendError(res, message, statusCode, err.code || 'INTERNAL_ERROR');
};

export const notFoundHandler = (req, res) => {
  return sendError(res, `API route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND');
};
