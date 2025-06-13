import express from 'express';
import * as categoryController from '../controllers/category.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// Categories routes
router.get('/', categoryController.getCategories);
router.post('/', categoryController.addCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

// Combinations page
router.get('/combinations', categoryController.getCombinations);

export default router;