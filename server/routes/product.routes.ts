import { Router } from 'express';
import {
  getProducts,
  getProductsByCategory,
  addProduct,
  updateProduct,
  getProductStock
} from '../controllers/product.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getProducts);
router.get('/category/:category_id', getProductsByCategory);
router.get('/:id/stock', getProductStock);
router.post('/', authenticateToken, addProduct);
router.put('/:id', authenticateToken, updateProduct);

export default router;