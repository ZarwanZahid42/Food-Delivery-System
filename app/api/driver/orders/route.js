import connectDB from '@/lib/db';
import { Order } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth';

// GET driver's assigned orders
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
    const status = searchParams.get('status'); // active, completed, all
    
    const query = { driverId: user.id };
    
    if (status === 'active') {
      query.status = { $in: ['picked_up', 'ready'] };
    } else if (status === 'completed') {
      query.status = 'delivered';
    }

    const orders = await Order.find(query)
      .populate('restaurantId', 'restaurantInfo.name restaurantInfo.address')
      .populate('customerId', 'name phone address')
      .sort({ createdAt: -1 });

    return Response.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('Get driver orders error:', error);
    return Response.json(
      { success: false, message: 'Failed to get orders' },
      { status: 500 }
    );
  }
}