import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`AgriSmart AI Server listening on port ${PORT} [${env.NODE_ENV}]`);
  logger.info(`Health check available at http://localhost:${PORT}/api/v1/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection at:', { promise, reason });
});
