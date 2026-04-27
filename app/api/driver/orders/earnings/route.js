import connectDB from '@/lib/db';
import { Order } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'driver') {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days')) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get delivered orders in date range
    const orders = await Order.find({
      driverId: user.id,
      status: 'delivered',
      deliveredTime: { $gte: startDate }
    }).sort({ deliveredTime: -1 });

    // Calculate earnings (simplified: 20% of order total)
    const earnings = orders.map(order => ({
      orderId: order._id,
      date: order.deliveredTime,
      orderAmount: order.totalAmount,
      earnings: order.totalAmount * 0.2, // 20% commission
      restaurant: order.restaurantId
    }));

    const totalEarnings = earnings.reduce((sum, e) => sum + e.earnings, 0);
    const totalDeliveries = orders.length;
    const avgEarnings = totalDeliveries > 0 ? totalEarnings / totalDeliveries : 0;

    return Response.json({
      success: true,
      data: {
        summary: {
          totalEarnings: parseFloat(totalEarnings.toFixed(2)),
          totalDeliveries,
          avgEarnings: parseFloat(avgEarnings.toFixed(2))
        },
        recentEarnings: earnings.slice(0, 20),
        allTimeStats: {
          // Get all-time stats
          totalOrders: await Order.countDocuments({ driverId: user.id, status: 'delivered' })
        }
      }
    });

  } catch (error) {
    console.error('Earnings error:', error);
    return Response.json(
      { success: false, message: 'Failed to get earnings' },
      { status: 500 }
    );
  }
}