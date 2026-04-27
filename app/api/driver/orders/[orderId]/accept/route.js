import connectDB from '@/lib/db';
import { Order } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request, { params }) {
  console.log("🔥 Accept Order - params (raw):", params);
  
  try {
    const user = await getCurrentUser();
    console.log("👤 Driver user:", user);
    
    if (!user || user.role !== 'driver') {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    // Await params if it's a Promise
    const resolvedParams = await params;
    const { orderId } = resolvedParams;
    console.log("📦 Resolved orderId:", orderId);
    
    const order = await Order.findById(orderId);
    console.log("🔍 Order found:", order ? `Yes (status: ${order.status})` : 'No');
    
    if (!order) {
      return Response.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Check if order is available
    console.log("📋 Order status check - current status:", order.status, "has driverId:", !!order.driverId);
    if (order.status !== 'ready' || order.driverId) {
      return Response.json(
        { success: false, message: 'Order not available' },
        { status: 400 }
      );
    }
    
    // Update order
    order.driverId = user.id;
    order.status = 'picked_up';
    order.statusHistory.push({
      status: 'picked_up',
      updatedBy: 'driver',
      note: 'Driver accepted the order'
    });
    
    await order.save();
    console.log("✅ Order accepted successfully");
    
    return Response.json({
      success: true,
      message: 'Order accepted successfully',
      data: order
    });
    
  } catch (error) {
    console.error('Accept order error:', error);
    return Response.json(
      { success: false, message: 'Failed to accept order' },
      { status: 500 }
    );
  }
}