import connectDB from '@/lib/db';
import { Order } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(request, { params }) {
  console.log("🔥 Update Order Status - params (raw):", params);
  
  try {
    const user = await getCurrentUser();
    console.log("👤 Driver user:", user);
    
    if (!user || user.role !== 'driver') {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Await params if it's a Promise
    const resolvedParams = await params;
    const { orderId } = resolvedParams;
    console.log("📦 Resolved orderId:", orderId);
    
    const { status, note } = await request.json();
    console.log("📋 Requested status:", status, "Note:", note);
    
    await connectDB();

    const order = await Order.findOne({
      _id: orderId,
      driverId: user.id
    });
    console.log("🔍 Order found:", order ? `Yes (current status: ${order.status})` : 'No (not found or not assigned to driver)');

    if (!order) {
      return Response.json(
        { success: false, message: 'Order not found or not assigned to you' },
        { status: 404 }
      );
    }

    // Validate status transition
    const validTransitions = {
      'picked_up': ['delivered'],
      'delivered': [] // No further transitions
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return Response.json(
        { success: false, message: `Cannot change status from ${order.status} to ${status}` },
        { status: 400 }
      );
    } 

    // Update order
    order.status = status;
    order.statusHistory.push({
      status,
      updatedBy: 'driver',
      note: note || `Driver marked as ${status}`,
      timestamp: new Date()
    });

    if (status === 'delivered') {
      order.deliveredTime = new Date();
    }

    await order.save();

    return Response.json({
      success: true,
      message: 'Order status updated',
      data: order
    });

  } catch (error) {
    console.error('Update order status error:', error);
    return Response.json(
      { success: false, message: 'Failed to update order status' },
      { status: 500 }
    );
  }
}