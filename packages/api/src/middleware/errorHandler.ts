import { Request, Response, NextFunction } from 'express';
import { ValidationError, NotFoundError, ServiceError } from '@aidvocacy/shared';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }

  if (err instanceof ServiceError) {
    return res.status(503).json({ error: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors
    });
  }

  // Default error
  res.status(500).json({ error: 'Internal server error' });
}
