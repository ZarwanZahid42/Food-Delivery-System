const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://hassansardarjt525_db_user:aNImkjqVMcoAcxcd@cluster0.l4ujfel.mongodb.net/food_delivery';

// Define schemas
const UserSchema = new mongoose.Schema({
  email: String, password: String, name: String, phone: String, role: String,
  restaurantInfo: Object,
  address: String,
  driverInfo: Object,
  createdAt: { type: Date, default: Date.now }
});

const OrderSchema = new mongoose.Schema({
  customerId: mongoose.Types.ObjectId,
  restaurantId: mongoose.Types.ObjectId,
  driverId: mongoose.Types.ObjectId,
  items: Array,
  totalAmount: Number,
  deliveryAddress: String,
  status: String,
  statusHistory: Array,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Order = mongoose.model('Order', OrderSchema);

async function createTestOrder() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find or create a restaurant
    let restaurant = await User.findOne({ email: 'pizza@test.com' });
    if (!restaurant) {
      restaurant = new User({
        email: 'pizza@test.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Pizza Place Owner',
        phone: '1234567890',
        role: 'restaurant',
        restaurantInfo: {
          name: 'Pizza Palace',
          address: '123 Food St',
          cuisine: 'Italian',
          isOpen: true
        }
      });
      await restaurant.save();
      console.log('✅ Created restaurant:', restaurant.restaurantInfo.name);
    }

    // Find or create a customer
    let customer = await User.findOne({ email: 'customer@test.com' });
    if (!customer) {
      customer = new User({
        email: 'customer@test.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test Customer',
        phone: '0987654321',
        role: 'customer',
        address: '456 Customer St'
      });
      await customer.save();
      console.log('✅ Created customer:', customer.name);
    }

    // Create a READY order (no driver assigned)
    const order = new Order({
      customerId: customer._id,
      restaurantId: restaurant._id,
      driverId: null, // Important: null means available for drivers
      items: [
        { name: 'Margherita Pizza', quantity: 2, price: 12.99 },
        { name: 'Coca Cola', quantity: 1, price: 2.99 }
      ],
      totalAmount: 28.97,
      deliveryAddress: customer.address,
      status: 'ready', // Important: must be 'ready' for drivers to see
      statusHistory: [
        { status: 'pending', updatedBy: 'customer', timestamp: new Date() },
        { status: 'accepted', updatedBy: 'restaurant', timestamp: new Date() },
        { status: 'ready', updatedBy: 'restaurant', timestamp: new Date() }
      ]
    });

    await order.save();
    console.log('\n🎉 TEST ORDER CREATED:');
    console.log('Order ID:', order._id);
    console.log('Status:', order.status);
    console.log('Driver assigned:', order.driverId ? 'Yes' : 'No (available!)');
    console.log('Total amount: $' + order.totalAmount);
    
    // Also create a picked_up order for testing
    const pickedUpOrder = new Order({
      customerId: customer._id,
      restaurantId: restaurant._id,
      driverId: null, // Will be assigned when driver accepts
      items: [{ name: 'Pepperoni Pizza', quantity: 1, price: 14.99 }],
      totalAmount: 14.99,
      deliveryAddress: customer.address,
      status: 'ready',
      statusHistory: [
        { status: 'pending', updatedBy: 'customer', timestamp: new Date() },
        { status: 'accepted', updatedBy: 'restaurant', timestamp: new Date() },
        { status: 'ready', updatedBy: 'restaurant', timestamp: new Date() }
      ]
    });
    
    await pickedUpOrder.save();
    console.log('\n✅ Second test order created (also ready)');
    console.log('Order ID:', pickedUpOrder._id);

    console.log('\n📋 ORDERS FOR DRIVER DASHBOARD:');
    console.log('1.', order._id, '- $' + order.totalAmount, '- READY');
    console.log('2.', pickedUpOrder._id, '- $' + pickedUpOrder.totalAmount, '- READY');
    
    console.log('\n🔗 Test URL: http://localhost:3000/dashboard/driver');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createTestOrder();