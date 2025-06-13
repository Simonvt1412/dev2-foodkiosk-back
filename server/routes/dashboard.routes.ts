import express from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = express.Router();

// All dashboard routes require authentication
router.use(requireAuth);

// Main dashboard page
router.get('/', dashboardController.getDashboard);

// Dashboard statistics API - for AJAX requests
router.get('/stats', dashboardController.getStats);

export default router;