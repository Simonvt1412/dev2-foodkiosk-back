import { Router } from 'express';
import { supabase } from '../config/supabaseClient';
import { getOrders, getOrderDetail, placeOrder, updateOrderStatus } from '../controllers/order.controller';

const router = Router();

// API endpoint to get order items (for AJAX) - MUST be before /:id route
router.get('/:id/items', async (req, res) => {
  const { id } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        id,
        order_id,
        product_id,
        quantity,
        price_at_order,
        meal_group,
        created_at,
        product:products(
          id,
          name,
          type,
          price
        )
      `)
      .eq('order_id', id);
      
    if (error) {
      console.error('Error fetching order items:', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.json(data || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Er is een onverwachte fout opgetreden' });
  }
});

// Main routes
router.get('/', getOrders);
router.get('/:id', getOrderDetail);
router.post('/', placeOrder);
router.put('/:id/status', updateOrderStatus);

export default router;