import connectDB from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    return Response.json({
      success: true,
      message: 'Database connected!',
      time: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}