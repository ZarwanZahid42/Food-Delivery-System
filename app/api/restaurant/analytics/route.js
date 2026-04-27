import connectDB from '@/lib/db';
import { Order } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'restaurant') {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days')) || 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get orders in date range
    const orders = await Order.find({
      restaurantId: user.id,
      createdAt: { $gte: startDate },
      status: { $in: ['delivered', 'cancelled'] }
    });

    // Calculate analytics
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    
    const totalRevenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, order) => sum + order.totalAmount, 0);

    // Group by status
    const statusCounts = await Order.aggregate([
      {
        $match: { restaurantId: user.id }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    return Response.json({
      success: true,
      data: {
        summary: {
          totalOrders,
          completedOrders,
          cancelledOrders,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          completionRate: totalOrders > 0 ? 
            parseFloat(((completedOrders / totalOrders) * 100).toFixed(2)) : 0
        },
        statusCounts,
        recentOrders: orders.slice(0, 10)
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return Response.json(
      { success: false, message: 'Failed to get analytics' },
      { status: 500 }
    );
  }
}