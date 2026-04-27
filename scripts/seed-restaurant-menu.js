const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://hassansardarjt525_db_user:aNImkjqVMcoAcxcd@cluster0.l4ujfel.mongodb.net/food_delivery';

// Define schemas
const UserSchema = new mongoose.Schema({
  email: String, password: String, name: String, phone: String, role: String,
  restaurantInfo: Object,
  createdAt: { type: Date, default: Date.now }
});

const MenuItemSchema = new mongoose.Schema({
  restaurantId: mongoose.Types.ObjectId,
  name: String, description: String, price: Number,
  category: String, isAvailable: Boolean,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const MenuItem = mongoose.model('MenuItem', MenuItemSchema);

async function seedRestaurantMenu() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if restaurant already exists
    let restaurant = await User.findOne({ email: 'pizza@test.com' });
    
    if (!restaurant) {
      // Create restaurant
      restaurant = new User({
        email: 'pizza@test.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Pizza Palace Owner',
        phone: '1234567890',
        role: 'restaurant',
        restaurantInfo: {
          name: 'Pizza Palace',
          address: '123 Pizza Street, Food City',
          cuisine: 'Italian',
          description: 'Best pizza in town with fresh ingredients',
          isOpen: true
        }
      });
      await restaurant.save();
      console.log('✅ Created restaurant:', restaurant.restaurantInfo.name);
    }

    // Clear existing menu items for this restaurant
    await MenuItem.deleteMany({ restaurantId: restaurant._id });
    console.log('✅ Cleared existing menu items');

    // Create menu items
    const menuItems = [
      {
        name: 'Margherita Pizza',
        description: 'Classic cheese pizza with fresh basil and mozzarella',
        price: 12.99,
        category: 'Pizza',
        isAvailable: true
      },
      {
        name: 'Pepperoni Pizza',
        description: 'Spicy pepperoni with extra cheese',
        price: 14.99,
        category: 'Pizza',
        isAvailable: true
      },
      {
        name: 'BBQ Chicken Pizza',
        description: 'Grilled chicken, BBQ sauce, red onions',
        price: 16.99,
        category: 'Pizza',
        isAvailable: true
      },
      {
        name: 'Garlic Bread',
        description: 'Fresh baked bread with garlic butter',
        price: 5.99,
        category: 'Appetizers',
        isAvailable: true
      },
      {
        name: 'Chicken Wings',
        description: 'Crispy wings with buffalo sauce',
        price: 11.99,
        category: 'Appetizers',
        isAvailable: true
      },
      {
        name: 'Caesar Salad',
        description: 'Fresh romaine with Caesar dressing and croutons',
        price: 8.99,
        category: 'Salads',
        isAvailable: true
      },
      {
        name: 'Coca Cola',
        description: '500ml can',
        price: 2.99,
        category: 'Beverages',
        isAvailable: true
      },
      {
        name: 'Lemonade',
        description: 'Fresh squeezed lemonade',
        price: 3.99,
        category: 'Beverages',
        isAvailable: true
      },
      {
        name: 'Chocolate Brownie',
        description: 'Warm chocolate brownie with vanilla ice cream',
        price: 6.99,
        category: 'Desserts',
        isAvailable: true
      }
    ];

    for (const itemData of menuItems) {
      const menuItem = new MenuItem({
        ...itemData,
        restaurantId: restaurant._id
      });
      await menuItem.save();
      console.log(`✅ Added: ${itemData.name} - $${itemData.price}`);
    }

    console.log('\n🎉 Restaurant menu seeded successfully!');
    console.log(`\nRestaurant ID: ${restaurant._id}`);
    console.log('Test restaurant: pizza@test.com / password123');
    console.log('\nVisit: http://localhost:3000/restaurant/' + restaurant._id);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedRestaurantMenu();