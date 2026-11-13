/**
 * Structured application logger
 */
export const logger = {
  info: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[INFO] [${timestamp}] ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
  },
  warn: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.warn(`[WARN] [${timestamp}] ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
  },
  error: (message, error = {}) => {
    const timestamp = new Date().toISOString();
    const errorDetails = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error;
    console.error(`[ERROR] [${timestamp}] ${message}`, JSON.stringify(errorDetails));
  },
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      console.debug(`[DEBUG] [${timestamp}] ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
    }
  }
};
