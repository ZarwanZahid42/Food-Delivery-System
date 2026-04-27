import connectDB from '@/lib/db';
import { User } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'customer') {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Get all restaurants
    const restaurants = await User.find({ 
      role: 'restaurant',
      'restaurantInfo.isOpen': true 
    }).select('-password -__v');

    return Response.json({
      success: true,
      data: restaurants
    });

  } catch (error) {
    console.error('Get restaurants error:', error);
    return Response.json(
      { success: false, message: 'Failed to get restaurants' },
      { status: 500 }
    );
  }
}