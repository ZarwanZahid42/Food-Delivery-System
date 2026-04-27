'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { Package, CheckCircle, Clock, MapPin, Bike, DollarSign, TrendingUp, User } from 'lucide-react';

export default function DriverDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myActiveOrders, setMyActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedDeliveries: 0,
    availableDeliveries: 0,
    rating: 4.8
  });

  useEffect(() => {
    fetchUser();
    fetchAvailableOrders();
    fetchDriverStats();
  }, []);

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

  const fetchAvailableOrders = async () => {
    try {
      const response = await fetch('/api/driver/orders/available');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAvailableOrders(data.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const fetchDriverStats = async () => {
    try {
      // This would come from your API
      // For now, use mock data
      setTimeout(() => {
        setStats({
          totalEarnings: 245.50,
          completedDeliveries: 42,
          availableDeliveries: availableOrders.length,
          rating: 4.8
        });
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setLoading(false);
    }
  };

  const acceptOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/driver/orders/${orderId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: user.id })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Update local state
        setAvailableOrders(prev => prev.filter(order => order._id !== orderId));
        setMyActiveOrders(prev => [...prev, data.data]);
        alert('✅ Order accepted successfully!');
      } else {
        alert('Failed to accept order: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Accept order error:', error);
      alert('Failed to accept order');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
    const response = await fetch(`/api/driver/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            status,
            note: `Driver marked as ${status.replace('_', ' ')}`
        })
    });

      const data = await response.json();
      
      if (response.ok && data.success) {
        if (status === 'delivered') {
          // Remove from active orders when delivered
          setMyActiveOrders(prev => prev.filter(order => order._id !== orderId));
        } else {
          // Update status in active orders
          setMyActiveOrders(prev => 
            prev.map(order => 
              order._id === orderId 
                ? { ...order, status: status }
                : order
            )
          );
        }
        
        alert(`✅ Order marked as ${status.replace('_', ' ')}!`);
      } else {
        alert('Failed to update order: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Update status error:', error);
      alert('Failed to update order status');
    }
  };

  const calculateEarnings = (orderAmount) => {
    // Drivers earn 20% of order total
    return (orderAmount * 0.2).toFixed(2);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'picked_up':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} cartCount={0} showCart={false} />
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header user={user} cartCount={0} showCart={false} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name?.split(' ')[0]}! 🚴
              </h1>
              <p className="text-gray-600 text-lg">
                Ready to deliver some delicious food?
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Bike className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Vehicle</p>
                <p className="font-semibold">{user?.driverInfo?.vehicleType || 'Bike'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total Earnings */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-orange-100">Total Earnings</p>
                <h3 className="text-3xl font-bold mt-2">${stats.totalEarnings.toFixed(2)}</h3>
                <p className="text-orange-100 text-sm mt-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +$45 this week
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Completed Deliveries */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-green-100">Completed</p>
                <h3 className="text-3xl font-bold mt-2">{stats.completedDeliveries}</h3>
                <p className="text-green-100 text-sm mt-2">Deliveries completed</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Available Orders */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-2xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100">Available Now</p>
                <h3 className="text-3xl font-bold mt-2">{availableOrders.length}</h3>
                <p className="text-blue-100 text-sm mt-2">Ready for pickup</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Driver Rating */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-100">Your Rating</p>
                <h3 className="text-3xl font-bold mt-2">{stats.rating}/5</h3>
                <p className="text-purple-100 text-sm mt-2">⭐ Customer reviews</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Orders Column */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Available Orders</h2>
              <button
                onClick={fetchAvailableOrders}
                className="text-orange-600 hover:text-orange-800 font-medium"
              >
                Refresh
              </button>
            </div>

            {availableOrders.length > 0 ? (
              <div className="space-y-4">
                {availableOrders.map((order) => (
                  <div key={order._id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-5 h-5 text-orange-500" />
                          <span className="font-semibold">Order #{order._id.toString().substring(0, 8)}</span>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            READY
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{order.deliveryAddress?.substring(0, 30)}...</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-medium">${calculateEarnings(order.totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">${order.totalAmount?.toFixed(2)}</p>
                        <p className="text-gray-500 text-sm">
                          {order.items?.length || 0} items
                        </p>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="mb-6">
                      <p className="font-medium mb-2 text-gray-700">From: {order.restaurantId?.restaurantInfo?.name || 'Restaurant'}</p>
                      <div className="space-y-2">
                        {order.items?.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.name} × {item.quantity}</span>
                            <span className="text-gray-600">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <p className="text-sm text-gray-500">+{order.items.length - 3} more items</p>
                        )}
                      </div>
                    </div>

                    {/* Accept Button */}
                    <button
                      onClick={() => acceptOrder(order._id)}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold text-lg hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Accept Delivery • Earn ${calculateEarnings(order.totalAmount)}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No available orders</h3>
                <p className="text-gray-600 mb-6">All orders have been accepted or are being prepared</p>
                <div className="text-sm text-gray-500">
                  <Clock className="w-5 h-5 inline mr-2" />
                  Check back in a few minutes
                </div>
              </div>
            )}
          </div>

          {/* My Active Deliveries Column */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">My Active Deliveries</h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {myActiveOrders.length} active
              </span>
            </div>

            {myActiveOrders.length > 0 ? (
              <div className="space-y-4">
                {myActiveOrders.map((order) => (
                  <div key={order._id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-5 h-5 text-blue-500" />
                          <span className="font-semibold">Order #{order._id.toString().substring(0, 8)}</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="space-y-2 text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{order.deliveryAddress}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="text-sm">Customer: {order.customerId?.name || 'Customer'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">${calculateEarnings(order.totalAmount)}</p>
                        <p className="text-gray-500 text-sm">Your earnings</p>
                      </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`text-sm ${order.status === 'picked_up' || order.status === 'delivered' ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                          ✓ Picked Up
                        </div>
                        <div className={`text-sm ${order.status === 'delivered' ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                          ✓ Delivered
                        </div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            order.status === 'picked_up' ? 'w-1/2 bg-blue-500' : 
                            order.status === 'delivered' ? 'w-full bg-green-500' : 
                            'w-0'
                          }`}
                        ></div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {order.status === 'picked_up' ? (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'delivered')}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                          Mark as Delivered
                        </button>
                      ) : (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'picked_up')}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                          Mark as Picked Up
                        </button>
                      )}
                      
                      <button
                        onClick={() => router.push(`/driver/order/${order._id}`)}
                        className="px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center">
                <Bike className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No active deliveries</h3>
                <p className="text-gray-600 mb-6">Accept an available order to get started</p>
                <button
                  onClick={() => document.querySelector('[href="#available"]')?.scrollIntoView()}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg"
                >
                  View Available Orders
                </button>
              </div>
            )}

            {/* Quick Tips */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">💡</span> Delivery Tips
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Always verify the order with the restaurant before pickup
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Keep food containers upright during delivery
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Contact customer if you can't find the address
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Mark as delivered only after handing to customer
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Today's Earnings Summary */}
        <div className="mt-12 bg-white rounded-2xl p-8 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Today's Summary</h2>
            <span className="text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-orange-50 rounded-xl">
              <p className="text-orange-600 font-medium mb-2">Completed Today</p>
              <p className="text-3xl font-bold text-gray-900">3</p>
              <p className="text-gray-600 text-sm mt-2">deliveries</p>
            </div>
            
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <p className="text-green-600 font-medium mb-2">Earned Today</p>
              <p className="text-3xl font-bold text-gray-900">$24.75</p>
              <p className="text-gray-600 text-sm mt-2">total earnings</p>
            </div>
            
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <p className="text-blue-600 font-medium mb-2">Avg. Time</p>
              <p className="text-3xl font-bold text-gray-900">28min</p>
              <p className="text-gray-600 text-sm mt-2">per delivery</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-900 font-semibold">FoodDeliver Driver App</p>
              <p className="text-gray-600 text-sm">Earn on your schedule</p>
            </div>
            <div className="text-gray-600 text-sm">
              <p>© {new Date().getFullYear()} FoodDeliver. All rights reserved.</p>
              <p className="mt-1">Support: support@fooddeliver.com • (555) 123-4567</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}