import { Request, Response, NextFunction } from 'express';

interface MongoError extends Error {
  code?: number;
  name: string;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string }>;
}

// Redact any sensitive tokens or secrets before logging
const sanitizeLogMessage = (msg: string): string => {
  return msg.replace(/Bearer\s+[A-Za-z0-9-_=.]+/gi, 'Bearer [REDACTED]');
};

// Centralized error handling middleware for formatting and securing API errors
export const errorHandler = (
  err: Error | MongoError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Safe sanitized error logging
  const safeMessage = sanitizeLogMessage(err.message || 'Unknown error');
  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, safeMessage);

  // 1. Handle CORS policy access denial
  if (err.message && err.message.includes('CORS')) {
    res.status(403).json({
      message: 'Access denied by Cross-Origin Resource Sharing (CORS) security policy.'
    });
    return;
  }

  // 2. Handle Mongoose Schema Validation errors
  if (err.name === 'ValidationError' && 'errors' in err && err.errors) {
    const errorDetails = Object.values(err.errors).map((e) => e.message);
    res.status(400).json({
      message: 'Database schema validation failed.',
      errors: errorDetails
    });
    return;
  }

  // 3. Handle Mongoose CastError (e.g. invalid ObjectID format)
  if (err.name === 'CastError') {
    res.status(400).json({
      message: 'Resource identifier format is invalid.'
    });
    return;
  }

  // 4. Handle MongoDB Duplicate Key (E11000) Conflict
  if ('code' in err && err.code === 11000) {
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
    res.status(409).json({
      message: `A resource with this ${field} already exists.`
    });
    return;
  }

  // 5. Default generic error status (prefer 500 if previous was 200)
  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    message: isProduction && statusCode === 500
      ? 'An unexpected internal server error occurred.'
      : err.message || 'An unexpected error occurred.',
    stack: isProduction ? undefined : err.stack
  });
};

// 404 handler for undefined API routes
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
};
