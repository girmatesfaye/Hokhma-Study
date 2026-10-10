import { Request, Response, NextFunction } from 'express';

// Centralized error handling middleware for formatting API errors
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error('[API Server Error]:', err.message);

  res.status(statusCode).json({
    message: err.message || 'An unexpected internal server error occurred.',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

// 404 handler for undefined API routes
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
};
