import { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';

// Types for order handling
interface PlaceOrderRequest {
  customer_name: string;
  meals: Meal[];
}

interface Meal {
  portion?: { id: number; quantity: number; price: number };
  pasta?: { id: number; quantity: number; price: number };
  sauce?: { id: number; quantity: number; price: number };
  extras?: Array<{ id: number; quantity: number; price: number }>;
}

interface OrderItem {
  order_id: number;
  product_id: number;
  quantity: number;
  price_at_order: number;
  meal_group: number;
}

// Get all orders
export const getOrders = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Fetching all orders...');
    
    // Get orders with basic details, no need for user_id
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('order_date', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching orders:', error);
      return res.status(500).json({ error: error.message });
    }
    
    console.log(`✅ Found ${orders?.length || 0} orders`);
    
    // Calculate details for each order
    const ordersWithDetails = await Promise.all(
      (orders || []).map(async (order) => {
        // Get items for each order
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('id, price_at_order, quantity')
          .eq('order_id', order.id);
          
        if (itemsError) {
          console.error(`❌ Error fetching items for order ${order.id}:`, itemsError);
        }
        
        const totalAmount = items ? 
          items.reduce((sum, item) => sum + (Number(item.price_at_order) * Number(item.quantity)), 0) : 0;
        
        return {
          ...order,
          items_count: items ? items.length : 0,
          total_amount: totalAmount
        };
      })
    );
    
    res.render('orders', { 
      page: 'orders', 
      orders: ordersWithDetails,
      order: null,
      items: null,
      meals: null
    });
  } catch (error) {
    console.error('❌ Unexpected error in getOrders:', error);
    res.status(500).render('error', { message: 'Er is een onverwachte fout opgetreden', error, page: 'error' });
  }
};

// Get specific order details
export const getOrderDetail = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    console.log(`🔍 Fetching details for order ${id}...`);
    
    // Get order details - without trying to access user_id
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (orderError || !order) {
      console.error('❌ Error fetching order:', orderError);
      return res.status(404).render('error', { message: 'Bestelling niet gevonden', error: orderError, page: 'error' });
    }
    
    // Get order items with product details
    const { data: items, error: itemsError } = await supabase
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
          category_id,
          price,
          description,
          image_url
        )
      `)
      .eq('order_id', id)
      .order('meal_group', { ascending: true });
    
    if (itemsError) {
      console.error('❌ Error fetching order items:', itemsError);
      return res.status(500).render('error', { message: 'Fout bij het laden van bestelling items', error: itemsError, page: 'error' });
    }
    
    // Group items by meal group
    const mealGroups = new Map();
    (items || []).forEach(item => {
      if (!item.meal_group) return;
      
      if (!mealGroups.has(item.meal_group)) {
        mealGroups.set(item.meal_group, []);
      }
      mealGroups.get(item.meal_group).push(item);
    });
    
    // Create meals from meal groups
    const meals = Array.from(mealGroups.entries()).map(([groupNumber, groupItems]) => {
      // Find portion, pasta, sauce and extras in this meal group
      const portion = groupItems.find(item => item.product && item.product.category_id === 1);
      const pasta = groupItems.find(item => item.product && item.product.category_id === 2);
      const sauce = groupItems.find(item => item.product && item.product.category_id === 3);
      const extras = groupItems.filter(item => item.product && item.product.category_id === 4);
      
      // Calculate total price for this meal
      const total = groupItems.reduce((sum, item) => sum + (Number(item.price_at_order) * Number(item.quantity)), 0);
      
      return {
        mealNumber: groupNumber,
        portion,
        pasta,
        sauce,
        extras,
        total,
        items: groupItems // Include all items for better display
      };
    }).sort((a, b) => a.mealNumber - b.mealNumber);
    
    // Calculate total order amount
    const totalOrderAmount = (items || []).reduce((sum, item) => 
      sum + (Number(item.price_at_order) * Number(item.quantity)), 0);
    
    // Add total amount to order object
    const orderWithTotal = {
      ...order,
      total_amount: totalOrderAmount
    };
    
    res.render('orders', { 
      page: 'orders', 
      orders: null,
      order: orderWithTotal,
      items: items || [],
      meals
    });
  } catch (error) {
    console.error('❌ Unexpected error in getOrderDetail:', error);
    res.status(500).render('error', { message: 'Er is een onverwachte fout opgetreden', error, page: 'error' });
  }
};

// Place a new order
export const placeOrder = async (req: Request<{}, {}, PlaceOrderRequest>, res: Response) => {
  try {
    const { customer_name, meals } = req.body;
    
    if (!meals || meals.length === 0) {
      return res.status(400).json({ error: 'Geen maaltijden opgegeven' });
    }
    
    // Create order without user_id
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_name,
        status: 'pending',
        order_date: new Date()
      }])
      .select()
      .single();
    
    if (orderError || !order) {
      console.error('❌ Error creating order:', orderError);
      return res.status(500).json({ error: 'Fout bij het aanmaken van bestelling' });
    }
    
    // Create order items for each meal
    const orderItems: OrderItem[] = [];
    meals.forEach((meal: Meal, mealIndex: number) => {
      const mealGroup = mealIndex + 1; // Start at 1
      
      // Add portion if selected
      if (meal.portion) {
        orderItems.push({
          order_id: order.id,
          product_id: meal.portion.id,
          quantity: meal.portion.quantity,
          price_at_order: meal.portion.price,
          meal_group: mealGroup
        });
      }
      
      // Add pasta if selected
      if (meal.pasta) {
        orderItems.push({
          order_id: order.id,
          product_id: meal.pasta.id,
          quantity: meal.pasta.quantity,
          price_at_order: meal.pasta.price,
          meal_group: mealGroup
        });
      }
      
      // Add sauce if selected
      if (meal.sauce) {
        orderItems.push({
          order_id: order.id,
          product_id: meal.sauce.id,
          quantity: meal.sauce.quantity,
          price_at_order: meal.sauce.price,
          meal_group: mealGroup
        });
      }
      
      // Add extras if selected
      if (meal.extras && meal.extras.length > 0) {
        meal.extras.forEach(extra => {
          orderItems.push({
            order_id: order.id,
            product_id: extra.id,
            quantity: extra.quantity,
            price_at_order: extra.price,
            meal_group: mealGroup
          });
        });
      }
    });
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      console.error('❌ Error creating order items:', itemsError);
      // Try to delete the created order since items failed
      await supabase.from('orders').delete().eq('id', order.id);
      return res.status(500).json({ error: 'Fout bij het aanmaken van bestelling items' });
    }
    
    res.status(201).json({ message: 'Bestelling succesvol geplaatst', order_id: order.id });
  } catch (error) {
    console.error('❌ Unexpected error in placeOrder:', error);
    res.status(500).json({ error: 'Er is een onverwachte fout opgetreden' });
  }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Ongeldige status' });
  }
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error updating order status:', error);
      return res.status(500).json({ error: error.message });
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Bestelling niet gevonden' });
    }
    
    res.json({ message: 'Status succesvol bijgewerkt', order: data });
  } catch (error) {
    console.error('❌ Unexpected error in updateOrderStatus:', error);
    res.status(500).json({ error: 'Er is een onverwachte fout opgetreden' });
  }
};