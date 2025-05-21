import { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';

export async function getOrders(req: Request, res: Response) {
  const { data, error } = await supabase.from('orders').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

export async function getOrderDetail(req: Request, res: Response) {
  const { id } = req.params;
  const { data: order, error } = await supabase.from('orders').select('*').eq('id', id).single();
  if (error || !order) return res.status(404).json({ error: 'Order niet gevonden' });

  const { data: items, error: itemsError } = await supabase.from('order_items').select('*').eq('order_id', id);
  if (itemsError) return res.status(500).json({ error: itemsError.message });

  res.json({ ...order, items });
}

export async function placeOrder(req: Request, res: Response) {
  const { user_id, items, customer_name } = req.body;
  const { data: order, error } = await supabase.from('orders').insert([{ user_id, customer_name, status: 'pending', order_date: new Date() }]).select().single();
  if (error) return res.status(500).json({ error: error.message });

  const orderItems = items.map((item: any) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price_at_order: item.price,
    created_at: new Date()
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) return res.status(500).json({ error: itemsError.message });

  res.status(201).json(order);
}