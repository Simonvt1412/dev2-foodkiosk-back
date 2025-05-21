import { Router } from 'express';
import { getCategories, addCategory } from '../controllers/category.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticateToken, addCategory);

export default router;