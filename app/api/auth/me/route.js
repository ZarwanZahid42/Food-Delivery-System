import connectDB from '@/lib/db';
import { User } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    console.log('🔐 Auth me endpoint called');
    
    const currentUser = await getCurrentUser();
    console.log('Current user from token:', currentUser ? 'Exists' : 'Null');
    
    if (!currentUser) {
      console.log('❌ No user token found');
      return Response.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    console.log('User ID from token:', currentUser.id);
    
    await connectDB();
    console.log('✅ DB connected');
    
    const user = await User.findById(currentUser.id).select('-password');
    
    if (!user) {
      console.log('❌ User not found in database');
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ User found:', user.email);
    
    return Response.json({
      success: true,
      user
    });
    
  } catch (error) {
    console.error('❌ GET /api/auth/me ERROR:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return Response.json(
      { 
        success: false, 
        message: 'Failed to get user',
        error: error.message 
      },
      { status: 500 }
    );
  }
}