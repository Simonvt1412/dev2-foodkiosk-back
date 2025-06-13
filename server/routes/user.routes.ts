import express from 'express';
import { requireAuth } from '../middleware/auth.middleware';

const router = express.Router();

// All user routes require authentication
router.use(requireAuth);

// Basic routes stub
router.get('/', (req, res) => {
  res.render('users/index', { 
    page: 'users',
    title: 'Gebruikers'
  });
});

export default router;