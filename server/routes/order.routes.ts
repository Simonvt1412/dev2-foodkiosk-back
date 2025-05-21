import { Router } from 'express';
import { getOrders, getOrderDetail, placeOrder } from '../controllers/order.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getOrders);
router.get('/:id', authenticateToken, getOrderDetail);
router.post('/', placeOrder);

export default router;