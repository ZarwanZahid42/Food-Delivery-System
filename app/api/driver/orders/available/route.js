import connectDB from '@/lib/db';
import { Order } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'driver') {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Get orders that are ready and not assigned to any driver
    const availableOrders = await Order.find({
      status: 'ready',
      driverId: null
    })
    .populate('restaurantId', 'restaurantInfo.name restaurantInfo.address')
    .populate('customerId', 'name phone address')
    .sort({ createdAt: -1 });

    return Response.json({
      success: true,
      data: availableOrders
    });

  } catch (error) {
    console.error('Get available orders error:', error);
    return Response.json(
      { success: false, message: 'Failed to get orders' },
      { status: 500 }
    );
  }
}