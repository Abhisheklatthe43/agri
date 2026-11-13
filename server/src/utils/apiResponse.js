/**
 * Standard API Response helpers
 */
export const sendSuccess = (res, data = {}, message = 'Request completed successfully', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
};

export const sendError = (res, message = 'An error occurred', statusCode = 500, code = 'INTERNAL_ERROR', details = null) => {
  const payload = {
    success: false,
    error: {
      code,
      message
    }
  };

  if (details && process.env.NODE_ENV === 'development') {
    payload.error.details = details;
  }

  return res.status(statusCode).json(payload);
};
