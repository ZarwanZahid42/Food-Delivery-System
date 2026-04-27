import connectDB from '@/lib/db';
import { User, MenuItem } from '@/lib/models';

export async function GET(request, { params }) {
  try {
    console.log("🔥 GET MENU HIT");
    console.log("Params (raw):", params);

    // `params` can be a Promise in some Next.js versions/environments — await it to get the actual values
    const resolvedParams = await params;
    console.log("Params (resolved):", resolvedParams);

    const { restaurantId } = resolvedParams;

    if (!restaurantId) {
      console.log("❌ restaurantId missing");
      return Response.json({ success: false, message: "Missing restaurantId" }, { status: 400 });
    }

    await connectDB();

    // Check if restaurant exists
    const restaurant = await User.findById(restaurantId);

    console.log("Found restaurant:", restaurant ? restaurant._id : "NOT FOUND");

    if (!restaurant || restaurant.role !== 'restaurant') {
      return Response.json(
        { success: false, message: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Get menu
    const menuItems = await MenuItem.find({
      restaurantId,
      isAvailable: true
    });

    console.log(`🍕 ${menuItems.length} menu items found`);

    return Response.json({
      success: true,
      data: {
        restaurant: {
          _id: restaurant._id,
          ...restaurant.restaurantInfo,
          email: restaurant.email,
          phone: restaurant.phone
        },
        menuItems
      }
    });

  } catch (error) {
    console.error('❌ Get menu error:', error);
    return Response.json(
      { success: false, message: 'Failed to get menu' },
      { status: 500 }
    );
  }
}
