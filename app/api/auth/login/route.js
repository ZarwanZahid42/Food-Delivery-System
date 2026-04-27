import connectDB from '@/lib/db';
import { User } from '@/lib/models';
import { generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    const { email, password } = await request.json();
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return Response.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return Response.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check if user is active
    if (!user.isActive) {
      return Response.json(
        { success: false, message: 'Account is deactivated' },
        { status: 401 }
      );
    }
    
    // Generate token
    const token = generateToken(user);
    await setAuthCookie(token);
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return Response.json({
      success: true,
      message: 'Login successful',
      user: userResponse
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    );
  }
}