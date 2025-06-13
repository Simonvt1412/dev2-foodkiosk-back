import express from 'express';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import categoryRoutes from './category.routes';
import dashboardRoutes from './dashboard.routes';
import authRoutes from './auth.routes';

const router = express.Router();

// Auth routes (no auth required)
router.use('/auth', authRoutes);

// All routes below require authentication (handled in respective route files)
router.use('/dashboard', dashboardRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/categories', categoryRoutes);

// Root route
router.get('/', (req, res) => {
  // If user is authenticated, redirect to dashboard
  if (req.session && req.session.isAuthenticated) {
    return res.redirect('/dashboard');
  }
  
  // Otherwise redirect to login
  res.redirect('/auth/login');
});

export default router;