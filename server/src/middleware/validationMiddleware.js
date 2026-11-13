import { sendError } from '../utils/apiResponse.js';

/**
 * Zod validation middleware for body, query, or params
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[source];
    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      const formattedErrors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message
      }));

      const primaryMessage = formattedErrors.length > 0 
        ? `${formattedErrors[0].field}: ${formattedErrors[0].message}`
        : 'Validation failed';

      return sendError(
        res,
        primaryMessage,
        400,
        'VALIDATION_ERROR',
        formattedErrors
      );
    }

    // Replace with parsed/sanitized data
    req[source] = result.data;
    next();
  };
};
