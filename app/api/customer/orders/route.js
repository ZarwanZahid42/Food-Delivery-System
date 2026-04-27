import connectDB from "@/lib/db";
import { Order, MenuItem, User } from "@/lib/models";
import { getCurrentUser } from "@/lib/auth";

// GET customer orders
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "customer") {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const orders = await Order.find({ customerId: user.id })
      .populate("restaurantId", "restaurantInfo.name restaurantInfo.address")
      .populate("driverId", "name phone")
      .sort({ createdAt: -1 });

    return Response.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return Response.json(
      { success: false, message: "Failed to get orders" },
      { status: 500 }
    );
  }
}

// POST create new order

export async function POST(request) {
  console.log("🔥 [API] POST /api/customer/orders HIT");

  try {
    const user = await getCurrentUser();
  

    if (!user || user.role !== "customer") {
      console.log("❌ Unauthorized user");
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    console.log("📩 Received Order Payload:", data);

    await connectDB();
    console.log("🔗 Database connected");

    // Validate required fields
    if (!data.restaurantId || !data.items || data.items.length === 0) {
      console.log("❌ Missing required fields:", data);
      return Response.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch restaurant
    console.log("🏪 Fetching Restaurant:", data.restaurantId);
    const restaurant = await User.findById(data.restaurantId).catch(err => {
      console.error("❌ Error querying User model:", err);
    });

    console.log("🏪 Restaurant result:", restaurant);

    if (!restaurant || restaurant.role !== "restaurant") {
      console.log("❌ Restaurant not found or not a restaurant");
      return Response.json(
        { success: false, message: "Restaurant not found" },
        { status: 404 }
      );
    }

    if (!restaurant.restaurantInfo?.isOpen) {
      console.log("❌ Restaurant is closed:", restaurant.restaurantInfo);
      return Response.json(
        { success: false, message: "Restaurant is currently closed" },
        { status: 400 }
      );
    }

    // Validate items and calculate total
    console.log("🛒 Validating items...");
    let totalAmount = 0;
    const itemsWithDetails = [];

    for (const item of data.items) {
      console.log("➡️ Checking item:", item);

      if (item.itemId) {
        const menuItem = await MenuItem.findOne({
          _id: item.itemId,
          restaurantId: data.restaurantId,
          isAvailable: true,
        }).catch(err => {
          console.error("❌ Error fetching MenuItem:", err);
        });

        console.log("📦 Menu item lookup result:", menuItem);

        if (!menuItem) {
          console.log(`❌ Menu item not available: ${item.name}`);
          return Response.json(
            { success: false, message: `Item ${item.name} is not available` },
            { status: 400 }
          );
        }

        itemsWithDetails.push({
          itemId: menuItem._id,
          name: menuItem.name,
          quantity: item.quantity,
          price: menuItem.price,
        });

        totalAmount += menuItem.price * item.quantity;
      } else {
        console.log("⚠️ Item does not include itemId, using direct data");
        itemsWithDetails.push({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        });
        totalAmount += item.price * item.quantity;
      }
    }

    console.log("💰 Total Amount Calculated:", totalAmount);

    if (totalAmount < 5) {
      console.log("❌ Order total too low");
      return Response.json(
        { success: false, message: "Minimum order amount is $5" },
        { status: 400 }
      );
    }

    // Creating order
    console.log("📝 Creating order document...");

    const order = await Order.create({
      customerId: user.id,
      restaurantId: data.restaurantId,
      items: itemsWithDetails,
      totalAmount,
      deliveryAddress: data.deliveryAddress || user.address,
      status: "pending",
      statusHistory: [
        {
          status: "pending",
          updatedBy: "customer",
          note: "Order placed",
        },
      ],
      paymentMethod: data.paymentMethod || "cash",
      paymentStatus: "pending",
      specialInstructions: data.specialInstructions || "",
    }).catch(err => {
      console.error("❌ Mongoose Order.create error:", err);
      throw err;
    });

    console.log("✅ Order created:", order);

    const populatedOrder = await Order.findById(order._id)
      .populate("restaurantId", "restaurantInfo.name restaurantInfo.address")
      .catch(err => {
        console.error("❌ Error populating order:", err);
      });

    console.log("📦 Final populated order:", populatedOrder);

    return Response.json(
      {
        success: true,
        message: "Order placed successfully",
        data: populatedOrder,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("🔥 Create order GENERAL ERROR:", error);
    return Response.json(
      { success: false, message: "Failed to place order" },
      { status: 500 }
    );
  }
}
