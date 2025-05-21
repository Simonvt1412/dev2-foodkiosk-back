import { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';

export async function getStats(req: Request, res: Response) {
  // Orders today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data: ordersToday } = await supabase
    .from('orders')
    .select('id')
    .gte('order_date', today.toISOString());

  // Orders per month (last 12 months)
  const { data: orders } = await supabase.from('orders').select('order_date');
  const ordersPerMonth: { [key: string]: number } = {};
  if (orders) {
    orders.forEach((order: any) => {
      const month = order.order_date?.slice(0, 7); // YYYY-MM
      if (month) ordersPerMonth[month] = (ordersPerMonth[month] || 0) + 1;
    });
  }

  // Revenue per year
  const { data: orderItems } = await supabase.from('order_items').select('price_at_order, quantity, created_at');
  const revenuePerYear: { [key: string]: number } = {};
  if (orderItems) {
    orderItems.forEach((item: any) => {
      const year = item.created_at?.slice(0, 4);
      if (year) revenuePerYear[year] = (revenuePerYear[year] || 0) + (item.price_at_order * item.quantity);
    });
  }

  res.json({
    ordersToday: ordersToday?.length || 0,
    ordersPerMonth,
    revenuePerYear
  });
}