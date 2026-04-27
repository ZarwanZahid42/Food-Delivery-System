import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: 6
  },
  name: { 
    type: String, 
    required: [true, 'Name is required'] 
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'] 
  },
  role: { 
    type: String, 
    required: true, 
    enum: ['customer', 'restaurant', 'driver'],
    default: 'customer'
  },
  
  // For all users
  profileImage: { type: String, default: '' },
  
  // Customer specific
  address: { 
    type: String, 
    default: '',
    required: function() { return this.role === 'customer'; }
  },
  
  // Restaurant specific
  restaurantInfo: {
    name: { 
      type: String, 
      default: '',
      required: function() { return this.role === 'restaurant'; }
    },
    address: { 
      type: String, 
      default: '',
      required: function() { return this.role === 'restaurant'; }
    },
    cuisine: { 
      type: String, 
      default: '',
      required: function() { return this.role === 'restaurant'; }
    },
    description: { type: String, default: '' },
    isOpen: { type: Boolean, default: true }
  },
  
  // Driver specific
  driverInfo: {
    vehicleType: { 
      type: String, 
      default: '',
      required: function() { return this.role === 'driver'; }
    },
    licensePlate: { 
      type: String, 
      default: '',
      required: function() { return this.role === 'driver'; }
    },
    isAvailable: { type: Boolean, default: true }
  },
  
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
// UserSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
  
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const MenuItemSchema = new mongoose.Schema({
  restaurantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  name: { 
    type: String, 
    required: [true, 'Menu item name is required'] 
  },
  description: { type: String, default: '' },
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: { 
    type: String, 
    default: 'Main Course',
    enum: ['Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Side Dish']
  },
  image: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  preparationTime: { type: Number, default: 20 }, // minutes
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const OrderSchema = new mongoose.Schema({
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  restaurantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  driverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null 
  },
  
  items: [{
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    name: { type: String, required: true },
    quantity: { 
      type: Number, 
      required: true, 
      min: [1, 'Quantity must be at least 1'] 
    },
    price: { 
      type: Number, 
      required: true, 
      min: [0, 'Price cannot be negative'] 
    }
  }],
  
  totalAmount: { 
    type: Number, 
    required: true, 
    min: [0, 'Total amount cannot be negative'] 
  },
  deliveryAddress: { 
    type: String, 
    required: [true, 'Delivery address is required'] 
  },
  
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'ready', 
           'picked_up', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  statusHistory: [{
    status: { type: String, required: true },
    updatedBy: { 
      type: String, 
      required: true,
      enum: ['customer', 'restaurant', 'driver', 'system']
    },
    note: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Driver actions
  pickedUpTime: { type: Date, default: null },
  deliveredTime: { type: Date, default: null },
  
  // Payment info
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'card', 'online'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  
  specialInstructions: { type: String, default: '' },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamps (use synchronous middleware without callback to avoid `next` issues)
OrderSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

MenuItemSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Create indexes
// `unique: true` is already set on the `email` field; avoid duplicate index declarations
UserSchema.index({ role: 1 });
MenuItemSchema.index({ restaurantId: 1 });
OrderSchema.index({ customerId: 1 });
OrderSchema.index({ restaurantId: 1 });
OrderSchema.index({ driverId: 1 });
OrderSchema.index({ status: 1 });

// Export models
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);