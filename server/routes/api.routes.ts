import express from 'express';

const router = express.Router();

// API root
router.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to the FoodKiosk API',
    version: '1.0.0',
    endpoints: [
      '/api/products',
      '/api/categories',
      '/api/orders'
    ]
  });
});

// Add more API routes here
// router.use('/products', require('./api/products.routes'));
// router.use('/categories', require('./api/categories.routes'));
// router.use('/orders', require('./api/orders.routes'));

export default router;