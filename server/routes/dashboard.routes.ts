import { Router } from 'express';
import { getStats } from '../controllers/dashboard.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/stats', authenticateToken, getStats);

export default router;