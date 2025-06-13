import { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';

// Main dashboard view
export const getDashboard = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Starting dashboard data fetch...');

    // Get all orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('order_date', { ascending: false }); // Changed from created_at to order_date

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError);
      throw new Error('Failed to fetch orders');
    }

    console.log('📊 Orders found:', orders?.length || 0);

    // Get order items to calculate product popularity
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*, product:products(name)'); // Changed from product:product_id to product:products

    if (itemsError) {
      console.error('❌ Error fetching order items:', itemsError);
      throw new Error('Failed to fetch order items');
    }

    console.log('📊 Order items found:', orderItems?.length || 0);

    // Process data
    const recentOrders = orders?.slice(0, 5) || [];
    
    // Calculate statistics
    const totalRevenue = orders?.reduce((sum, order) => sum + (parseFloat(order.total_price) || 0), 0) || 0;
    
    // Calculate sales by day - last 7 days
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    const salesByDay = last7Days.map(day => {
      // Use order_date instead of created_at, and handle time part
      const dayOrders = orders?.filter(order => {
        const orderDate = new Date(order.order_date).toISOString().split('T')[0];
        return orderDate === day;
      }) || [];
      
      const dayRevenue = dayOrders.reduce((sum, order) => sum + (parseFloat(order.total_price) || 0), 0);
      return {
        date: day,
        count: dayOrders.length,
        revenue: dayRevenue
      };
    });

    // Calculate popular products
    const productCounts = {};
    
    orderItems?.forEach(item => {
      const productId = item.product_id;
      const productName = item.product?.name || 'Unknown Product';
      
      if (!productCounts[productId]) {
        productCounts[productId] = { 
          name: productName, 
          quantity: 0,
          revenue: 0,
          details: ''
        };
      }
      
      productCounts[productId].quantity += item.quantity || 1;
      productCounts[productId].revenue += (parseFloat(item.price_at_order) * (item.quantity || 1));
    });
    
    const popularProducts = Object.values(productCounts)
      .sort((a: any, b: any) => b.quantity - a.quantity)
      .slice(0, 5)
      .map((product: any) => ({
        ...product,
        revenue: product.revenue.toFixed(2)
      }));

    console.log('📊 Rendering dashboard with processed data');

    // Get counts for orders today and this month
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    // Count orders from today
    const ordersToday = orders?.filter(order => {
      const orderDate = new Date(order.order_date);
      return orderDate >= todayStart;
    }).length || 0;
    
    // Count orders from current month
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const ordersThisMonth = orders?.filter(order => {
      const orderDate = new Date(order.order_date);
      return orderDate >= firstDayOfMonth;
    }).length || 0;
    
    // Calculate revenue today
    const todayRevenue = orders?.filter(order => {
      const orderDate = new Date(order.order_date);
      return orderDate >= todayStart;
    }).reduce((sum, order) => sum + (parseFloat(order.total_price) || 0), 0) || 0;
    
    // Calculate revenue this month
    const monthlyRevenue = orders?.filter(order => {
      const orderDate = new Date(order.order_date);
      return orderDate >= firstDayOfMonth;
    }).reduce((sum, order) => sum + (parseFloat(order.total_price) || 0), 0) || 0;
    
    // Calculate status distribution
    const statusDistribution = {
      pending: orders?.filter(order => order.status === 'pending').length || 0,
      in_progress: orders?.filter(order => order.status === 'in_progress').length || 0,
      completed: orders?.filter(order => order.status === 'completed').length || 0,
      cancelled: orders?.filter(order => order.status === 'cancelled').length || 0
    };

    // Render dashboard view with data
    res.render('dashboard', {
      page: 'dashboard',
      title: 'Dashboard',
      user: req.session.user,
      isAuthenticated: true,
      recentOrders,
      ordersToday,
      ordersThisMonth,
      todayRevenue: todayRevenue.toFixed(2),
      monthlyRevenue: monthlyRevenue.toFixed(2),
      statusDistribution,
      popularProducts,
      monthlyData: JSON.stringify(salesByDay),
      stats: {
        orderCount: orders?.length || 0,
        totalRevenue: totalRevenue.toFixed(2),
        averageOrderValue: orders?.length ? (totalRevenue / orders.length).toFixed(2) : '0.00',
        salesByDay,
        popularProducts
      }
    });
  } catch (error) {
    console.error('❌ Dashboard error:', error);
    res.status(500).render('error', {
      message: 'Er is een fout opgetreden bij het laden van het dashboard',
      error: process.env.NODE_ENV === 'development' ? error : {},
      page: 'error'
    });
  }
};

// API endpoint for dashboard statistics - for AJAX updates
export const getStats = async (req: Request, res: Response) => {
  try {
    // Get orders for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: todayOrders, error: todayError } = await supabase
      .from('orders')
      .select('*')
      .gte('order_date', today.toISOString()); // Changed from created_at to order_date
    
    if (todayError) throw todayError;
    
    // Calculate today's revenue
    const todayRevenue = todayOrders?.reduce((sum, order) => sum + (parseFloat(order.total_price) || 0), 0) || 0;
    
    // Return JSON response with stats
    res.json({
      success: true,
      stats: {
        todayOrderCount: todayOrders?.length || 0,
        todayRevenue: todayRevenue.toFixed(2)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dashboard statistics' 
    });
  }
};