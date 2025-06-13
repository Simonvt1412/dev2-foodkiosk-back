import { Request, Response, NextFunction } from 'express';

// Simple logger middleware
export const logger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log when the request completes
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} | ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  
  next();
};