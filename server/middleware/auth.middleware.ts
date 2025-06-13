import { Request, Response, NextFunction } from 'express';

// Authentication middleware
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // Check if user is authenticated in the session
  if (!req.session || !req.session.isAuthenticated) {
    console.log('⛔ Unauthorized access attempt, redirecting to login');
    return res.redirect('/auth/login');
  }
  
  // User is authenticated, proceed
  console.log('✅ User authenticated, proceeding to route');
  next();
};