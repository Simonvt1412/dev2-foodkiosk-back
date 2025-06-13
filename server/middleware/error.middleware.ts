import { Request, Response, NextFunction } from 'express';

// Error handler middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Set locals, only providing error in development
  const isDev = process.env.NODE_ENV === 'development';
  
  console.error('❌ Application error:', err);
  
  // Render the error page
  res.status(err.status || 500);
  res.render('error', {
    message: 'Er is een fout opgetreden in de applicatie',
    error: isDev ? err : {},
    page: 'error',
    title: 'Fout - FoodKiosk'
  });
};