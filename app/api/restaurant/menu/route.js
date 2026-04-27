import connectDB from '@/lib/db';
import { MenuItem } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth';

// GET all menu items
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'restaurant') {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const menuItems = await MenuItem.find({ restaurantId: user.id });

    return Response.json({
      success: true,
      data: menuItems
    });

  } catch (error) {
    console.error('Get menu error:', error);
    return Response.json(
      { success: false, message: 'Failed to get menu' },
      { status: 500 }
    );
  }
}

// POST create new menu item
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'restaurant') {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    await connectDB();

    const menuItem = await MenuItem.create({
      ...data,
      restaurantId: user.id
    });

    return Response.json({
      success: true,
      message: 'Menu item created',
      data: menuItem
    });

  } catch (error) {
    console.error('Create menu item error:', error);
    return Response.json(
      { success: false, message: 'Failed to create menu item' },
      { status: 500 }
    );
  }
}

// PUT update menu item
export async function PUT(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'restaurant') {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    await connectDB();

    const menuItem = await MenuItem.findOneAndUpdate(
      { _id: data.id, restaurantId: user.id },
      data,
      { new: true }
    );

    if (!menuItem) {
      return Response.json(
        { success: false, message: 'Menu item not found' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: 'Menu item updated',
      data: menuItem
    });

  } catch (error) {
    console.error('Update menu item error:', error);
    return Response.json(
      { success: false, message: 'Failed to update menu item' },
      { status: 500 }
    );
  }
}

// DELETE menu item
export async function DELETE(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'restaurant') {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    await connectDB();

    const menuItem = await MenuItem.findOneAndDelete({
      _id: data.id,
      restaurantId: user.id
    });

    if (!menuItem) {
      return Response.json(
        { success: false, message: 'Menu item not found' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: 'Menu item deleted'
    });

  } catch (error) {
    console.error('Delete menu item error:', error);
    return Response.json(
      { success: false, message: 'Failed to delete menu item' },
      { status: 500 }
    );
  }
}