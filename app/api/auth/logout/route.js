import { clearAuthCookie } from '@/lib/auth';

export async function POST() {
  try {
    await clearAuthCookie();
    return Response.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    return Response.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    );
  }
}