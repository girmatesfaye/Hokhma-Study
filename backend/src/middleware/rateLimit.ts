import rateLimit from 'express-rate-limit';

// Shared factory so every route builds its rate limiter with the same options.
export const makeLimiter = (windowMs: number, max: number, message: string) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message }
  });
