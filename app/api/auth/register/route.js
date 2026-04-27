import connectDB from '@/lib/db';
import { User } from '@/lib/models';
import { generateToken, setAuthCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';




export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    
    console.log('📝 Registration attempt:', {
      email: data.email,
      role: data.role,
      hasPassword: !!data.password
    });
    
    // Check if user exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      console.log('❌ User already exists:', data.email);
      return Response.json(
        { success: false, message: 'User already exists' },
        { status: 400 }
      );
    }
    
    // Validate required fields
    const required = ['email', 'password', 'name', 'phone', 'role'];
    for (const field of required) {
      if (!data[field]) {
        console.log('❌ Missing field:', field);
        return Response.json(
          { success: false, message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Create user
    console.log('Creating user...');

    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);
    const user = await User.create(data);
    console.log('✅ User created:', user.email);
    
    // Generate token
    const token = generateToken(user);
    await setAuthCookie(token);
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return Response.json({
      success: true,
      message: 'Registration successful',
      user: userResponse
    });
    
  } catch (error) {
    console.error('❌ Registration error details:', error);
    console.error('Error stack:', error.stack);
    
    return Response.json(
      { 
        success: false, 
        message: 'Registration failed',
        error: error.message,
        errorCode: error.code
      },
      { status: 500 }
    );
  }
}