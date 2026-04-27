'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/app/components/Header';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { Star, Clock, ShoppingCart, Plus, Minus, ArrowLeft, Check } from 'lucide-react';

export default function RestaurantMenuPage() {
  const router = useRouter();
  const params = useParams();
  const restaurantId = params.id;

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchRestaurantDetails();
    fetchMenuItems();
  }, [restaurantId]);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const fetchRestaurantDetails = async () => {
    try {
      const response = await fetch(`/api/customer/restaurants`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const foundRestaurant = data.data.find(r => r._id === restaurantId);
          setRestaurant(foundRestaurant);
        }
      }
    } catch (error) {
      console.error('Failed to fetch restaurant:', error);
    }
  };

//fetchMenuItems function:
const fetchMenuItems = async () => {
  try {
    if (!restaurantId) {
      console.warn('fetchMenuItems: restaurantId is missing');
      setLoading(false);
      return;
    }
 
    const url = `/api/restaurant/${restaurantId}/menu`;
    console.log('Fetching menu from:', url);
    const response = await fetch(url);

    console.log('Menu API response status:', response.status);
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.warn('Failed to parse menu response as JSON, response text:', text);
    }

    if (response.ok && data?.success) {
      setRestaurant(data.data.restaurant);
      setMenuItems(data.data.menuItems);
    } else {
      // Fallback to mock data if API fails
      console.log('Using mock data — menu API returned non-ok or error', response.status, data);
      const mockMenuItems = [
        { _id: '1', name: 'Margherita Pizza', description: 'Classic cheese pizza with fresh basil', price: 12.99, category: 'Pizza', isAvailable: true },
        { _id: '2', name: 'Pepperoni Pizza', description: 'Spicy pepperoni with mozzarella', price: 14.99, category: 'Pizza', isAvailable: true },
        { _id: '3', name: 'BBQ Chicken Pizza', description: 'Grilled chicken with BBQ sauce', price: 16.99, category: 'Pizza', isAvailable: true },
        { _id: '4', name: 'Garlic Bread', description: 'Fresh baked bread with garlic butter', price: 5.99, category: 'Appetizers', isAvailable: true },
        { _id: '5', name: 'Caesar Salad', description: 'Fresh romaine with Caesar dressing', price: 8.99, category: 'Salads', isAvailable: true },
      ];
      setMenuItems(mockMenuItems);
    }
  } catch (error) {
    console.error('Failed to fetch menu items:', error);
    // Use mock data as fallback
    const mockMenuItems = [
      { _id: '1', name: 'Margherita Pizza', description: 'Classic cheese pizza with fresh basil', price: 12.99, category: 'Pizza', isAvailable: true },
      { _id: '2', name: 'Pepperoni Pizza', description: 'Spicy pepperoni with mozzarella', price: 14.99, category: 'Pizza', isAvailable: true },
    ];
    setMenuItems(mockMenuItems);
  } finally {
    setLoading(false);
  }
};

  const addToCart = (itemId) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const newQuantity = (prev[itemId] || 0) - 1;
      if (newQuantity <= 0) {
        const newCart = { ...prev };
        delete newCart[itemId];
        return newCart;
      }
      return {
        ...prev,
        [itemId]: newQuantity
      };
    });
  };

  const getCartQuantity = (itemId) => {
    return cart[itemId] || 0;
  };

  const getCartItems = () => {
    return Object.keys(cart).map(itemId => {
      const item = menuItems.find(m => m._id === itemId);
      return {
        ...item,
        quantity: cart[itemId],
        total: item.price * cart[itemId]
      };
    }).filter(item => item.quantity > 0);
  };

  const getCartTotal = () => {
    return getCartItems().reduce((total, item) => total + item.total, 0);
  };

  const getItemCount = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const placeOrder = async () => {
    if (!user) {
      alert('Please login to place an order');
      router.push('/login');
      return;
    }

    const cartItems = getCartItems();
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    try {
      const orderData = {
  customerId: user._id,       // <--- ADD THIS
  restaurantId: restaurantId,
  items: cartItems.map(item => ({
    itemId: item._id,
    name: item.name,
    quantity: item.quantity,
    price: item.price
  })),
  totalAmount: getCartTotal(),
  deliveryAddress: user.address || 'Please update address in profile'
};
      console.log('Placing order with data:', orderData);
      const response = await fetch('/api/customer/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        setOrderPlaced(true);
        setCart({});
        setTimeout(() => {
          router.push('/customer/orders');
        }, 2000);
      } else {
        alert('Failed to place order');
      }
    } catch (error) {
      console.error('Order error:', error);
      alert('Failed to place order');
    }
  };

  const categories = [...new Set(menuItems.map(item => item.category))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} cartCount={getItemCount()} />
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} cartCount={getItemCount()} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Restaurant not found</h2>
            <button
              onClick={() => router.push('/dashboard/customer')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Browse Restaurants
            </button>
          </div>
        </div>
      </div>
    );
  }

  const restaurantInfo = restaurant.restaurantInfo || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user} 
        cartCount={getItemCount()} 
        onCartClick={() => router.push('/customer/cart')}
      />

      {/* Order Placed Success Modal */}
      {orderPlaced && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h3>
            <p className="text-gray-600 mb-6">
              Your order has been received and is being prepared.
            </p>
            <p className="text-gray-500 text-sm">
              Redirecting to orders page...
            </p>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard/customer')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Restaurants
        </button>

        {/* Restaurant Header */}
        <div className="bg-white rounded-2xl p-8 mb-8 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
              <span className="text-4xl">
                {restaurantInfo.cuisine === 'Italian' ? '🍕' : 
                 restaurantInfo.cuisine === 'Chinese' ? '🥡' : 
                 restaurantInfo.cuisine === 'Indian' ? '🍛' : '🏪'}
              </span>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurantInfo.name}</h1>
                  <div className="flex items-center gap-4 text-gray-600">
                    <span className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      4.5 (120 reviews)
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-5 h-5" />
                      30-45 min
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      OPEN
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-gray-600">{restaurantInfo.cuisine} • {restaurantInfo.address}</p>
                  <p className="text-gray-500 text-sm mt-1">Min. order: $15.00</p>
                </div>
              </div>
              
              <p className="text-gray-700 mt-4">{restaurantInfo.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Items - Left 2/3 */}
          <div className="lg:col-span-2">
            {categories.map(category => {
              const categoryItems = menuItems.filter(item => item.category === category);
              
              return (
                <div key={category} className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b">{category}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {categoryItems.map(item => {
                      const quantity = getCartQuantity(item._id);
                      
                      return (
                        <div key={item._id} className="bg-white rounded-xl p-6 border border-gray-200">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.name}</h3>
                              <p className="text-gray-600 mb-4">{item.description}</p>
                              <p className="text-2xl font-bold text-gray-900">${item.price.toFixed(2)}</p>
                            </div>
                            
                            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center ml-4">
                              <span className="text-2xl">
                                {category === 'Pizza' ? '🍕' : 
                                 category === 'Appetizers' ? '🍟' : 
                                 category === 'Salads' ? '🥗' : 
                                 category === 'Beverages' ? '🥤' : 
                                 category === 'Desserts' ? '🍰' : '🍽️'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            {item.isAvailable ? (
                              <>
                                {quantity > 0 ? (
                                  <div className="flex items-center gap-4">
                                    <button
                                      onClick={() => removeFromCart(item._id)}
                                      className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200"
                                    >
                                      <Minus className="w-5 h-5" />
                                    </button>
                                    <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                                    <button
                                      onClick={() => addToCart(item._id)}
                                      className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center hover:bg-green-200"
                                    >
                                      <Plus className="w-5 h-5" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => addToCart(item._id)}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                                  >
                                    Add to Cart
                                  </button>
                                )}
                                <span className="text-green-600 font-medium">In Stock</span>
                              </>
                            ) : (
                              <span className="text-red-600 font-medium">Out of Stock</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary - Right 1/3 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold">Your Order</h2>
                <span className="ml-auto bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {getItemCount()} items
                </span>
              </div>
              
              {getItemCount() > 0 ? (
                <>
                  {/* Cart Items */}
                  <div className="max-h-96 overflow-y-auto mb-6">
                    {getCartItems().map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-3 border-b">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-gray-600 text-sm">${item.price.toFixed(2)} × {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${item.total.toFixed(2)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => removeFromCart(item._id)}
                              className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-sm"
                            >
                              -
                            </button>
                            <button
                              onClick={() => addToCart(item._id)}
                              className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${getCartTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="font-medium">$2.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (8%)</span>
                      <span className="font-medium">${(getCartTotal() * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>${(getCartTotal() + 2.99 + (getCartTotal() * 0.08)).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Instructions
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      rows="3"
                      placeholder="Any special requests or dietary restrictions?"
                    />
                  </div>

                  {/* Place Order Button */}
                  <button
                    onClick={placeOrder}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-xl"
                  >
                    Place Order • ${(getCartTotal() + 2.99 + (getCartTotal() * 0.08)).toFixed(2)}
                  </button>
                </>
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 text-sm">Add items from the menu to get started</p>
                </div>
              )}
              
              {/* Info */}
              <div className="mt-6 text-sm text-gray-500 space-y-2">
                <p>📍 Deliver to: {user?.address || 'Please update address in profile'}</p>
                <p>⏰ Estimated delivery: 30-45 minutes</p>
                <p>💳 Payment: Cash or card on delivery</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}