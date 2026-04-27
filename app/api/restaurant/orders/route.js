import connectDB from '@/lib/db';
import { Order } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth';

// GET restaurant orders
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
    const status = searchParams.get('status');
    
    const query = { restaurantId: user.id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('customerId', 'name phone address')
      .populate('driverId', 'name phone')
      .sort({ createdAt: -1 });

    return Response.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('Get restaurant orders error:', error);
    return Response.json(
      { success: false, message: 'Failed to get orders' },
      { status: 500 }
    );
  }
}

// PUT update order status
export async function PUT(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'restaurant') {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orderId, status } = await request.json();
    await connectDB();

    const order = await Order.findOne({
      _id: orderId,
      restaurantId: user.id
    });

    if (!order) {
      return Response.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Update status
    order.status = status;
    order.statusHistory.push({
      status,
      updatedBy: 'restaurant',
      note: `Status updated to ${status}`
    });

    await order.save();

    return Response.json({
      success: true,
      message: 'Order status updated',
      data: order
    });

  } catch (error) {
    console.error('Update order error:', error);
    return Response.json(
      { success: false, message: 'Failed to update order' },
      { status: 500 }
    );
  }
}